// Node.js Dependencies
const express = require("express");
const app = express();
const handlebars = require('express-handlebars');
const http = require("http").createServer(app);
const path = require("path");

var router = { 
    index: require("./routes/index")
};

var parser = {
    body: require("body-parser"),
    cookie: require("cookie-parser")
};

// Middleware
process.chdir(__dirname);
app.set("port", process.env.PORT || 3000);
app.engine('html', handlebars({ defaultLayout: 'layout', extname: '.html' }));
app.set("view engine", "html");
app.set("views", __dirname + "/views");
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
