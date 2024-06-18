const faker = require('faker');
const Review = require('../database/review')
const mongoose = require('mongoose')
// Function to generate random review data
const generateRandomReviewData = () => {
    return {
        uuid: "2aa7e2d3-2621-4bf6-b445-fa1df5c0c9d9", // Generate a random ObjectId
        studio_id: "da39c82a-02ee-4ce2-9afc-0b4eb0962c59", // Generate a random ObjectId
        review: faker.lorem.paragraph(), // Generate a random review text
        rating: faker.random.number({ min: 1, max: 5 }), // Generate a random rating between 1 and 5
        time: faker.date.recent() // Generate a random recent date
    };
};


const insertRandomData = async (count) => {
    try {
        await mongoose.connect('mongodb+srv://achiketkumar:vOwuw6eNVlaNNu8c@cluster0.rz8sgeo.mongodb.net/',);

        for (let i = 0; i < count; i++) {
            const randomStudio = await generateRandomReviewData();
            const result = await Review.create(randomStudio);
            console.log(result);

        }

        console.log(`${count} random studio documents inserted successfully.`);
    } catch (error) {
        console.error('Error inserting random studio documents:', error);
    } finally {
        mongoose.disconnect();
    }
};

// Usage: Insert 10 random studio documents
insertRandomData(10);
