var name;
window.onload=function()
{
     name = prompt("Enter your name please");
    }

var socket = io.connect("https://rishavclone.herokuapp.com")
var peer = new Peer(undefined,{
    path:'/peerjs',
    host:'/',
    port:'443'
})


var myVideo = document.querySelector(".vv1")
myVideo.muted=true

var myVideoStream;

navigator.mediaDevices.getUserMedia({
    video:true,
    audio:true
}).then(function(stream){
   myVideoStream = stream;
   addVideoStream(myVideo,stream);

   peer.on('call',function(call){
    call.answer(stream)
    var video = document.querySelector(".vv")
    call.on('stream',function(userVideoStream){
        addVideoStream(video,userVideoStream);
    })
})
   socket.on('user-connected',function(data) {
    console.log("user connected")
 var call = peer.call(data.check,stream)
 var video = document.querySelector(".vv")
 call.on('stream',function(userVideoStream){
     addVideoStream(video,userVideoStream);
 })
})

})

peer.on('open',function(id){

    socket.emit('join-room',{
        roomId:ROOM_ID,
        check:id
    })

})


function addVideoStream(video,stream){
    video.srcObject = stream;
    video.addEventListener('loadedmetadata',function(){
        video.play();
    })
    
    document.getElementById("video-grid").append(video);
}

function mute()
{
 var enabled = myVideoStream.getAudioTracks()[0].enabled;

 if(enabled)
 {
     myVideoStream.getAudioTracks()[0].enabled=false;
     setUnmuteButton();
 }
 else{
    myVideoStream.getAudioTracks()[0].enabled=true;
    setmuteButton();
 }
}

function setmuteButton()
{
    var html = "<i class='fas fa-microphone'></i><span>Mute</span>";
    document.querySelector(".main_mute_button").innerHTML=html;

}
function setUnmuteButton()
{
    var html = "<i class='unmute fas fa-microphone-slash'></i><span>Unmute</span>";
    document.querySelector(".main_mute_button").innerHTML=html;
    
}

function stopVideo()
{
 var enabled = myVideoStream.getVideoTracks()[0].enabled;
 if(enabled)
 {
myVideoStream.getVideoTracks()[0].enabled=false;
setPlayVideo();
 }
 else{
     setStopVideo();
myVideoStream.getVideoTracks()[0].enabled=true;
 }
}
function setPlayVideo()
{
    var html="<i class='stop fas fa-video-slash'></i><span>Stop Video</span>"
    document.querySelector(".main_video_button").innerHTML=html;
}
function setStopVideo()
{
    var html="<i class='fas fa-video'></i><span>Stop Video</span>"
    document.querySelector(".main_video_button").innerHTML=html;
}
document.getElementById('chat_message').onkeydown = function(e){
    if(e.keyCode == 13){
        var a = document.getElementById("chat_message").value;
        if(a!='')
        {
        socket.emit('chat-message',{
            identity:name,
            message:a
        
        })  
    }
 }
}

document.getElementById("chat_button").onclick=function()
{
    var a = document.getElementById("chat_message").value;
    if(a!='')
    {
    socket.emit('chat-message',{
        identity:name,
        message:a
    
    })
}

}
var html1='';
socket.on('chatts',function(data){

    html1+="<li><strong>"+data.identity+"</strong><br>"+data.message+"</li>"
    document.querySelector(".messages").innerHTML=html1;
    document.getElementById("chat_message").value=""

})