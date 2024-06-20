const { mongoose } = require('mongoose');
const http = require('http');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const Razorpay = require('razorpay')
const otp = require('./utils/otp')
const path = require('path');
const moment = require('moment');
const imageUpload = require('express-fileupload')
const fs = require('fs');
const { table, log } = require('console');
const { Server } = require('socket.io');


const User = require('./database/user_data/user')
const Chat = require('./database/user_data/chats')
const Message = require('./database/user_data/message')


const express = require('express');
const database = require('./database/database');
const userRouter = require('./routers/userRouter');
const agentRouter = require('./routers/agentRouter');


database.connect()
const app = express()

const server = http.createServer(app);
const io = new Server(server);
app.use(bodyParser.json());
app.use(imageUpload());
app.use(cors());

app.use('/api/v1/user', userRouter);
app.use('/api/v1/agent', agentRouter);
app.use('/', (req, res) => {
    res.json({ status: 'Success', message: "UP AND RUNNING" })

})
const clients = {}


io.on("connection", async (socket) => {
    log(socket.id);
    try {
        socket.on('agent', (id) => {
            clients[id] = socket
            log(id)
            socket.on('chat_data', async (msg) => {
                console.log(msg);
                const chatsJson = [];
                const chats = await Chat.find({ $or: [{ user_id: msg, }, { agent_id: msg }] })
                await Promise.all(chats.map(async (e) => {
                    const user = await User.findOne({ uuid: e.user_id });
                    const data = {
                        'name': user.name,
                        'photoUrl': user.photoUrl,
                        'time': e.time,
                        'id': e.id,
                        'userId': e.user_id,
                        'agentId': e.agent_id,
                    }
                    chatsJson.push(data);
                }))
                log(chatsJson);
                socket.emit('chat_data', chatsJson);
            })
        });
        socket.on('user', (id) => {
            clients[id] = socket
            log(id)

        })
        socket.on('messageA', async (msg) => {
            try {
                const message = JSON.parse(msg)
                log(message)
                const DBmessages = await Message.create(message);
                const chat = await Chat.findOne({ agent_id: DBmessages.agentID, user_id: DBmessages.uuid })
                if (!chat) {
                    await Chat.create({ agent_id: DBmessages.agentID, user_id: DBmessages.uuid })
                    await Chat.create({ agent_id: DBmessages.agentID, user_id: DBmessages.uuid })
                    const chatsJson = [];
                    const chats = await Chat.find({ $or: [{ user_id: msg, }, { agent_id: msg }] })
                    await Promise.all(chats.map(async (e) => {
                        const user = await User.findOne({ uuid: e.user_id });
                        const data = {
                            'name': user.name,
                            'photoUrl': user.photoUrl,
                            'time': e.time,
                            'id': e.id,
                            'userId': e.user_id,
                            'agentId': e.agent_id,
                        }
                        chatsJson.push(data);
                    }))
                    log(chatsJson);
                    socket.emit('chat_data', chatsJson);
                }
                log(clients)
                if (clients[DBmessages.uuid]) {
                    clients[DBmessages.uuid].emit('message', message)
                }
            } catch (e) {
                log(e)
            }
        })
        socket.on('messageU', async (msg) => {
            try {
                const message = JSON.parse(msg)
                // log(message)
                const DBmessages = await Message.create(message);
                const chat = await Chat.findOne({ agent_id: DBmessages.agentID, user_id: DBmessages.uuid })
                if (!chat) {
                    await Chat.create({ agent_id: DBmessages.agentID, user_id: DBmessages.uuid })
                    const chatsJson = [];
                    const chats = await Chat.find({ $or: [{ user_id: msg, }, { agent_id: msg }] })
                    await Promise.all(chats.map(async (e) => {
                        const user = await User.findOne({ uuid: e.user_id });
                        const data = {
                            'name': user.name,
                            'photoUrl': user.photoUrl,
                            'time': e.time,
                            'id': e.id,
                            'userId': e.user_id,
                            'agentId': e.agent_id,
                        }
                        chatsJson.push(data);
                    }))
                    log(chatsJson);
                    socket.emit('chat_data', chatsJson);

                }
                log(DBmessages.toJSON())
                if (clients[DBmessages.agentID]) {
                    clients[DBmessages.agentID].emit('message', message)
                }
            } catch (e) {
                log(e)
            }
        }
        )

        socket.on('chat', async (msg) => {
            const messages = await Message.find({ $or: [{ agentID: msg }, { uuid: msg }] })
            const JSONmessages = messages.map((e) => e.toJSON())
            socket.emit('chat', JSONmessages)
        })
        socket.on('chat_data', async (msg) => {
            const chatsJson = [];
            const chats = await Chat.find({ $or: [{ user_id: msg, }, { agent_id: msg }] })
            await Promise.all(chats.map(async (e) => {
                const user = await User.findOne({ uuid: e.user_id });
                const data = {
                    'name': user.name,
                    'photoUrl': user.photoUrl,
                    'time': e.time,
                    'id': e.id,
                    'userId': e.user_id,
                    'agentId': e.agent_id,
                }
                chatsJson.push(data);
            }))
            log(chatsJson);
            socket.emit('chat_data', chatsJson);
        })
    } catch (error) {
        // log(e);
        socket.emit('error', 'error')
    }

})
const PORT = process.env.PORT || 3000;
// const DOMAIN = process.env.DOMAIN || "";
server.listen(PORT,  () => {
    console.log(`Server is running ...`);
});