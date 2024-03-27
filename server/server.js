const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Rotas e lógica do servidor

app.get('/', (req, res) => {
    res.send('API ON!');
    }
);

io.on('connection', (socket) => {

    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    socket.on('update', (msg) => {
        console.log('mensagem: ' + msg);
    });

}
);
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

});
