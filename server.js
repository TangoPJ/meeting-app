const { WebSocketServer } = require('ws');

const wss = new WebSocketServer({ port: 8081 });

wss.on('connection', (ws) => {
  ws.on('message', (m) =>
    setTimeout(() => ws.readyState === 1 && ws.send(m.toString()), 300),
  );
  setTimeout(() => ws.terminate(), 25000 + Math.random() * 10000);
});
