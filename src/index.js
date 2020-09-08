const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users')

// Declare port for express server
const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000

//Server init
server.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})

//Parse incoming json(small letters necessary) to Javascript
app.use(express.json())

//Define paths for Express config (__dirname is the directory path for the current script)

//Static Public directory
const publicDirectory = path.join(__dirname, ('../public'))
//viewsPath contains dynamic elements like /weather /blog /user etc.
const viewsPath = path.join(__dirname, ('../templates/partials'))
//Partials contains static elements like header, footer, etc.
const partialsPath = path.join(__dirname, ('../templates/views'))

//Setup static directory to serve
app.use(express.static(publicDirectory))

// let count = 0

//server(emit) -> client (receive) - countUpdated
//client(emit) -> server(receive) - increment


//whenever socket will get connection that function works
//when there are 5 different connections from 5 different pcs/mobile phones etc then (socket) will work 5 times sending 5 times the same thing to different people etc

//socket oznacza polaczenie, kazde jedno (each)
io.on('connection', (socket) => {
    console.log('New WebSocket connection')

        //join works only on server side
        //socket join allows to join a given chatroom and we pass a name 
        socket.on('join', ({ username, room }, callback) => {
            const { error, user } = addUser({ id: socket.id, username, room })

            if(error){
                return callback(error)
            }

            socket.join(user.room)

            //sends only to one connection because count didnt change when someone joined so its pointless to send it to everyone via io.
            // socket.emit('countUpdated', count)
            socket.emit('message', generateMessage('Welcome'))
            socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined!`))
            io.to(user.room).emit('roomData', {
                room: user.room, 
                users: getUsersInRoom(user.room)
            })

            callback()

            //What are we listening for? 'increment', what we will do if we will "hear" increment? {}
            // socket.on('increment', () => {
            //     count++
            //below function emits info only to one connection
            // socket.emit('countUpdated', count)

            // socket.emit, io.emit, socket.broadcast.emit
            // io.to.emit -> emits to everybody in a specific room
            // socket.broadcast.to.emit -> to everyone expect for a specific client in a specific chatroom
        })

        //socket works only for one connection and io works for every connection at the same time
        // io.emit('countUpdated', count)
        
    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)
        const filter = new Filter()

        if(filter.isProfane(message)){
            return callback('Profanity is not alllowed!')
        }
        
        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback()
    })

    socket.on('sendLocation', (lat, long, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${lat},${long}`))
        callback()
    })

    //Nie uzywamy broadcast, bo gosc ktory wyszedl i tak wiadomosci nie zoabczy, a broadcast wysyla do wszystkich tylko nie do tego socketa ktory wykonuje dana czynnosc, czyli w danym przypadku sie wylogowuje
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if(user){
            io.to(user.room).emit('message', generateMessage(`${user.username} has left`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

//Export express function to other tabs
module.exports = app

