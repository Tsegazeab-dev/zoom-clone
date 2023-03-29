const socket = io('/')

const myPeer = new Peer(undefined, {
  path: '/peerjs',
  host: '/',
  port: '443',
})
const videoGrid = document.getElementById('video-grid')
const myVideo = document.createElement('video');
myVideo.muted = true;
let myMediaStream;
const peers = {};

// Method #1

// Prefer camera resolution nearest to 1280x720.
const constraints = { audio: true, video: true }; 

// mediaDevices.getUserMedia ask the user for permission to use 1 video input and 1 audio input & this returns a promise
navigator.mediaDevices.getUserMedia(constraints)
.then((stream)=>{
myMediaStream = stream;
addVideoStream(myVideo, stream);

myPeer.on('call', (call)=>{
  call.answer(stream);
  const video = document.createElement('video');

  call.on('stream', (userVideoStream)=>{
    addVideoStream(video, userVideoStream);
  });
});
socket.on('user-connected', (userId)=>{
  console.log(userId);
connectToNewUser(userId, stream);
});

let text = $('input');
console.log(text);
$('html').keydown(function(e){
  if(e.which === 13 && text.val().length !== 0){
    socket.emit('message', text.val());
    text.val('')
  }
});

socket.on('createMessage', (message)=>{
  console.log(message);
  $('ul').append(`<li class='message'><b>User</b> <br/> ${message} </li>`)
})
});

socket.on('user-disconnected', (userId)=>{
  if(peers[userId]) peers[userId].close();

});

myPeer.on('open', (id)=>{
  socket.emit('join-room', RoomId, id)
})


function addVideoStream(video, stream){
video.srcObject = stream;
video.onloadedmetadata = function(e) {
      video.play();
      
    };
videoGrid.append(video)

};

function connectToNewUser(userId, stream){
  const call = myPeer.call(userId, stream);
  const video = document.createElement('video');
  call.on('stream', (userVideoStream)=>{
    addVideoStream(video, userVideoStream);
  })

  call.on('close', ()=>{
    video.remove()
  });

  peers[userId] = call;
}

function playStop(){
  let enabled = myMediaStream.getVideoTracks()[0].enabled;
  if(enabled){
    myMediaStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  }
  else{
    setStopVideo();
    myMediaStream.getVideoTracks()[0].enabled = true;
  }
};

function muteUnmute(){
  let enabled = myMediaStream.getAudioTracks()[0].enabled;
  if(enabled){
    myMediaStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  }
  else{
    setMuteButton();
    myMediaStream.getAudioTracks()[0].enabled = true;
  }
}

function setStopVideo(){
  const html = `
  <i class="fa-solid fa-video"></i>
  <span>Stop Video</span>`;

  document.querySelector('.main__video__button').innerHTML = html;
}

function setPlayVideo(){
  const html = `
  <i class="stop fa-solid fa-video-slash"></i>
  <span>Play Video</span>`;

  document.querySelector('.main__video__button').innerHTML = html;
}

function setUnmuteButton(){
  const html = `
  <i class="unmute fa-solid fa-microphone-slash"></i>
  <span>Unmute</span>`;

  document.querySelector('.main__mute__button').innerHTML = html;
}
function setMuteButton(){
  const html = `
  <i class="fa-solid fa-microphone"></i>
  <span>Mute</span>`;

  document.querySelector('.main__mute__button').innerHTML = html;
}
// // Method #2
// var constraints = { audio: true, video: true}; 

// navigator.mediaDevices.getUserMedia(constraints)
// .then(function(mediaStream) {
//     myMediaStraem = mediaStream;
// const video = document.querySelector('video');
//   video.srcObject = mediaStream;
//   video.onloadedmetadata = function(e) {
//     video.play();
    
//   };
 
// })
// .catch(function(err) { console.log(err.name + ": " + err.message); }); 