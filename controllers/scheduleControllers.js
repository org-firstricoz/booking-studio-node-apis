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
const authHeader =
    "Basic " + Buffer.from(`${process.env.KEY_ID}:${process.env.KEY_SECRET}`).toString("base64");



exports.createRequest = async (req, res) => {
    try {
        /*  body contains:-
        'name': name,
        'description': description,
        'date': date.toIso8601String(),
        'time': time.toString(),
        'userId': userId,
        'studioId': studioId,
        'amount': amount, */
        const body = req.body;
        console.log(body)
        var options = {
            amount: body['amount'],
            currency: "INR",
        };
        const agent = await Agent.findOne({ studioIds: { $in: [body['studioId']] } })
        const response = await axios.post("https://api.razorpay.com/v1/orders", options, {
            headers: {
                "Content-Type": "application/json",
                Authorization: authHeader,
            },
        })
        // const order = await instance.orders.create(options);
        const order = response.data;
        order['studioId'] = body['studioId']
        order['agentId'] = agent.agentId
        order['userId'] = body['userId']
        await Order.create(order)
        res.status(200).send({ 'id': order.id, 'keyId': process.env.KEY_ID })
    } catch (e) {
        console.log(e)
        res.status(500).send(e)
    }
};

exports.processPayment = async (req, res) => {
    try {
        const body = req.body;
        log(body)
        const agent = await Agent.findOne({ studioIds: { $in: body.studioId } });
        body['agentId'] = agent.agentId
        await Schedule.create(body)
        console.log(body)
        const order = await Order.findOne({ id: body['orderId'] })
        await axios.post(`https://api.razorpay.com/v1/payments/${body['paymentId']}/capture`, {
            "amount": `${order.amount}`,
            "currency": "INR"
        }, {
            headers: {
                "Content-Type": "application/json",
                Authorization: authHeader,
            },
        })
        const formattedDate = moment(body.date).format('MMMM Do YYYY');
        await Notification.create({
            uuid: body.userId, title: 'Tour Book Requested', type: 'reviewRequest', message: `Request for your Tour on ${formattedDate} for time ${body.time} has been created. Our agent will call you asap!!!`
        })
        await Order.updateOne({ id: body['orderId'] }, { $set: { paymentId: body['paymentId'] } }).exec()
        res.status(200).json((body))
    }
    catch (e) {
        console.log(e);
        res.status(500).send('unable to make payment');

    }
};

