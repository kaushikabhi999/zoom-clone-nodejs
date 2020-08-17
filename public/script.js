const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
myVideo.muted = true;

let peer = new Peer(undefined, {
  path: '/peerjs',
  host: '/',
  port: '443'
});

let myVdoStream;
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  myVdoStream = stream;
  addVideoStream(myVideo, stream);

  peer.on('call', call => {
    call.answer(stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream);
    })
  })

  socket.on('user-connected', (userId) => {
    connectToNewuser(userId, stream);
  })
})

peer.on('open', id => {
  socket.emit('join-room', roomId, id);
})

const connectToNewuser = (userId, stream) => {
  const call = peer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream);
  })
}

const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  });
  videoGrid.append(video);
}

let text = $('input');

$('html').keydown(e => {
  if (e.which == 13 && text.val().length !== 0) {
    console.log(text.val())
    socket.emit('message', text.val());
    text.val('');
  }
})

socket.on('createMessage', msg => {
  $('ul').append(`<li class='message'><b>user</b><br/>${msg}</li>`)
})

const scrollToBottom = () => {
  let d = $('.main__chat_window');
  d.scrollTop(d.prop('scrollHeight'));
}

const muteUnmute = () => {
  const enabled = myVdoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVdoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    myVdoStream.getAudioTracks()[0].enabled = true;
    setMuteButton();
  }
}

const setMuteButton = () => {
  const html = `
  <i class="fa fa-microphone" aria-hidden="true"></i>
  <span>Mute</span>
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}
const setUnmuteButton = () => {
  const html = `
  <i class="fa fa-microphone-slash unmute" aria-hidden="true"></i>
  <span>Mute</span>
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}


const playStop = () => {
  const enabled = myVdoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVdoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    myVdoStream.getVideoTracks()[0].enabled = true;
    setStopVideo();
  }
}

const setStopVideo = () => {
  const html = `
  <i class="fa fa-video" aria-hidden="true"></i>
  <span>Stop Video</span>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}

const setPlayVideo = () => {
  const html = `
  <i class="fa fa-video-slash stop_video" aria-hidden="true"></i>
  <span>Play Video</span>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}