const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const PORT=5555
io.on("connection", function (socket) {
  socket.on("action", function (data) {
    console.log('emit')
    io.emit("new-action", (data));
  });
});

http.listen(PORT||3000, function () {
  console.log(`listening on ${PORT} `);
});
