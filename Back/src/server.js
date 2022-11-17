import express from 'express';
import path from 'path';
import http from 'http';
import WebSocket, { WebSocketServer } from 'ws';
const __dirname = path.resolve();

// Setting
const app = express();
app.set('view engine', 'pug');
app.set('views', __dirname + '/src/views/');
app.use('/public', express.static(__dirname + '/src/public'));
app.get('/', (req, res) => res.render('home'));
app.get('/*', (req, res) => res.redirect('/'));
const handleListen = () => console.log(`Listening on http://localhost:3000`);
const server = http.createServer(app);
const wss = new WebSocketServer({ server }); // wss 서버를 http 서버 위에서 작동

const sockets = []; // 소켓 연결된 클라이언트 저장 임시 DB

const handleConnection = (socket) => {
  socket['nickname'] = 'anonymous';
  sockets.push(socket);
  console.log(socket);
  socket.on('close', () => console.log('Server Down')); // 소켓 통신이 닫힐 때 = 브라우저를 껐을 때
  socket.on('message', (m) => {
    console.log(`${m}`); // m으로 그냥 넣으면 패킷으로 옴
    // socket.send(`hi I am Server, Thanks for ${m}`);
    const msg = JSON.parse(m);
    if (msg.type === 'nickname') socket['nickname'] = msg.payload;
    else if (msg.type === 'message')
      sockets.forEach((s) => s.send(`${socket.nickname}: ${msg.payload}`));
  });
};
wss.on('connection', handleConnection); // on으로 이벤트 전달, 핸들러로 socket이 파라미터로 감

server.listen(3000, handleListen); // http 서버를 염

// 서버가 오프라인이 되면 브라우저에서 확인 가능, 브라우저가 오프라인이 되면 서버에서 확인 가능
