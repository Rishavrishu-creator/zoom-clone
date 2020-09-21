var name;
var array=[]
var names = []
var c=0;
window.onload=function()
{
     name = prompt("Enter your name please");
    }

var socket = io.connect("https://rishav-video-call.herokuapp.com")
var peer = new Peer(undefined,{
    path:'/peerjs',
    host:'/',
    port:'443'
})
const peers = {};


var myVideo = document.createElement("video")
myVideo.muted=true

var myVideoStream;

navigator.mediaDevices.getUserMedia({
    video:true,
    audio:true
}).then(function(stream){
   
   myVideoStream = stream;
   addVideoStream(myVideo,stream);

   peer.on('call',function(call){
       console.log("user-connected again")
       
    call.answer(stream)
    var video = document.createElement("video")
    call.on('stream',function(userVideoStream){
        addVideoStream(video,userVideoStream);
    })
})
   socket.on('user-connected',function(data) {
   
    console.log("user connected")
    
 var call = peer.call(data.check,stream)
 var video = document.createElement("video")
 call.on('stream',function(userVideoStream){
     addVideoStream(video,userVideoStream);
 })
 call.on('close', () => {
    video.remove()
  })
  peers[data.check] = call

})

})
var j=0;

socket.on('user-disconnected', userId => {
    console.log(userId)
    var aa=userId.removed[0];
    if(array.length>0)
    {
        console.log(array)
        if(array.length==1)
        {
            array=[]
            
        }
        else{
            for(var i=0;i<array[array.length-1].participants.length;i++)
            {
               if(array[array.length-1].participants[i]==aa)
               {
                  array[array.length-1].participants.splice(i,1)
                  j=i
                  break
               }
            }
           renderData1()
           
        }
    
}

    console.log(aa)
    if (peers[userId.check]) peers[userId.check].close()
  })


peer.on('open',function(id){
     array=[]
     socket.emit('give-data',{
        roomId:ROOM_ID,
        check:id,
        name:name
     })
     socket.on('message',function(data){
         array.push(data)
        
         renderData()
         
     })
    socket.emit('join-room',{
        roomId:ROOM_ID,
        check:id
    })

})
function renderData1()
{
    document.querySelector(".uul").innerHTML=""
    var html1=''
    for(var i=0;i<array[array.length-1].names.length;i++)
    {
        if(i==j)
        {
          array[array.length-1].names.splice(i,1)
        }
        else{
            html1="<li id="+array[array.length-1].participants[i]+" onclick='startChat(this.id)'>"+array[array.length-1].names[i]+"</li>"
            document.querySelector(".uul").innerHTML+=html1
        }
    }
}

function renderData()
{
    document.querySelector(".uul").innerHTML=""
         var html1=''
         for(var i=0;i<array[array.length-1].names.length;i++)
     {
        html1="<li id="+array[array.length-1].participants[i]+" onclick='startChat(this.id)'>"+array[array.length-1].names[i]+"</li>"
        document.querySelector(".uul").innerHTML+=html1
     }
}

function startChat(a){
   alert(a)

}


function addVideoStream(video,stream){
    video.srcObject = stream;
    video.addEventListener('loadedmetadata',function(){
        video.play();
    })
    
    document.querySelector(".video-grid").append(video);
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

socket.on('chatts',function(data){

    html1+="<li><strong>"+data.identity+"</strong><br>"+data.message+"</li>"
    document.querySelector(".messages").innerHTML=html1;
    document.getElementById("chat_message").value=""

})
var modal = document.getElementById("myModal");

// Get the button that opens the modal
var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];
var html1=''

document.querySelector(".bb").onclick=function()
{
    console.log(array)
     modal.style.display = "block";

}





span.onclick = function() {
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}