const faker = require('faker');
const mongoose = require('mongoose');
const AgentDetails = require('../database/agent'); // Assuming AgentDetails is the model
const Faker = require('faker/lib');
const Unique = require('faker/lib/unique');
const { UUIDV4 } = require('sequelize');

// Function to generate fake data for agents
const generateFakeAgentData = async () => {
    try {
        // Generate fake data for agent fields
        const photoUrl = faker.image.imageUrl();
        const name = faker.name.findName();
        const number = faker.phone.phoneNumber();
        const description = faker.lorem.sentence();
        const media = [faker.image.imageUrl(), faker.image.imageUrl()];
        const qrData = faker.phone.phoneNumber();
        const email = faker.internet.email();
        const password = faker.internet.password();
        const status = faker.animal.bird().split()[0]

        // Create a new agent document with fake data
        return {
            password: password,
            photoUrl: photoUrl,
            number: number,
            name: name,
            qrData: qrData,
            email: email,
            media: media,
            description: description,
            status: status
        }


    } catch (error) {
        console.error('Error generating fake agent data:', error);
    }
};

// Call the function to generate fake data for agents


const insertRandomData = async (count) => {
    try {
        await mongoose.connect('mongodb+srv://achiketkumar:vOwuw6eNVlaNNu8c@cluster0.rz8sgeo.mongodb.net/',);

        for (let i = 0; i < count; i++) {
            const randomStudio = await generateFakeAgentData();
            const result = await AgentDetails.create(randomStudio);
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
