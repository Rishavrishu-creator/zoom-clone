
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

io.on('connection',function(socket){
    socket.on('join-room',function(roomId){
        socket.join(roomId);
        socket.to(roomId).broadcast.emit('user-connected',roomId);

        socket.on('chat-message',function(data){
            io.to(roomId).emit("chatts",data)
        })
    })
    
})

server.listen(process.env.PORT||9000)

