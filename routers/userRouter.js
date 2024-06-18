const express = require('express');
const { verifyEmail } = require('../middlewares/email_expression.js')

const { signup, city, otp, login, createChat, getChat,deleteUser, updateUser, helpUser } = require('../controllers/userControllers.js');
const { homeview, description, createReview, updateReview, deleteReview, search, updateFavourites, filter, getAgent } = require('../controllers/userDataControllers.js');
const { processPayment, createRequest } = require('../controllers/scheduleControllers.js')

const router = express.Router()

router.post('/signup', verifyEmail, signup)
router.get('/otp', otp)
router.get('/otp/login', login);
router.get('/city', city);
router.get('/homeview', homeview);
router.get('/description', description);
router.post('/review', createReview);
router.put('/review', updateReview);
router.delete('/review/:reviewId', deleteReview);
router.get('/search/:uuid/:search', search);
router.put('/favourites', updateFavourites);
router.post('/chat', createChat);
router.get('/chat', getChat);
router.post('/filter', filter);
router.get('/agent', getAgent);
router.post('/request', createRequest);
router.post('/payment', processPayment);
router.delete('/delete/:uuid', deleteUser);
router.post('/update/:uuid', updateUser);
router.get('/help/:params', helpUser);

module.exports = router;