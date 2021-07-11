let username = '';
let room_code = '';
const http = require('http');
const express = require('express');
const util = require('util');
const app = express();
const fs = require('fs');
const path = require('path');

app.use(express.static('public'));

app.set('port', '3000');

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/public');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

const server = http.createServer(app);
server.on('listening', () => {
  console.log('Listening on port 3000');
});

var mysql = require('mysql');

var con = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'sketchpad_db',
  insecureAuth: true,
});
const query = util.promisify(con.query).bind(con);

con.connect(function (err) {
  if (err) console.log(err);
  console.log('Connected!');
});

// Web sockets
const io = require('socket.io')(server);

io.sockets.on('connection', (socket) => {
  console.log('Client connected: ' + socket.id);
  var sql =
    "UPDATE users SET socket_id = '" +
    socket.id +
    "' WHERE username = '" +
    username +
    "'";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log('Socket ID updated');
  });
  socket.join(room_code);
  var sql = "SELECT * FROM USERS WHERE room_code = '" + room_code + "'";
  var users = [];
  con.query(sql, function (err, result, fields) {
    if (err) throw err;
    result.forEach((element) => {
      users.push(element.username);
    });
    io.in(room_code).emit('user_joined', users);
  });
  socket.on('mouse', (data) => {
    socket.broadcast.to(data.roomCode).emit('mouse', data);
    var sql =
      "UPDATE users SET color = '" +
      data.color +
      "', stroke_width = '" +
      data.strokeWidth +
      "' WHERE socket_id = '" +
      socket.id +
      "'";
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log('Color And Stroke Width Updated' + data.username);
    });
  });
  socket.on('username', (data) => {
    socket.broadcast.to(data.roomCode).emit('username', data);
  });
  socket.on('disconnect', () => {
    console.log('Client has disconnected');
    var sql =
      "UPDATE users SET room_code = '" +
      '' +
      "' WHERE socket_id = '" +
      socket.id +
      "'";
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log('User Disconnected');
      var sql = "SELECT * FROM USERS WHERE room_code = '" + room_code + "'";
      var users = [];
      con.query(sql, function (err, result, fields) {
        if (err) throw err;
        result.forEach((element) => {
          users.push(element.username);
        });
        io.in(room_code).emit('user_disconnected', users);
      });
    });
  });
});

server.listen('3000');

app.post('/submit', function (req, res) {
  username = req.body.username;
  var val = Math.floor(1000 + Math.random() * 9000);
  room_code = val.toString();
  var color = '#FFFFFF';
  var width = 4;
  var sql = "SELECT * FROM USERS WHERE username = '" + username + "'";
  (async () => {
    try {
      const results = await query(sql);
      if (results.length == 0) {
        sql =
          "INSERT INTO users (username, color, stroke_width, room_code) VALUES ('" +
          username +
          "', '" +
          color +
          "', '" +
          width +
          "', '" +
          room_code +
          "')";
        con.query(sql, function (err, result) {
          if (err) throw err;
          console.log('New User Inserted');
        });
      } else {
        results.forEach((element) => {
          color = element.color;
          width = element.stroke_width;
          var sql =
            "UPDATE users SET room_code = '" +
            room_code +
            "' WHERE username = '" +
            username +
            "'";
          con.query(sql, function (err, result) {
            if (err) throw err;
            console.log('Room Code Updated');
          });
        });
      }
      console.log(results);
    } finally {
      console.log(color + ' ' + width);
      res.render('sketchpad.html', {
        color: color,
        width: width,
        username: username,
        roomCode: room_code,
      });
    }
  })();
});

app.post('/join-room', function (req, res) {
  username = req.body.username;
  room_code = req.body.roomCode;
  var color = '#FFFFFF';
  var width = 4;
  var sql = "SELECT * FROM USERS WHERE username = '" + username + "'";
  (async () => {
    try {
      const results = await query(sql);
      if (results.length == 0) {
        sql =
          "INSERT INTO users (username, color, stroke_width, room_code) VALUES ('" +
          username +
          "', '" +
          color +
          "', '" +
          width +
          "', '" +
          room_code +
          "')";
        con.query(sql, function (err, result) {
          if (err) throw err;
          console.log('New User Inserted');
        });
      } else {
        results.forEach((element) => {
          color = element.color;
          width = element.stroke_width;
          var sql =
            "UPDATE users SET room_code = '" +
            room_code +
            "' WHERE username = '" +
            username +
            "'";
          con.query(sql, function (err, result) {
            if (err) throw err;
            console.log('Room Code Updated');
          });
        });
      }
      console.log(results);
    } finally {
      console.log(color + ' ' + width);
      res.render('sketchpad.html', {
        color: color,
        width: width,
        username: username,
        roomCode: room_code,
      });
    }
  })();
});

app.get('/attendance', (req, res) => {
  var room_id = req.query.room_code.toString();
  console.log(room_id);
  var sql = "SELECT * FROM USERS WHERE room_code = '" + room_id + "'";
  var users = [];
  (async () => {
    const results = await query(sql);
    results.forEach((element) => {
      users.push(element.username);
    });
    const stream = fs.createWriteStream(
      './uploads/attendance-' + room_id + '.txt'
    );
    stream.once('open', function (fd) {
      users.forEach((element) => {
        stream.write(element + '\n');
      });
      stream.end();
    });
    const file = `${__dirname}/uploads/attendance-` + room_id + `.txt`;
    console.log(file);
    res.download(
      path.join(__dirname, './uploads/attendance-' + room_id + '.txt')
    ); // Set disposition and send it.
  })();
});
