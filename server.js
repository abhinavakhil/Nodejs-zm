const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server); //importing socketio

// PEER JS
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

const { v4: uuidv4 } = require("uuid");
//peer Server
app.use("/peerjs", peerServer);

// set view engine to ejs
app.set("view engine", "ejs");

// defining that our static files will be in public folder
app.use(express.static("public"));

app.get("/", (req, res) => {
  // res.status(200).send("Hello World!!");
  // rendering room.ejs file
  //res.render("room");
  // redirecting from / to this
  res.redirect(`/${uuidv4()}`);
  // this will automatically generate the uuid and pass it to the url (as we also define in below app.get fn :/room)
});

app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

// creating connection - in socket.io
io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    //console.log("Joined the room");
    socket.join(roomId);
    // broadcast-i.e telling that user has joined(connected)
    socket.to(roomId).broadcast.emit("user-connected", userId);

    // sending Message
    socket.on("message", (message) => {
      io.to(roomId).emit("createMessage", message);
    });
  });
});

server.listen(3030);
