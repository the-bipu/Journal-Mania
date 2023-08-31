//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");

const homeStartingContent = "Unleash your thoughts without constraints as Journal Mania provides an array of features to make your writing journey delightful. Seamlessly create, edit, and organize your journals as Express ensures your interactions are smooth and uninterrupted. The Node.js backend guarantees real-time updates, making collaborative writing projects a joy to undertake. Personalization takes center stage on Journal Mania. Tailor your writing environment to suit your preferences – from font styles and sizes to color schemes. Express paves the way for instant modifications, ensuring your creative space mirrors your unique identity.";

const aboutContent = "Introducing Journal Mania, a captivating online platform crafted with the dynamic duo of Node.js and Express. Dive into a world where words flow freely, and thoughts find their canvas in the digital realm. Whether you're an aspiring writer or a seasoned wordsmith, Journal Mania is your haven for creative expression.";

const contactContent = "We'd Love to Hear From You! Thank you for choosing Journal Mania as your creative writing haven. We value your thoughts, questions, and feedback. Whether you're a writer, a reader, or just curious about our platform, we're here to assist you.";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

let posts = [];

app.get("/", function(req, res){
  res.render("home", {
    startingContent: homeStartingContent,
    posts: posts
    });
});

app.get("/about", function(req, res){
  res.render("about", {aboutContent: aboutContent});
});

app.get("/contact", function(req, res){
  res.render("contact", {contactContent: contactContent});
});

app.get("/compose", function(req, res){
  res.render("compose");
});

app.post("/compose", function(req, res){
  const post = {
    title: req.body.postTitle,
    content: req.body.postBody
  };

  posts.push(post);

  res.redirect("/");

});

app.get("/posts/:postName", function(req, res){
  const requestedTitle = _.lowerCase(req.params.postName);

  posts.forEach(function(post){
    const storedTitle = _.lowerCase(post.title);

    if (storedTitle === requestedTitle) {
      res.render("post", {
        title: post.title,
        content: post.content
      });
    }
  });

});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
