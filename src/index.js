const express = require("express");
require("./db/mongoose");
const allowCors = require("./cors");

const userRouter = require("./routers/user");
const projectRouter = require("./routers/project");
const sprintRouter = require("./routers/sprint");
const backlogRouter = require("./routers/backlog");
const storyRouter = require("./routers/story");
const taskRouter = require("./routers/task");
const playerRouter = require("./routers/player");
const dailymeetingRouter = require("./routers/dailymeeting");

const port = process.env.PORT || 5000;
const app = express();
app.use(allowCors);
app.use(express.json());

app.use(userRouter);
app.use(projectRouter);
app.use(sprintRouter);
app.use(backlogRouter);
app.use(storyRouter);
app.use(taskRouter);
app.use(playerRouter);
app.use(dailymeetingRouter);

app.listen(port, () => {
  console.log("Server is up on port: " + port);
});
