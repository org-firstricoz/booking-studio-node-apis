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
require('dotenv').config();
const authHeader =
    "Basic " + Buffer.from(`${process.env.KEY_ID}:${process.env.KEY_SECRET}`).toString("base64");


// Assuming authHeader is defined in your configuration

exports.registerAgent = async (req, res) => {
    // console.log(JSON.parse(req.body.fields));
    try {
        const media = [];
        for (let medias in req.files) {
            if (medias != "photoUrl" || medias != "documentFront" || medias != "documentBack") {
                media.push(req.files[medias].data)
            }
        }


        let { photoUrl, documentFront, documentBack } = req.files
        const { name,
            description,
            qrData,
            address,
            city,
            state,
            businessName,
            pincode,
            services,
            email,
            documentType,
            documentNumber } = JSON.parse(req.body.fields);
        const number = JSON.parse(req.body.fields).phoneNumber
        photoUrl = photoUrl.data
        const documentFrontBuffer = documentFront.data
        const documentBackBuffer = documentBack.data
        console.table(photoUrl);

        const agent = await Agent.create({
            photoUrl,
            name,
            email,
            address,
            number,
            city,
            state,
            businessName,
            pincode,
            services,
            documentType,
            documentNumber,
            description,
            qrData,
            media,
            documentBackBuffer,
            documentFrontBuffer,
        });
        console.log(agent);
        const userData = {

            name: agent.name,
            email: agent.email,
            contact: agent.number,
            type: "employee",
            reference_id: agent.agentId,
        }
        const response = await axios.post("https://api.razorpay.com/v1/contacts",
            userData,

            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: authHeader,
                },
            })
        agent.updateOne({ $set: { 'contact_id': response.data.id } }).exec()
        res.send({ "isVerified": "pending", 'agentId': agent.agentId })
    }
    catch (e) {
        console.log(e);
        res.status(500).send('INTERNAL ERROR')
    }
};



exports.verifyAgent = async (req, res) => {
    try {
        const { agentId } = req.params;
        log(agentId);
        const agent = await Agent.findOne({ agentId: agentId })
        // console.log(agent.photoUrl);
        res.status(200).json({ "isVerified": agent.isVerified, 'agent_details': agent.toJSON() });
    }
    catch (e) {
        res.status(300).send('INTERNAL SERVER ERROR')
    }
}

exports.createStudio = async (req, res) => {
    // console.log
    //     (req.files)
    const frontImage = req.files.FrontImage.map((e) => e.data);
    const gallery = req.files.Gallary.map((e) => e.data);
    const image = req.files.Cover.data

    const {
        name, rent, category, location, address, tags, description, latitude, longitude, agents
    } = JSON.parse(req.body.fields);
    const studio = await Studio.create({
        frontImage, gallery, image,
        name, rent, category, location, address, tags, description, latitude, longitude, agents
    })

    await Agent.updateOne({ agentId: agents[0] }, { $push: { studioIds: studio.id } })
    console.log(studio);
    res.status(200).send(studio.toJSON());
};


exports.updateAgentSchedule = async (req, res) => {
    try {
        const { agentId, id, status } = req.params;
        const scheduleUpdate = await Schedule.findByIdAndUpdate(id, { $set: { status: status } }).exec()
        const schedules = await Schedule.find({ agentId: agentId })
        if (status == 'accepted') {
            const order = await Order.findOne({ id: scheduleUpdate.orderId });
            await Agent.updateOne({ agentId: agentId }, { $inc: { amount: order.amount / 100 } });

            await Notification.create({
                uuid: scheduleUpdate.userId,
                date: scheduleUpdate.date,
                type: "tourBooked",
                title: "Ready for Your arrival",
                message: `Your Studio visit has been Scheduled by our Agent on ${scheduleUpdate.date} at ${scheduleUpdate.time} . Please visit at the alloted time`

            })
        }
        else if (status == 'rejected') {
            const schedule = await Schedule.findById(id)
            const order = await Order.findOne({ id: schedule.orderId });
            axios.post(`https://api.razorpay.com/v1/payments/${schedule.paymentId}/refund`, { 'amount': order.amount }, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: authHeader,
                },
            })
            await Notification.create({
                uuid: scheduleUpdate.userId,
                date: scheduleUpdate.date,
                type: "alert",
                title: "Your Request has been rejected",
                message: `Your Studio visit has been rejected by our Agent on ${scheduleUpdate.date} at ${scheduleUpdate.time} . Your money will be refunded within 1-7 working days. Sorry for the inconvinience.`

            })
        }
        console.log(schedules)
        let schedule = await Promise.all(schedules.map(async (e) => {
            const user = await User.findOne({ uuid: e.userId });
            // e.id,e.userId,e.agentId,e.date,e.time,e.orderId,e.paymentId,e.status,e.studioId
            const data = {
                "id": e.id,
                "userId": e.userId,
                "agentId": e.agentId,
                "time": e.time,
                "date": e.date, // Corrected typo: "data" should be "date"
                "orderId": e.orderId,
                "paymentId": e.paymentId,
                "status": e.status,
                "studioId": e.studioId,
                "userName": user.name,
                "usernumber": user.phoneNumber,
                'userEmail': user.email,
                "studioName": ""
            };

            return data;
        }));


        res.status(200).send(schedule);

    }
    catch (e) {
        log(e)
        res.status(300).send("INVALID RESPONSE FROM SERVER")
    }
}

exports.updateAgent = async (req, res) => {
    try {
        const { agentId } = req.params
        const body = JSON.parse(req.body.fields);
        const photoUrl = req.files.photoUrl['data']
        body['photoUrl'] = photoUrl
        log(body);
        const data = await Agent.updateOne({ agentId: agentId }, body)
        log(data);
        const agent = await Agent.findOne({ agentId: agentId })
        // log(agent.toJSON())

        res.status(200).send(agent.toJSON())
    } catch (e) {
        res.status(300).send("INTERNAL SERVER ERROR")
    }
}


exports.getBankDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const bank = await Bank.find({ agentId: id })

        const banks = bank.map((e) => e.toJSON());
        log(banks)
        return res.status(200).send(banks);

    } catch (error) {
        res.status(300).send("INTERNAL SERVER ERROR");

    }
}

exports.addBankAccount = async (req, res) => {
    try {
        const { id } = req.params;
        const body = req.body;
        log(body);
        const bank_created = await Bank.create(body);
        const agent = await Agent.findOne({ agentId: body.agentId })
        const userData = {
            contact_id: agent.contact_id,
            account_type: "bank_account",
            bank_account: {
                name: bank_created.holderName,
                ifsc: bank_created.ifscCode,
                account_number: bank_created.accountNo,
            },
        };
        // creating a fund account
        const response = await axios.post(
            "https://api.razorpay.com/v1/fund_accounts",
            userData,

            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: authHeader,
                },
            }
        );

        bank_created.updateOne({ $set: { fund_id: response.data.id, contact_id: agent.contact_id } })
        const bank = await Bank.find({ agentId: id })

        const banks = bank.map((e) => e.toJSON());
        log(banks)
        return res.status(200).send(banks);

    } catch (error) {
        log(error)
        res.status(300).send("INTERNAL SERVER ERROR");

    }
}

exports.processWithdrawal = async (req, res) => {
    try {

        const { accountNo,
            agentId,
            amount } = req.body;
        const bank = await Bank.findOne({ accountNo: accountNo });
        const payment_data = {
            "account_number": process.env.ACCOUNT_NUMBER,
            "fund_account_id": bank.fund_id,
            "amount": amount * 100,
            "currency": "INR",
            "mode": "NEFT",
            "purpose": "payout",
            "queue_if_low_balance": true,
            "reference_id": agentId,
            "narration": "NEFT Fund Transfer",
            "notes": {
                "notes_key_1": "Tea, Earl Grey, Hot",
                "notes_key_2": "Tea, Earl Grey… decaf."
            }
        }
        const response = await axios.post("https://api.razorpay.com/v1/payouts", payment_data, {
            headers: {
                "Content-Type": "application/json",
                Authorization: authHeader,
            },
        })

        await Payout.create(response.data);
        await Agent.updateOne({ agentId: agentId }, { $inc: { amount: -amount / 100 } })
        const agent = await Agent.findOne({ agentId: agentId })
        res.status(200).send(agent.toJSON());

    } catch (error) {
        console.log(error);
        res.status(300).send("INTERNAL SERVER ERROR")
    }
}


exports.deleteAgent = async (req, res) => {
    try {
        const { agentId } = req.params;
        // console.log(req.body.number)
        if (req.body.number) {
            const agent = await Agent.findOne({ number: req.body.number })
            if (agent) {

                await Agent.deleteOne({ phoneNumber: req.body.number }).exec()
                console.log('account deleted')

                return res.status(200).json({ status: 'Success' })
            }
            return res.status(300).json({ status: false, error: 'No user Found' })
        } else {
            const data = await Agent.deleteOne({ agentId: agentId }).exec()
        }
        console.log('account deleted')
        res.status(200).send('delete')
    } catch (e) {
        console.log(e)
        res.status(500).send(e)
    }
}