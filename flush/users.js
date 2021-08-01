const mongoose = require("mongoose");
const User = require("../models/user");

// MongoDB via Mongoose
mongoose.connect("mongodb://localhost:27017/yelp-camp", {
    useNewUrlParser: true, // (new) URL string parser 
    useCreateIndex: true, // (new) to define indexes in schemas
    useUnifiedTopology: true, // handles monitoring all the servers in a replica set or sharded cluster
    useFindAndModify: false // handle deprecation warning for findAndUpdate() 
});
mongoose.connection.on("error", console.error.bind(console, "connection error:")); // set "this" value to console (via "bind")
mongoose.connection.once("open", () => {
    console.log("Mongoose (27017): \"yelp-camp\" connected.");
});

// 
const flushReviews = async () => {
    await User.deleteMany({}); // delete all reviews
};

// close connection once done, no need to keep it open in a seeds file
flushReviews().then(() => { // async functions return a Promise --> thennable
    console.log("All users have been deleted. NodeJS exited.")
    mongoose.connection.close()
});
