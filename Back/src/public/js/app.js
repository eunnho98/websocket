const socket = new WebSocket('ws://localhost:3000');
const messageList = document.querySelector('ul');
const messageForm = document.querySelector('#message');
const nickForm = document.querySelector('#nickname');

// 소켓 이벤트 등록
socket.addEventListener('open', () => {
  console.log('Open server');
});

// 서버에서 받은 메시지
socket.addEventListener('message', (message) => {
  console.log(message, 'is coming');
  const li = document.createElement('li');
  li.innerText = message.data;
  messageList.append(li);
});

// 서버가 닫혔을 때
socket.addEventListener('close', () => {
  console.log('Close Server');
});

/*
close: 서버가 닫혔을 때 발생
connection: 서버와 사용자 간 연결이 성립되었을 때 발생
error: 연결되어 있는 서버에서 오류가 발생했을 때 발생
*/

function makeMessage(type, payload) {
  const msg = { type, payload };
  return JSON.stringify(msg); // JSON to string
}

const handleSubmit = (e) => {
  e.preventDefault();
  const input = messageForm.querySelector('input');
  // send로 서버로 매시지 전송
  socket.send(makeMessage('message', input.value));
  input.value = '';
};

const handleNickname = (e) => {
  e.preventDefault();
  const input = nickForm.querySelector('input');
  socket.send(makeMessage('nickname', input.value));
  input.value = '';
};

messageForm.addEventListener('submit', handleSubmit);
nickForm.addEventListener('submit', handleNickname);
