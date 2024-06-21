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

const authHeader =
    "Basic " + Buffer.from(`${process.env.KEY_ID}:${process.env.KEY_SECRET}`).toString("base64");



exports.getCategoryList = async (req, res) => {
    const categories = await getCategories();
    res.status(200).send(categories)
}

exports.getAgentHomeView = async (req, res) => {
    try {
        const { agentId } = req.params;
        console.log(agentId);
        const schedules = await Schedule.find({ agentId: agentId })

        if (schedules.length == 0) {
            return res.status(200).send([])
        }

        let data = []
        console.log(schedules)
        let schedule = await Promise.all(schedules.map(async (e) => {
            const user = await User.findOne({ uuid: e.userId });
            // e.id,e.userId,e.agentId,e.date,e.time,e.orderId,e.paymentId,e.status,e.studioId
            if (user) {
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
            }
        }));

        console.log(schedule); // Now this will log the array of objects with resolved data

        console.log(data);
        res.status(200).send(schedule);

    } catch (e) {
        console.log(e);
        res.status(200).send("INTERNAL SERVER ERROR")
    }
}

exports.getAgentChat = async (req, res) => {
    try {
        const { agentId } = req.params;
        const chat = await Chat.find({ agent_id: agentId });
        log(chat);
        const chatData = [];
        if (chat) {
            await Promise.all(chat.map(async (e) => {
                const user = await User.findOne({ uuid: e.user_id });
                if (user) {
                    const data = {
                        'name': user.name,
                        'photoUrl': user.photoUrl,
                        'time': e.time,
                        'id': e.id,
                        'userId': e.user_id,
                        'agentId': agentId,
                    }
                    chatData.push(data)
                    log(chatData)
                }
            }))
            // log(chatData);
            res.status(200).send(chatData)
        } else {

            res.status(200).send(JSON.stringify([]))
        }
    } catch (error) {
        res.status(300).send(JSON.stringify("INTERNAL SERVER ERROR"));

    }
}

exports.getStudioDescription = async (req, res) => {
    try {
        const { id } = req.params
        const allDetails = await getStudioAllDetails(id)
        const allReviews = await getReviewData(id)
        log(allReviews)
        const data = JSON.stringify({ "studio": allDetails, "review": allReviews })
        res.status(200).send(data)
    } catch (e) {
        res.status(300).send('INVALID RESPONSE FROM SERVER')
    }
}


exports.getAgentReviews = async (req, res) => {
    try {
        const { agentId } = req.params
        let reviewjson = []
        const studio = await Studio.find({ agents: { $in: [agentId] } });
        const reviews = await Promise.all(studio.map(async (e) => {
            const reviews = await Review.find({ studio_id: e.id })
            if (reviews) {

                await Promise.all(reviews.map(async (e) => {

                    const user = await User.findOne({ uuid: e.uuid })

                    const data = e.toObject();
                    data['photoUrl'] = user.photoUrl;
                    data['name'] = user.name;
                    // log(data);
                    reviewjson.push(data);

                }))
            }
        }))
        console.log(reviewjson);

        res.status(200).send(JSON.stringify(reviewjson))
    } catch (e) {
        console.log(e);
        res.status(300).send("INTERNAL SERVER ERROR")
    }
}



exports.getAgentStudios = async (req, res) => {
    try {
        const { agentId } = req.params
        const studio = await Studio.find({ agents: { $in: [agentId] } })

        const data = studio.map((e) => e.toJSON())
        res.status(200).send(JSON.stringify(data));
    } catch (e) {
        res.status(300).send(JSON.stringify("INVALID SERVER RESPONSE"))
    }
}


exports.getAgentEarnings = async (req, res) => {
    try {
        const { agentId } = req.params
        const orders = (await Order.find({ agentId: agentId })).map((e) => e.toJSON());
        const schedule = (await Schedule.find({ agentId: agentId })).map((e) => e.toJSON());
        const payouts = (await Payout.find({ reference_id: agentId })).map((e) => e.toJSON());
        res.status(200).json({ orders: orders, schedule: schedule, payouts: payouts })
    }
    catch (e) {
        res.status(300).send("INTERNAL SERVER ERROR");
    }

}



exports.getAgentIssues = async (req, res) => {
    try {
        const { agentId } = req.params;
        const issues = (await Issue.find({ agentId: agentId })).map((e) => e.toJSON());
        res.status(200).send(issues);
    } catch (e) {
        const issues = (await Issue.find({ agentId: agentId })).map((e) => e.toJSON());
        res.status(200).send(issues);
    }
}

exports.createAgentIssue = async (req, res) => {
    try {
        const { agentId } = req.params;
        log(agentId)
        const body = req.body;
        body['agentId'] = agentId;
        await Issue.create(body);
        const issues = (await Issue.find({ agentId: agentId })).map((e) => e.toJSON());
        res.status(200).send(issues);
    } catch (error) {

        log(error)
        res.status(200).send(error);
    }
}



async function getStudioAllDetails(studio_id) {
    try {
        const studio_details = await Studio.findOne({ id: studio_id }).populate('numberOfReviews').exec()
        let rating = 0;
        if (studio_details && studio_details.length != 0) {
            const review = await Review.find({ studio_id: studio_details.id }).select('rating')
            review.map((e) => {
                const ratings = (rating += e.rating) / review.length
                studio_details.rating = ratings;
            })
            return studio_details.toJSON();
        }
        return [];

    } catch (err) {
        console.log(err)
    }
}
async function getReviewData(studio_id) {

    const listofreviews = await Review.find({ studio_id: studio_id }).sort({ time: -1 })

    if (listofreviews.length == 0) {
        return []
    }
    const data = await Promise.all(listofreviews.map(async (e) => {
        const user = await User.findOne({ uuid: e.uuid });
        if (user != null) {
            return {
                'uuid': e.uuid,
                'name': user.name,
                'reviewId': e.reviewId,
                'photoUrl': user.photoUrl,
                'review': e.review,
                'rating': e.rating,
                'time': e.time,
            };
        } else {
            return
        }
    }))
    console.log
        (data)
    return data.filter((e) => e != undefined)
}





async function getCategories() {
    const categories = await Categories.find({});


    if (categories.length != 0) {

        return categories.map((e) => e.toJSON());
    }
    return [];
}