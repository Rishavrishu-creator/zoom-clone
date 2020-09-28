var express = require('express')
var app = express()
var server = require('http').Server(app);

var {ExpressPeerServer} = require('peer');

var ejs=require('ejs');
const {v4:uuidv4} = require('uuid')
var socket = require('socket.io');

app.use(express.static('public'))
app.use(express.json({limit:'1mb'}))
app.set('view engine','ejs');

var peerServer = ExpressPeerServer(server,{
    debug:true
});
app.use('/peerjs',peerServer);
var io = socket(server)
app.get('/',function(req,res){
    res.redirect('/'+uuidv4())
})
app.get('/:room',function(req,res){
    res.render("index",{'roomId':req.params.room})
    
})
var array=[]
var array2=[]
var names = []
io.on('connection',function(socket){
    console.log("Socket id :"+ socket.id)
    socket.on('give-data',function(data){
        array.push(socket.id)
        array2.push(socket.id)
        names.push(data.name)
        data.socket_id=socket.id;
        data.participants=array;
        data.names=names
        
            data.current=socket.id
        
        io.emit('message', data);
    })
    socket.on('join-room',function(roomId){
    
        
        socket.join(roomId);
       
        socket.to(roomId).broadcast.emit('user-connected',roomId)
         
        socket.on('chat-message',function(data){
            
            io.to(roomId).emit("chatts",data)
        })
        
        socket.on('come-privately',function(data){
            data.received_from=socket.id
            io.to(data.sender).emit("invite-request",data)
        })

        socket.on('decline',function(data){
            io.to(data.to).emit("declined-accepted",data)
        })

        socket.on('accept',function(data){
            data.accepted_by=socket.id
             io.to(socket.id).to(data.received_from).emit("accepted",data)
        })

        socket.on("private-message",function(data){
            data.received_from=socket.id
           
            io.to(data.sender).to(socket.id).emit("message-sent",data);
        })

        socket.on('disconnect', () => {
            var array1=[]
            var j=0;
            
            for(var i=0;i<array2.length;i++)
            {
                if(array2[i]==socket.id)
                {
                    array2.splice(i,1)
                    j=i
                    break
                }
            }
            
            array1.push(socket.id)
            var removed_name = names[j]
            roomId.removed=array1
            roomId.removed_name=removed_name
            if(array2.length==0)
            {
                array2=[]
                array1=[]
                array=[]
                names=[]
            }
            console.log(roomId)
            socket.to(roomId).broadcast.emit('user-disconnected', roomId)
          })
          
    })
    
})

server.listen(process.env.PORT||9000)

