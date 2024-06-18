const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const Studio = require('../database/studio')

const generateRandomStudioData = () => {
    const categories = ['Apartment', 'House', 'Villa', 'Condo', 'Studio'];
    const tags = ['WiFi', 'Parking', 'Pool', 'Gym', 'Kitchen'];

    return {
        rent: Math.floor(Math.random() * 5000) + 500, // Random rent between 500 and 5500
        category: categories[Math.floor(Math.random() * categories.length)],
        rating: parseFloat((Math.random() * 4) + 1).toFixed(1), // Random rating between 1.0 and 5.0
        numberOfReviews: Math.floor(Math.random() * 1000), // Random number of reviews
        name: 'Studio ' + Math.floor(Math.random() * 1000), // Generate a random studio name
        location: 'City ' + Math.floor(Math.random() * 100), // Generate a random city name
        address: 'Address ' + Math.floor(Math.random() * 1000), // Generate a random address
        tags: tags.slice(0, Math.floor(Math.random() * tags.length) + 1), // Random subset of tags
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', // Static description
        frontImage: ['https://via.placeholder.com/300'], // Static front image
        gallery: ['https://via.placeholder.com/300', 'https://via.placeholder.com/300'], // Static gallery images
        latitude: parseFloat((Math.random() * 180) - 90).toFixed(6), // Random latitude between -90 and 90
        longitude: parseFloat((Math.random() * 360) - 180).toFixed(6), // Random longitude between -180 and 180
        agents: [uuidv4(), uuidv4()],// Static agents
        image: 'https://via.placeholder.com/300'

    };
};

// Function to insert random data into MongoDB
const insertRandomData = async (count) => {
    try {
        await mongoose.connect('mongodb+srv://achiketkumar:vOwuw6eNVlaNNu8c@cluster0.rz8sgeo.mongodb.net/',);

        for (let i = 0; i < count; i++) {
            const randomStudio = generateRandomStudioData();
            await Studio.create(randomStudio);
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
