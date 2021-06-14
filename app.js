// git init, npm init

// include in project
const express = require("express");
const app = express();
const path = require("path"); // node module, allows customizing file and directory paths

app.set("view engine", "ejs"); // set ejs as view engine
app.set("views", path.join(__dirname, "views")); // view directory === views

// HTTP server on port 3000
app.listen(3000, () => {
    console.log("SERVER 3000: LISTENING...")
});

// HOME
app.get("/", (req, res) => {
    res.render("home");
});
