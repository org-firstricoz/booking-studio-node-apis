const Help = require('../database/help')
const faker = require('faker')
const mongoose = require('mongoose')

async function addFakeData(count) {
    try {
        // Generate and save fake data

        return {
            title: faker.lorem.sentence(),
            description: faker.lorem.paragraph()
        }
        // Create a new document using the MyModel schema



    } catch (error) {
        console.error('Error adding fake data:', error);
    }
}


const insertRandomData = async (count) => {
    try {
        await mongoose.connect('mongodb+srv://achiketkumar:vOwuw6eNVlaNNu8c@cluster0.rz8sgeo.mongodb.net/',);

        for (let i = 0; i < count; i++) {
            const randomStudio = await addFakeData();
            const result = await Help.create(randomStudio);
            console.log(result);

        }

        console.log(`${count} random studio documents inserted successfully.`);
    } catch (error) {
        console.error('Error inserting random studio documents:', error);
    } finally {
        mongoose.disconnect();
    }
};

insertRandomData(10);