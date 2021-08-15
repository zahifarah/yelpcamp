// module to seed our database
const mongoose = require("mongoose");
const Campground = require("../models/campground"); // Campground model 
const cities = require("./cities"); // city data (city, latitude, longitute, state, etc.)
const { places, descriptors } = require("./seedHelpers"); // fake names to create fake cities and states

// connect to MongoDB via Mongoose
mongoose.connect("mongodb://localhost:27017/yelp-camp", {
    useNewUrlParser: true, // (new) URL string parser 
    useCreateIndex: true, // (new) to define indexes in schemas
    useUnifiedTopology: true // handles monitoring all the servers in a replica set or sharded cluster
});
// mongoose error handling via node
mongoose.connection.on("error", console.error.bind(console, "connection error:")); // set "this" value to console (via "bind")
mongoose.connection.once("open", () => {
    console.log("Mongoose (27017): MongoDB connected.");
});

// Takes an array + selects random index from that array
const sample = (array) => array[Math.floor(Math.random() * array.length)];

// populate our mongo database with 50 randomly generated locations from our cities.js module
const seedDB = async () => {
    await Campground.deleteMany({}); // delete all previous data to start fresh
    for (let i = 0; i < 500; i++) {
        const random1000 = Math.floor(Math.random() * 1000); // there are 1000 cities in cities.js module
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: "610690009842478ee0b44c33",
            location: `${cities[random1000].city}, ${cities[random1000].state}`, // "Modesto, California", etc. 
            title: `${sample(descriptors)} ${sample(places)}`, // "Petrified Pond", etc.
            price,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude,
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/cloud-yelp/image/upload/v1628260669/YelpCamp/elvydo2qgdjaqkancktb.jpg',
                    filename: 'YelpCamp/elvydo2qgdjaqkancktb'
                },
                {
                    url: 'https://res.cloudinary.com/cloud-yelp/image/upload/v1628260667/YelpCamp/tkihztznbbrnyhsv7jbb.jpg',
                    filename: 'YelpCamp/tkihztznbbrnyhsv7jbb'
                },
            ],
            description: "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Rerum, neque. Repellat possimus fugiat blanditiis distinctio tenetur nam! Saepe architecto voluptatem unde voluptatibus, quis quo minus perspiciatis facilis ipsam nam sed.",
        });
        await camp.save();
    }
};

// close connection once done, no need to keep it open in a seeds file
seedDB().then(() => { // async functions return a Promise --> thennable
    console.log("Seed successful. NodeJS exited.")
    mongoose.connection.close()
})