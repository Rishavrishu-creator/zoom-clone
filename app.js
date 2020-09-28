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
var array3=[]
var array2=[]
var names = []
var array4=[]
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
            if(array4.includes(data.sender))
            {
                io.to(socket.id).emit("rejected",data)
            }
            else
            {
                array4.push(socket.id)
                array4.push(data.sender)
            data.received_from=socket.id
            io.to(data.sender).emit("invite-request",data)
            }

        })

        socket.on('decline',function(data){
            io.to(data.to).emit("declined-accepted",data)
        })

        socket.on('accept',function(data){
            var a = data.to
            var b= socket.id
            array3.push({
               "first":a,
               "second":b                
            })
            data.accepted_by=socket.id
             io.to(socket.id).emit("accepted",data)
        })

        socket.on("private-message",function(data){
            console.log(array3)
            
            for(var i=0;i<array3.length;i++)
            {
                if(array3[i]["first"]==socket.id)
                {
                    console.log(socket.id)
                    io.to(array3[i]["second"]).to(socket.id).emit("message-sent",data);
                    
                }
                if(array3[i]["second"]==socket.id)
                {
                    console.log(socket.id)
                    io.to(socket.id).to(array3[i]["first"]).emit("message-sent",data)
                
                }
            }
            
             /*
                var obj = Object.keys(array3[array3.length-1])
                 
                if(socket.id==array3[array3.length-1][obj[0]])
                {
                    io.to(array3[array3.length-1][obj[1]]).to(socket.id).emit("message-sent",data);
                }
                else{
                    io.to(socket.id).to(array3[array3.length-1][obj[0]]).emit("message-sent",data);
                }
               */ 
        })
       socket.on("private-close",function(data){

/*
        for(var i=0;i<array3.length;i++)
        {
            if(socket.id==array3[i]["first"])
            {
               var second = array3[i]["second"]
               var i=array4.indexOf(socket.id)
               var j=array4.indexOf(second)
               array4.splice(i,1)
               array4.splice(j,1)
               io.to(socket.id).to(second).emit("closed",data)
               break
            }
           if(socket.id==array3[i]["second"])
           {
            var second = array3[i]["first"]
            var i=array4.indexOf(socket.id)
            var j=array4.indexOf(second)
            array4.splice(i,1)
            array4.splice(j,1)
            io.to(socket.id).to(second).emit("closed",data)
            break
           }
        }
*/
        var obj = Object.keys(array3[array3.length-1])
         if(socket.id==array3[array3.length-1][obj[0]])
         {
            var second = array3[array3.length-1][obj[1]]
            var i=array4.indexOf(socket.id)
            var j=array4.indexOf(second)
            array4.splice(i,1)
            array4.splice(j,1)
            io.to(socket.id).to(second).emit("closed",data)
         }
         else
         {
            var second = array3[array3.length-1][obj[0]]
            var i=array4.indexOf(socket.id)
            var j=array4.indexOf(second)
            array4.splice(i,1)
            array4.splice(j,1)
            io.to(socket.id).to(second).emit("closed",data)
         }
         
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
                array3=[]
                array4=[]
                array=[]
                names=[]
            }
            console.log(roomId)
            socket.to(roomId).broadcast.emit('user-disconnected', roomId)
          })
          
    })
    
})

server.listen(process.env.PORT||9000)

