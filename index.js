const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");
const authRoute = require("./routes/auth");
const postRoute = require("./routes/post");
const commentRoute = require("./routes/comment");

//connect to database
mongoose.set("strictQuery", false);
mongoose
  .connect(
    "mongodb+srv://happy:1234@cluster0.2zfc2cj.mongodb.net/Blog?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log(`successfully connected`);
  })
  .catch((e) => {
    console.log(`not connected`);
  });

// middleware

// parse application/x-www-form-urlencoded

// parse application/json
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded());
//Route Middlewares

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

//import Routes

app.use("/api/user", authRoute);
app.use("/post", postRoute);
app.use("/comment", commentRoute);

app.listen(3003, () => console.log("server up and running"));
