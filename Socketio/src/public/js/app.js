const socket = io(); // 알아서 socket.io가 실행하고 있는 서버를 찾음
const welcome = document.getElementById('welcome');
const form = welcome.querySelector('form');
const room = document.getElementById('room');
let roomName;

room.hidden = true;

const showRoom = () => {
  welcome.hidden = true;
  room.hidden = false;
  const h3 = room.querySelector('h3');
  h3.innerText = `Room ${roomName}`;
  const msgform = room.querySelector('#msg');
  const nameform = room.querySelector('#name');
  msgform.addEventListener('submit', handleMessageSubmit);
  nameform.addEventListener('submit', handleNicknameSubmit);
};

const addMessage = (m) => {
  const ul = room.querySelector('ul');
  const li = document.createElement('li');
  li.innerText = m;
  ul.appendChild(li);
};

const handleMessageSubmit = (e) => {
  e.preventDefault();
  const input = room.querySelector('#msg input');
  const value = input.value;
  socket.emit('new_message', value, roomName, () => [
    addMessage(`You ${value}`),
  ]);
  input.value = '';
};

const handleNicknameSubmit = (e) => {
  e.preventDefault();
  const input = room.querySelector('#name input');
  const value = input.value;
  socket.emit('nickname', value);
  input.value = '';
};

const handleRoomSubmit = (e) => {
  e.preventDefault();
  const input = form.querySelector('input');

  // 이벤트를 발생시키는 역할, 이벤트명(enter_room)을 사용자 임의 지정 가능
  // 서버에서 이벤트 명을 받아 처리 가능
  // 두 번째 인자로는 이벤트를 통해 전송할 데이터, 데이터로는 객체도 가능
  // emit으로 데이터를 여러 개 보낼 수 있음, 보낸 수만큼 서버에서도 받을 때 파라미터 그만큼 필요
  // 마지막 인자로 서버에서 실행시킬 콜백함수를 브라우저에서 넘겨줄 수 있음
  // socket.emit('enter_room', input.value, () => {
  //   console.log('server work');
  // });
  socket.emit('enter_room', input.value, showRoom);
  console.log(`Make room: ${input.value}`);
  roomName = input.value;
  input.value = '';
};

form.addEventListener('submit', handleRoomSubmit);

socket.on('welcome', (usernick, newCount) => {
  const h3 = room.querySelector('h3');
  h3.innerText = `Room ${roomName} (${newCount})`;
  addMessage(`${usernick} Joined!`);
});

socket.on('bye', (usernick, newCount) => {
  const h3 = room.querySelector('h3');
  h3.innerText = `Room ${roomName} (${newCount})`;
  addMessage(`${usernick} Out..`);
});

socket.on('send_message', (msg) => {
  addMessage(msg);
});

socket.on('room_change', (rooms) => {
  console.log(rooms);
  const roomList = welcome.querySelector('ul');
  roomList.innerHTML = '';
  if (rooms.length === 0) return;
  rooms.forEach((r) => {
    const li = document.createElement('li');
    li.innerText = r;
    roomList.append(li);
  });
});
