const City = require('../database/city')
const faker = require('faker')
const mongoose = require('mongoose')
const { v4: uuidv4 } = require('uuid');
const generateFakeCitydata = async () => {
    try {
        // Generate fake data for agent fields
        const name = faker.address.city();


        // Create a new agent document with fake data
        return {
            name: name,

        }


    } catch (error) {
        console.error('Error generating fake agent data:', error);
    }
};


const insertRandomData = async (count) => {
    try {
        await mongoose.connect('mongodb+srv://achiketkumar:vOwuw6eNVlaNNu8c@cluster0.rz8sgeo.mongodb.net/',);

        for (let i = 0; i < count; i++) {
            const randomStudio = await generateFakeCitydata();
            const result = await City.create(randomStudio);
            console.log(result);

        }

        console.log(`${count} random studio documents inserted successfully.`);
    } catch (error) {
        console.error('Error inserting random studio documents:', error);
    } finally {
        mongoose.disconnect();
    }
};
insertRandomData(10)