//CONFIG
const PORT = 8000

//IMPORTS
require("dotenv").config();
const express = require("express");
const path = require("path");
const bodyParser = require('body-parser')
const http = require('http')
const cors = require('cors');
const socketIo = require("socket.io");

const mongoose = require('mongoose');

const firebaseAdmin = require('firebase-admin');
const firebaseServiceFile = require("./alert-5751a-firebase-adminsdk-29w1s-9a994664e9.json")
const userRoutes = require('./routes/user.route')
//const businessRoutes = require('./routes/business.route')
//const eventRoutes = require('./routes/event.route')

const app = express();
global.activeUsers = [];

//set time zone to ensure consistency
process.env.TZ = 'Africa/Johannesburg';

//setting up firebase
firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(firebaseServiceFile),
});

//connecting to mongoDB
const url = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.zwywd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`
let mongoDB = url;
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));


//Server 
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    next();
});
app.use(cors({origin:true,credentials: true}));
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../client/public')))

//routes
app.get('/get-version', async (req, res) => {
    return res.status(200).json({ v: '2.2' });
});

app.post('/check-username', async (req, res) => {
    try {
        const {username} = req.body
        let found = activeUsers.find(user => user.username === username)
        if(found) {
            return res.status(200).json({ available: true });
        }
        else {
            return res.status(200).json({ available: true });
        }
    } catch(e) {
        console.log(e)
        return res.status(500).json({ error: 'error' });
    }
});

app.post('/socket-test', async (req, res) => {
    console.log(req.body.msg)
    io.emit("all users", req.body.msg);
    return res.status(200).json({ hello: 'hello' });
});

app.get('/location-send', async (req, res) => {
    console.log(req.query)
    io.emit("all users", req.query.msg);
    return res.status(200).json({ hello: 'hello' });
});

app.use('/user', userRoutes)


const server = http.createServer(app).listen(PORT, function() {
  console.log('server listening on port ', PORT);
});

global.io = socketIo(server, {
    cors: {
      origin: '*',
    }
}); 

io.on("connection", function (socket) {
    console.log("Made socket connection");
    addSocketUser(socket.id, socket.handshake.query.userId)
    console.log(socket.handshake.query.userId)
    console.log(activeUsers)
    io.emit("all users", activeUsers);

    socket.on("disconnect", () => {
        console.log('Deleting connection')
        deleteSocketUser(socket.id, socket.handshake.query.userId)
        console.log(activeUsers)
        io.emit("all users", activeUsers);
    });
});

function addSocketUser(socketId, userId) {
    let index = activeUsers.findIndex(user => user.userId === userId)
    if(index !== -1) {
        let curUser = {...activeUsers[index]}
        let socketIndex = curUser.sockets.findIndex(userSocketId => userSocketId === socketId)
        if(socketIndex === -1) {
            curUser.sockets.push(socketId)
            activeUsers.splice(index, 1, curUser)
        }
    }
    else {
        let newUser = {
            userId,
            sockets: [socketId]
        }
        activeUsers.push(newUser)
    }
}

function deleteSocketUser(socketId, userId) {
    let index = activeUsers.findIndex(user => user.userId === userId)
    if(index !== -1) {
        let curUser = {...activeUsers[index]}
        console.log(curUser)
        let socketIndex = curUser.sockets.findIndex(userSocketId => userSocketId === socketId)
        if(socketIndex !== -1) {
            curUser.sockets.splice(socketIndex, 1)
            if(curUser.sockets.length > 0) {
                activeUsers.splice(index, 1, curUser)
            }
            else {
                activeUsers.splice(index, 1)
            }
        }
    }
}