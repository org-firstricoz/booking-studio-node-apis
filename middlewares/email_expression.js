exports.verifyEmail = async (req, res, next) => {
    // 
    const { email } = req.body;
    // 

    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    if (!emailRegex.test(email)) {
        // If email format is invalid, send a response with status code 400 (Bad Request)
        return res.status(400).json({ error: 'Invalid email address' });

    }
    next();
}