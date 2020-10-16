const mongoose = require("mongoose");

mongoose.connect(
  "mongodb+srv://scrumapp-user:8RMxOBwSd5UZR8i1@cluster0.yl471.mongodb.net/scrum-app?retryWrites=true&w=majority",
  {
    //mongoose.connect('mongodb://127.0.0.1:27017/scrum-project-api', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  }
);
