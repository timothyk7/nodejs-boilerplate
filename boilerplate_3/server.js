// Node.js Dependencies
const express = require("express");
const app = express();
const handlebars = require('express-handlebars');
const http = require("http").createServer(app);
const path = require("path");
const mongoose = require("mongoose");


var router = { 
    index: require(path.join(__dirname, "app/routes/index"))
};

var parser = {
    body: require("body-parser"),
    cookie: require("cookie-parser")
};

// Database Connection
var db = mongoose.connection;
mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://127.0.0.1/boilerplate_2');
db.on('error', console.error.bind(console, 'Mongo DB Connection Error:'));
db.once('open', function(callback) {
    console.log("Database connected successfully.");
});

// Middleware
process.chdir(path.join(__dirname, "app"));
app.set("port", process.env.PORT || 3000);
app.engine('html', handlebars({ defaultLayout: 'layout', extname: '.html' }));
app.set("view engine", "html");
app.set("views", path.join(__dirname, "app/views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(parser.cookie());
app.use(parser.body.urlencoded({ extended: true }));
app.use(parser.body.json());


// Routes
app.get("/", router.index.view);

// Setup 404 page
app.use(function(req,res){
    res.render('404');
});

// Start Server
http.listen(app.get("port"), function() {
    console.log("Express server listening on port " + app.get("port"));
});
