const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
require("dotenv").config(); 
const _ = require("lodash");

const mongoose = require('mongoose');

const homeStartingContent = "Unleash your thoughts without constraints as Journal Mania provides an array of features to make your writing journey delightful. Seamlessly create, edit, and organize your journals as Express ensures your interactions are smooth and uninterrupted. The Node.js backend guarantees real-time updates, making collaborative writing projects a joy to undertake. Personalization takes center stage on Journal Mania. Tailor your writing environment to suit your preferences – from font styles and sizes to color schemes. Express paves the way for instant modifications, ensuring your creative space mirrors your unique identity.";

const aboutContent = "Introducing Journal Mania, a captivating online platform crafted with the dynamic duo of Node.js and Express. Dive into a world where words flow freely, and thoughts find their canvas in the digital realm. Whether you're an aspiring writer or a seasoned wordsmith, Journal Mania is your haven for creative expression.";

const contactContent = "We'd Love to Hear From You! Thank you for choosing Journal Mania as your creative writing haven. We value your thoughts, questions, and feedback. Whether you're a writer, a reader, or just curious about our platform, we're here to assist you.";

const app = express();

mongoose
    .connect(process.env.MONGODB_URI,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true
      })
    .then(() => {
        console.log('App connected to database.');
        app.listen(process.env.PORT || 5555, () => {
            console.log(`App is listening to Port: ${process.env.PORT}`);
        });
    })
    .catch((error) => {
        console.log(error);
    });

const Journal = require('./models/journalModel');

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

let posts = [];

// app.get("/", function(req, res){
//   res.render("home", {
//     startingContent: homeStartingContent,
//     posts: posts
//   });
// });

app.get("/", async function(req, res){
  try {
    const foundPosts = await Journal.find({}).sort({field:-1});
    res.render("home", {
      startingContent: homeStartingContent,
      posts: foundPosts
    });
  } catch (error) {
    console.error("Error retrieving journals:", error);
    res.render("home", {
      startingContent: homeStartingContent,
      posts: [] // Render the home page with an empty array of posts in case of an error
    });
  }
});


// async function InsertData()
// {
//   try {
//     const newJournal = await Journal.create({
//       id: 1,
//       title: 'New Journal',
//       content: 'Just something!'
//     });

//     console.log('Journal inserted successfully:', newJournal);
//   } catch (error) {
//     console.error('Error inserting journal:', error);
//   }
// }

// InsertData();

app.get("/about", function(req, res){
  res.render("about", {aboutContent: aboutContent});
});

app.get("/contact", function(req, res){
  res.render("contact", {contactContent: contactContent});
});

app.get("/compose", function(req, res){
  res.render("compose");
});

// app.post("/compose", function(req, res){
//   const post = {
//     title: req.body.postTitle,
//     content: req.body.postBody
//   };

//   posts.push(post);

//   res.redirect("/");

// });

app.post("/compose", async function(req, res){
  // Find the current maximum id in the collection
  const maxIdEntry = await Journal.findOne({}, {}, { sort: { id: -1 } });

  let newId = 1; // Default id for the first entry

  if (maxIdEntry) {
    // If there are existing entries, increment the id
    newId = maxIdEntry.id + 1;
  }

  const newJournal = new Journal({
    id: newId,
    title: req.body.postTitle,
    content: req.body.postBody
  });

  try {
    await newJournal.save();
    res.redirect("/");
  } catch (error) {
    console.error("Error inserting journal:", error);
    res.redirect("/compose"); // Redirect back to the compose page with an error message if needed
  }
});


app.get("/posts/:postId",async function(req, res){
  const requestedPostId = req.params.postId;

  try {
    // Find the journal entry by postId (or id)
    const foundPost = await Journal.findOne({ id: requestedPostId });

    if (foundPost) {
      res.render("post", {
        title: foundPost.title,
        content: foundPost.content,
        postId: foundPost.id
      });
    } else {
      // Handle case where the journal entry with the given postId was not found
      res.status(404).send("Post not found");
    }
  } catch (error) {
    console.error("Error retrieving journal:", error);
    res.status(500).send("Internal server error");
  }

  // const requestedTitle = _.lowerCase(req.params.postName);

  // posts.forEach(function(post){
  //   const storedTitle = _.lowerCase(post.title);

  //   if (storedTitle === requestedTitle) {
  //     res.render("post", {
  //       title: post.title,
  //       content: post.content
  //     });
  //   }
  // });

});

app.post("/delete/:postId", async function(req, res) {
  const postIdToDelete = req.params.postId;

  try {
    // Find and delete the journal entry by postId
    const deletedPost = await Journal.findOneAndDelete({ id: postIdToDelete });

    if (deletedPost) {
      res.redirect("/");
    } else {
      res.status(404).send("Post not found");
    }
  } catch (error) {
    console.error("Error deleting journal:", error);
    res.status(500).send("Internal server error");
  }
});


// Route to display the form with the pre-existing data
app.get("/edit/:postId", async (req, res) => {
  const postIdToEdit = req.params.postId;

  try {
    // Find the existing journal entry by postId
    const existingEntry = await Journal.findOne({ id: postIdToEdit });

    if (existingEntry) {
      // Render the "edit" template with existing data
      res.render("editPost", {
        postId: existingEntry.id,
        postTitle: existingEntry.title,
        postContent: existingEntry.content,
      });
    } else {
      res.status(404).send("Post not found");
    }
  } catch (error) {
    console.error("Error retrieving journal:", error);
    res.status(500).send("Internal server error");
  }
});


// Route to handle the form submission for updating
app.post("/edit/:postId", async (req, res) => {
  const postIdToEdit = req.params.postId;

  console.log("postTitle: ", req.body.postTitle);
  console.log("postContent: ", req.body.postContent);

  const updatedData = {
    title: req.body.postTitle,
    content: req.body.postContent
  };

  try {
    // Find the existing journal entry by postId and update its data
    console.log("postIdToEdit:", postIdToEdit);
    console.log("updatedData:", updatedData);

    const updatedJournal = await Journal.findOneAndUpdate(
      { id: postIdToEdit },
      { $set: updatedData },
      { new: true }
    );
    console.log("Updated Journal:", updatedJournal);

    if (updatedJournal) {
      res.redirect("/");
    } else {
      res.status(404).send("Post not found");
    }
  } catch (error) {
    console.error("Error updating journal:", error);
    res.status(500).send("Internal server error");
  }
});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
