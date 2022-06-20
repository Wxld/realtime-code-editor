const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const ACTIONS = require('./src/Actions');

const app = express();

app.use(express.static('build'));
app.use((req, res, next) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
})

//app is a event listener who listens to all the requests made by the browser
//creating a new server instance
const server = http.createServer(app);

//creating new server instance for socket.io
const io = new Server(server);

// option: could be done using some DB or redis | used for storing all the pair of [socketId --> username]
const userSocketMap = {};


const getAllConnectedClients = (roomID) => {
    return Array.from(io.sockets.adapter.rooms.get(roomID) || []).map((socketID) => {
        return {
            socketID,
            username: userSocketMap[socketID],  
        }
    })
}

// listening for connection event on the server instance io
io.on('connection', (socket) => {
    console.log('socket connected', socket.id);

    // once a client has raised a connnection request we process it.
    socket.on(ACTIONS.JOIN, ({roomID, username}) => {

        userSocketMap[socket.id] = username;
        socket.join(roomID);

        // getting all the connected clients in the current room 
        const clients = getAllConnectedClients(roomID);

        // notifying all the users of the connection/join event of the current 'username' in room with ID 'roomID'
        clients.forEach(({ socketID }) => {
            io.to(socketID).emit(ACTIONS.JOINED, {
                clients,
                username,
                connectedSocketID: socket.id,
            })
        })
    })

    socket.on(ACTIONS.CODE_CHANGE, ({roomID, code}) => {
        //emitting the event to all the user's present in room with id 'roomID' except the user who made the code changes
        socket.in(roomID).emit(ACTIONS.CODE_CHANGE, { code });
    })

    socket.on(ACTIONS.SYNC_CODE, ({code, connectedSocketID}) => {
        //emit the code-change action only to the user with socketID = connectedSocketID
        io.to(connectedSocketID).emit(ACTIONS.CODE_CHANGE, {code});
    })

    socket.on('disconnecting', () => {
        // get all the rooms in which our user has joined
        const rooms = [...socket.rooms];

        rooms.forEach((roomID) => {
            // emit a message in all those rooms that we are disconnecting
            socket.in(roomID).emit(ACTIONS.DISCONNECTED, {
                socketID: socket.id,
                username: userSocketMap[socket.id]
            })
        })

        //deleting the socket.id-->username pair
        delete userSocketMap[socket.id];

        //leaving the socket instance (used by socket)
        socket.leave();
    })
})

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server listening to ${PORT}`)); 

