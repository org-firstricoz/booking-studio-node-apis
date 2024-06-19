const express = require('express');
const router = express.Router();
const { registerAgent, verifyAgent, createStudio, updateAgent, getBankDetails, addBankAccount, processWithdrawal, updateAgentSchedule, } = require('../controllers/agentControllers'); // Assuming handlers are defined somewhere
const { otp } = require('../controllers/userControllers.js');

const {
    getCategoryList,
    getAgentHomeView,
    getAgentChat,
    getStudioDescription,
    getAgentReviews,
    getAgentStudios,
    getAgentEarnings,
    getAgentIssues,
    createAgentIssue,
} = require('../controllers/agentDataControllers');

router.get('/otp', otp);
router.post('/register', registerAgent);
router.get('/verification/:agentId', verifyAgent);
router.post('/studio', createStudio);
router.get('/category', getCategoryList);
router.get('/homeview/:agentId', getAgentHomeView);
router.get('/chat/:agentId', getAgentChat);
router.get('/description/:id', getStudioDescription);
router.post('/update/:agentId', updateAgent);
router.get('/bank/get/:id', getBankDetails);
router.post('/bank/add/:id', addBankAccount);
router.post('/withdraw', processWithdrawal);
router.get('/review/:agentId', getAgentReviews);
router.post('/schedulesUpdate/:agentId/:id/:status', updateAgentSchedule);
router.get('/studio/:agentId', getAgentStudios);
router.get('/earning/:agentId', getAgentEarnings);
router.get('/issues/:agentId', getAgentIssues);
router.post('/issues/:agentId', createAgentIssue);
router.post('/delete/:agentId')
module.exports = router;
