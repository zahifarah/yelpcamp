const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true // sets up an index, doesn't get parsed in validation middleware
    }
});
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);