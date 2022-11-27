const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave,getRoomUsers } = require('./utils/users');



const app = express();
const server = http.createServer(app);
const io = socketio(server);


// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'Chat';

//const botName = 'ChatCord Bot';

io.on('connection', socket => {
    socket.on('joinRoom',({ username,room })=>{



        const user = userJoin(socket.id,username, room);

        socket.join(user.room)

        socket.emit('message', formatMessage(botName,'Welcome to Chat'));

    //Broadcasting when the user connects
        socket.broadcast.to(user,room).emit('message',formatMessage(botName,'${user.username} has joined the chat'));

        io.to(user.room).emit('roomUsers',{
            room: user.room,
            users: getRoomUsers(user.room)
        });

    });

      
    //Listen to chat message
    socket.on('chatMessage',(msg2)=>{

        const user = getCurrentUser(socket.id);

        io.to(user.room).emit('message',formatMessage(user.username, msg2));
    });

      //Runs when the client disconnects
      socket.on('disconnect', ()=>{
          const user = userLeave(socket.id);

          if(user){
            io.to(user.room).emit('message', formatMessage(botName,`${(user.username)} has left the chat`));
          }
          io.to(user.room).emit('roomUsers',{
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

});

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));