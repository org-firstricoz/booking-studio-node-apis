const faker = require('faker')
const Category = require('../database/category')
const mongoose = require('mongoose')
const generateFakeAgentData = async () => {
    try {
        // Generate fake data for agent fields
        const image = faker.image.imageUrl();
        const title = faker.name.firstName()


        // Create a new agent document with fake data
        return {
            image: image,
            title: title
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
            const result = await Category.create(randomStudio);
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
