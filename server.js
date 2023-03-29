const express = require('express')

// universally unique id generator
const {v4: uuidV4} = require('uuid')
const app = express();

const server = require('http').Server(app)
const io = require('socket.io')(server)

// peerjs is a webRTC configuration tool to connect two browser to exchange data
const {ExpressPeerServer} = require('peer');
const peerServer = ExpressPeerServer(server, {
    debug: true
})

// to allow the app access ejs engine file from the views directory
app.set('view engine', 'ejs');
// to allow the app check our css and js file from public folder
app.use(express.static('public'));

// to allow the app run peerServer when peerjs is accessed 
app.use('/peerjs', peerServer)
// to make the app goes to the new generated id when someone request home page
app.get('/', (req, res)=>{
res.redirect(`/${uuidV4()}`)
})

// when someone go to that unique id url the server render the ejs file and pass the unique id to the frontend
app.get('/:id', (req, res)=>{
    res.render('room', {roomId: req.params.id})
})

io.on('connection', (socket)=>{
    socket.on('join-room', (room_id, userId)=>{
        console.log(room_id, userId);
        socket.join(room_id);
        // send the event for all connected clients except the sender
        socket.to(room_id).emit('user-connected', userId);
        // socket.to(room_id).broadcast.emit('user-connected', userId)

        socket.on('message', (message)=>{
            // send message to the same room
            io.to(room_id).emit('createMessage', message)
        })

        socket.on('disconnect', ()=>{
            socket.broadcast.emit('user-disconnected', userId);
        })
    })
})

server.listen(4000)