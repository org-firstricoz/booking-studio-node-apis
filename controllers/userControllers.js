const { mongoose } = require('mongoose');
const http = require('http');
const bodyParser = require('body-parser');
const express = require('express')
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const Razorpay = require('razorpay')
const otp = require('../utils/otp')
const path = require('path');
const moment = require('moment');
const imageUpload = require('express-fileupload')
const fs = require('fs');
const { table, log } = require('console');
require('dotenv').config();



const Payout = require('../database/payouts')
const Issue = require("../database/issue")
const User = require('../database/user_data/user')
const Studio = require('../database/studio')
const Categories = require('../database/category')
const Favourites = require('../database/user_data/favourites')
const Chat = require('../database/user_data/chats')
const Search = require('../database/user_data/search')
const Notification = require('../database/user_data/notification')
const Agent = require('../database/agent')
const Review = require('../database/review')
const Message = require('../database/user_data/message')
const Order = require('../database/payments')
const Schedule = require('../database/schedules')
const City = require('../database/city')
const Help = require('../database/help');
const Bank = require('../database/bank');
const axios = require('axios');


exports.signup = async (req, res) => {
    try {
        console.log(req)

        const { name, email, gender, phoneNumber, location } = req.body;
        const findingUser = await User.findOne({ email: email });
        const photoUrl = req.files['photoUrl']['data']

        if (findingUser) {
            // 
            console.log(findingUser)
            return res.status(404).send('email already exist');
        }

        let val = await User.create({
            "name": name,
            "email": email,
            "gender": gender,
            "phoneNumber": phoneNumber,
            "location": location,
            "photoUrl": photoUrl,
        })

        const token = jwt.sign(val.toJSON(), 'secret_key', { expiresIn: '20d' })
        // console.log(token)
        res.status(200).send(token)

    } catch (error) {
        console.log(error)
        res.status(500).send(error)
    }
}

exports.city = async (req, res) => {
    try {
        const listOfcities = await City.find();
        const data = listOfcities.map((e) => e.toJSON())
        res.status(200).send(listOfcities);
    } catch (error) {
        res.status(404)
    }
}

exports.otp = async (req, res) => {
    const otpGenerated = otp(6);

    let newUser = false;
    let newAgent = false;
    try {

        const { params } = req.query;
        const data = params.split('-');

        const number = data[0];
        const deviceID = data[1];
        const user = await User.findOne({
            $or: [
                { email: params },
                { phoneNumber: params }
            ]
        });
        const agent = await Agent.findOne({
            $or: [
                { email: params },
                { number: params }
            ]
        })
        if (!user) {
            newUser = true
        }
        if (!agent) {
            newAgent = true;
        }

        // const accountSid = process.env.KEY_SID;
        // const authToken = process.env.KEY_TOKEN;
        // const client = require('twilio')(accountSid, authToken);



        // await  client.messages
        // .create({
        //     body: `${otpGenerated} is Your OTP for mobile number verification . Please do not share this OTP to anyone - Firstricoz Pvt. Ltd`,
        //     from: '+12562734971',
        //     to: `+91${number}`
        // })
        // .then(message => console.log(message.sid))
        if (number == "7355139678") {
            const tempotp = '123456';
            return res.status(200).json({ 'newUser': newUser, "otp": tempotp, 'newAgent': newAgent, agentId: newAgent ? null : agent.agentId, userId: newUser ? null : user.uuid });
        }
        console.log(number, otpGenerated)
        await fetch(`https://smsgw.tatatel.co.in:9095/campaignService/campaigns/qs?dr=false&sender=FRICOZ&recipient=${number}&msg=Dear%20Customer,%20Your%20OTP%20for%20mobile%20number%20verification%20is ${otpGenerated}.%20Please%20do%20not%20share%20this%20OTP%20to%20anyone%20-%20Firstricoz%20Pvt.%20Ltd.&user=FIRSTR&pswd=First^01&PE_ID=1601832170235925649&Template_ID=1607100000000306120`);
        res.status(200).json({ 'newUser': newUser, "otp": otpGenerated, 'newAgent': newAgent, agentId: newAgent ? null : agent.agentId, userId: newUser ? null : user.uuid });
    } catch (e) {
        console.log(e)

        res.status(500).send(e);
    }
}

exports.login = async (req, res) => {
    try {
        const { params } = req.query;

        const user = await User.findOne({
            $or: [

                { phoneNumber: params }
            ]
        });


        if (!user) {
            console.log('not found')
            res.status(404).send('Not Found')

        }
        const token = jwt.sign(user.toJSON(), 'secret_key', { expiresIn: '20d' });

        res.status(200).send(token);
    } catch (e) {

        res.status(500).send('Unable to login try after some time');
    }
}


exports.createChat = async (req, res) => {
    // Simulate sending a message to all connected clients;
    try {
        const message = req.body;

        const chats = await Chat.findOne({ user_id: message['uuid'], agent_id: message['agentID'] });

        if (!chats) {
            const chat = await Chat.create({
                agent_id: message['agentID'],
                user_id: message['uuid'],
            });

            const agentModel = await Agent.findOne({ agentId: chat.agent_id });

            var data = {
                "id": chat.agent_id,
                "unread": chat.unread,
                "time": chat.time,
                "agentModel": agentModel.toJSON()
            };

            const mess = await Message.create(message);
            console.log(mess.toJSON());
            return res.status(200).send({ "message": mess.toJSON(), "chat": data });
        }

        await Message.create(message);
        return res.status(200).send({ "message": message, "chat": null });
    } catch (e) {
        res.status(500);
    }
};

exports.getChat = async (req, res) => {
    try {
        const { uuid, agentId } = req.query;
        const messages = await getAllMessages(uuid, agentId);
        res.status(200).send(JSON.stringify(messages));
    } catch (error) {
        res.status(500);
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { uuid } = req.params;
        console.log(req.body.number)
        if (req.body.number) {
            const user = await User.findOne({ phoneNumber: req.body.number })
            if (user) {

                await User.deleteOne({ phoneNumber: req.body.number }).exec()
                console.log('account deleted')

                return res.status(200).json({ status: 'Success' })
            }
            return res.status(300).json({ status: false, error: 'No user Found' })
        } else {
            const data = await User.deleteOne({ uuid: uuid }).exec()
        }
        console.log('account deleted')
        res.status(200).send('delete')
    } catch (e) {
        console.log(e)
        res.status(500).send(e)
    }

}

exports.updateUser = async (req, res) => {
    try {
        const { uuid } = req.params;
        const body = Object.entries(req.body)
        const photoUrl = req.files['photoUrl']['data']
        console.log(req.body)
        const update = { "photoUrl": photoUrl }
        body.map(([key, value]) => {
            if (value !== null) {
                update[key] = value;
            }
        });

        await User.updateOne({ uuid: uuid }, update).exec()
        const user = await User.findOne({ uuid: uuid });
        const token = jwt.sign(user.toJSON(), 'secret_key', { expiresIn: '20d' });
        res.status(200).send(token);
    } catch (error) {
        console.log(error)
        res.status(500).send(error)
    }
}

exports.helpUser = async (req, res) => {
    var data

    try {
        const { params } = req.params
        console.log(params)
        if (params == '_') {
            const res = await Help.find()
            data = res.map((e) => e.toJSON())
        } else {
            const res = await Help.find({

                $text: { $search: params }

            },
            )
            data = res.map((e) => e.toJSON())
        }

        res.status(200).send(data)

    } catch (e) {
        console.log(e)
        res.status(500).send(e);
    }
}








async function getAllMessages(uuid, agentId) {

    const messages = await Message.find({ uuid: uuid, agentID: agentId }).sort({ timestamp: 1 }).exec()

    if (messages.length != 0) {

        return messages.map((e) => e.toJSON());
    }
    return [];
}
