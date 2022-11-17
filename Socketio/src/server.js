import express from 'express';
import path from 'path';
import http from 'http';
import { Server } from 'socket.io';
const __dirname = path.resolve();

// Setting
const app = express();
app.set('view engine', 'pug');
app.set('views', __dirname + '/src/views/');
app.use('/public', express.static(__dirname + '/src/public'));
app.get('/', (req, res) => res.render('home'));
app.get('/*', (req, res) => res.redirect('/'));

const httpServer = http.createServer(app);
const wsServer = new Server(httpServer); // SocketIO Server

const publicRooms = () => {
  const sids = wsServer.sockets.adapter.sids;
  const rooms = wsServer.sockets.adapter.rooms;

  const publicRooms = [];
  rooms.forEach((value, key) => {
    // sids는 key로 socketID를 가짐, public room이라면 undefined 일 것
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });
  return publicRooms;
};

const countUser = (roomName) => {
  return wsServer.sockets.adapter.rooms.get(roomName)?.size;
};

wsServer.on('connection', (socket) => {
  socket['nickname'] = 'Anonymous';
  // onAny: 소켓에서 발생하는 모든 이벤트에 대응하는 이벤트 핸들러 등록 메서드
  /*
  어댑터: 이 App(서버)에 누가 연결되어 있는지, room은 얼마나있는지 알려줌   
  rooms: 서버에 있는 모든 채팅룸을 볼 수 있음(private room도 포함) & 각 room에 참가한 소켓 보여줌 
  sids: key로 socketID, value로 해당 소켓이 접속한 room들이 있음
  */
  socket.onAny((e) => {
    console.log(wsServer.sockets.adapter);
    console.log(`Socket Event: ${e}`);
  });
  wsServer.sockets.emit('room_change', publicRooms());
  // func: Client에서 넘겨준 콜백함수
  socket.on('enter_room', (r, func) => {
    // 생성한 room에 접속하기
    func();
    socket.join(r);
    // to를 통해 원하는 소켓에만 이벤트 전달 가능, 여기선 room에 접속한 소켓에게만 전달
    // 클라이언트에서 사용한 emit과 같음, 클라이언트의 welcome을 실행시킴
    socket.to(r).emit('welcome', socket.nickname, countUser(r));
    console.log(r);

    // 소켓이 room에 들어오면 방이 업데이트될 수도 있으므로 모든 소켓에게 알려야함
    wsServer.sockets.emit('room_change', publicRooms());
    /*
    socket.io에서 서버에 연결된 개별 소켓은 다양한 속성 포함
    socket.id: 해당 소켓만의 고유한 값 = 소켓의 프라이빗 room
    socket.rooms: 소켓이 접속한 room들을 보여줌
    socket.join: 파라미터로 준 값의 room이 있으면 그 room에 참가, 없으면 그 room 생성하고 참가
    */

    // 연결이 종료되기 직전 수행
    socket.on('disconnecting', () => {
      socket.rooms.forEach((r) =>
        socket.to(r).emit('bye', socket.nickname, countUser(r) - 1)
      );
    });

    // 연결이 종료된 후 수행
    socket.on('disconnect', () => {
      wsServer.sockets.emit('room_change', publicRooms());
    });
    socket.on('new_message', (msg, room, func) => {
      socket.to(room).emit('send_message', `${socket.nickname}: ${msg}`);
      func();
    });
    socket.on('nickname', (nickname) => {
      socket['nickname'] = nickname;
    });
  });
});

const handleListen = () => console.log('Listening on http://localhost:3000');
httpServer.listen(3000, handleListen);
