const { mongoose } = require('mongoose');
const http = require('http');
const bodyParser = require('body-parser');
const express = require('express')
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const Razorpay = require('razorpay')
const otp = require('./utils/otp')
const path = require('path');
const moment = require('moment');
const imageUpload = require('express-fileupload')
const fs = require('fs');
const { table, log } = require('console');
const { Server } = require('socket.io');



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
const jwt = require('jsonwebtoken');

exports.homeview = async (req, res) => {
    try {
        const { location, uuid } = req.query;
        // log('kyu nahi ho rahi padhai')

        const recommendedStudios = await getRecommendedStudios();

        const nearbyStudios = await getNearbyStudios(location);

        const categories = await getCategories();

        const favourites = await getUserFavourites(uuid);

        const chatDetails = await getchatData(uuid);

        const rescentSearch = await getRecentSearch(uuid);

        const notifications = await getNotifications(uuid);


        res.status(200).send(JSON.stringify({ 'recent_search': rescentSearch, 'recommended': recommendedStudios, 'nearby': nearbyStudios, 'categories': categories, 'favourites': favourites, 'chatDetails': chatDetails, 'notification': notifications }))
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching home view data');
    }
}

exports.description = async (req, res) => {
    try {

        const { uid } = req.query;
        console.log(uid)
        const studio_details = await getStudioAllDetails(uid);
        const agent_details = await getAgentDetails(uid);
        const review_details = await getReviewData(uid);

        // 
        res.status(200).send({ agent_details: agent_details, studio_details: studio_details, review_details: review_details })
    } catch (error) {

        res.status(500).send('unable to fetch data');
    }
}

exports.createReview = async (req, res) => {
    try {

        const body = req.body;
        const uuid = body['uuid']

        const user = await User.findOne({ uuid: uuid }).select('name photoUrl')
        console.log(body)

        const review_data = await Review.create({
            review: body['review'],
            rating: body['rating'],
            uuid: uuid,
            studio_id: body['studioId'],
        })
        const data = {
            'name': user.name,
            'reviewId': review_data.reviewId,
            'photoUrl':
                user.photoUrl,
            'review': review_data.review,
            'rating': review_data.rating,
            'time': review_data.time,
            'uuid': uuid
        }
        res.status(200).send(JSON.stringify(data))
    } catch (error) {

        res.status(500);
    }
}

exports.updateReview = async (req, res) => {
    try {
        const data = req.body;
        console.log(data);
        await Review.updateOne({ reviewId: data.reviewId }, data).exec()
        const val = await Review.findOne({ reviewId: data.reviewId })
        console.log(val);
        res.status(200).send(val.toJSON());
    } catch (e) {
        res.status(500).send(e)
    }
}

exports.deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        console.log(reviewId);
        const data = await Review.findOne({ reviewId: reviewId })
        await Review.deleteOne({ reviewId: reviewId }).exec()
        console.log(data);
        return res.status(200).send(data.toJSON())
    } catch (e) {
        res.status(500)

    }
}

exports.search = async (req, res) => {
    try {

        const { uuid, search } = req.params;
        const user = await Search.findOne({ uuid: uuid })
        if (!user) {
            await Search.create({ uuid: uuid, search: [search,] }).exec()
        } else {
            await Search.updateOne({ uuid: uuid }, { $push: { search: search } }).exec()

        }

        const getSearchResults = await getSearchResult(search)

        res.status(200).send(JSON.stringify(getSearchResults))

    } catch (e) {

        res.status(500);
    }

}

exports.updateFavourites = async (req, res) => {
    try {
        console.log('fav')
        const { studio_id, uuid } = req.body
        console.log(studio_id)
        const favourites = [];

        await Favourites.deleteMany({ uuid: uuid }).exec()
        // const data = await Favourites.create({ uuid: uuid, studio_id: studio_id[i] }).exec()
        studio_id.map(async (e) => await Favourites.create({ uuid: uuid, studio_id: e }))


        console.log(await Favourites.find({ uuid: uuid }))
        res.status(200)
    } catch (e) {
        res.status(500)
    }
}


exports.filter = async (req, res) => {
    try {
        const body = req.body;

        const data = await handleFilterMEthod(body)

        res.status(200).send(JSON.stringify(data))
    } catch (error) {
        res.status(500).send('error')

    }
}

exports.getAgent = async (req, res) => {
    try {
        const { agentID } = req.query

        const agentAllData = await getAgentAllData(agentID);

        res.status(200).send(agentAllData)

    } catch (error) {
        res.status(500);
    }
}




async function getAgentAllData(agentID) {
    const AgentData = await Agent.findOne({ agentId: agentID })
    return AgentData.toJSON();
}


async function handleFilterMEthod(body) {
    const ListOfStudios = await Studio.find({
        $or: [{
            tags: { $in: body['amenities'] }
        }, {
            rent: { $lt: body['price'] }
        }, {
            category: body['category']
        }, {
            rating: { $lt: body['rating'] }
        }]
    })
    if (ListOfStudios.length != 0) {

        return ListOfStudios.map((e) => e.toJSON())
    }
    return [];
}





async function getRecommendedStudios() {
    const listORecomendedStudios = await Studio.find({ rating: { $gt: 4 } }).limit(4);


    if (listORecomendedStudios.length != 0) {

        return listORecomendedStudios.map((e) => e.toJSON());
    }
    return [];
}
async function getNearbyStudios(location) {

    const ListOfNearbyStudios = await Studio.find({ location: location }).limit(4);
    // console.log(ListOfNearbyStudios)
    const listofstu = [];
    if (ListOfNearbyStudios.length != 0) {

        await Promise.all(ListOfNearbyStudios.map(async (e) => {
            const data = e.toObject()
            log(e.rating)
            const reviews = await Review.find({ studio_id: e.id })
            if (reviews) {

                const review_rating = reviews.map((e) => e.rating);
                const sum = review_rating.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
                const average_rating = sum / review_rating.length

                e['rating'] = average_rating;
            }

            listofstu.push(e.toJSON());
        }))
        log(listofstu.map((e) => e.rating))
        return listofstu;
    }
    return [];
}
async function getCategories() {
    const categories = await Categories.find({});


    if (categories.length != 0) {

        return categories.map((e) => e.toJSON());
    }
    return [];
}

async function getUserFavourites(uuid) {
    const listOfFavouritesStudioID = await Favourites.find({ uuid: uuid });
    const data = listOfFavouritesStudioID.map((e) => e.studio_id);
    const ListOfStudio = await Studio.find({ id: { $in: data } });
    // console.log(uuid)
    // console.log(ListOfStudio)
    // console.log(listOfFavouritesStudioID)
    if (ListOfStudio.length != 0) {

        return ListOfStudio.map((e) => e.toJSON());
    }
    return [];
}

async function getchatData(uuid) {
    const ListOfChatData = await Chat.find({ user_id: uuid }).sort({ time: -1 });
    const chats = []

    if (ListOfChatData.length != 0) {

        for (let i = 0; i < ListOfChatData.length; i++) {
            const agent_details = await Agent.findOne({ agentId: ListOfChatData[i].agent_id })
            var data = {
                "id": ListOfChatData[i].id,
                "agent_id": ListOfChatData[i].agent_id,
                "user_id": ListOfChatData[i].user_id,
                "unread": ListOfChatData[i].unread,
                "time": ListOfChatData[i].time,
                "agentModel": agent_details.toJSON()
            }

            chats.push(data)
        }
        return chats
    }
    return [];
}

async function getRecentSearch(uuid) {
    // Find the document with the given UUID
    const searches = await Search.findOne({ uuid: uuid }).limit(3).select('search');

    if (!searches || searches.search.length === 0) {
        return [];
    }
    return searches.search.map((e) => e).reverse().slice(0, 3);
}


async function getNotifications(uuid) {
    console.log(uuid)
    const ListOfNotification = (await Notification.find({ uuid: uuid }));

    // console.log(ListOfNotification)
    if (ListOfNotification.length != 0) {

        return ListOfNotification.map((e) => e.toJSON());
    }
    return [];

}