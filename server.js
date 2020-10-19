let username = '';
const http = require('http');
const express = require('express');
const util = require('util');
const app = express();
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
  socket.on('mouse', (data) => {
    socket.broadcast.emit('mouse', data);
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
      console.log('Color And Stroke Width Updated');
    });
  });
  socket.on('disconnect', () => console.log('Client has disconnected'));
});

server.listen('3000');

app.post('/submit', function (req, res) {
  username = req.body.username;
  var color = '#FFFFFF';
  var width = 4;
  var sql = "SELECT * FROM USERS WHERE username = '" + username + "'";
  (async () => {
    try {
      const results = await query(sql);
      if (results.length == 0) {
        sql =
          "INSERT INTO users (username, color, stroke_width) VALUES ('" +
          username +
          "', '" +
          color +
          "', '" +
          width +
          "')";
        con.query(sql, function (err, result) {
          if (err) throw err;
          console.log('New User Inserted');
        });
      } else {
        results.forEach((element) => {
          console.log(element.color + ' INSIDE ' + element.stroke_width);
          color = element.color;
          width = element.stroke_width;
        });
      }
      console.log(results);
    } finally {
      // con.end();
      console.log(color + ' ' + width);
      res.render('sketchpad.html', {
        color: color,
        width: width,
        username: username,
      });
    }
  })();
  // con.query(sql, function (err, results, field) {
  //   if (err) throw err;
  //   if (results.length == 0) {
  //     sql =
  //       "INSERT INTO users (username, color, stroke_width) VALUES ('" +
  //       username +
  //       "', '" +
  //       color +
  //       "', '" +
  //       width +
  //       "')";
  //     con.query(sql, function (err, result) {
  //       if (err) throw err;
  //       console.log('New User Inserted');
  //     });
  //   } else {
  //     results.forEach((element) => {
  //       console.log(element.color + ' INSIDE ' + element.stroke_width);
  //       color = element.color;
  //       width = element.stroke_width;
  //     });
  //   }
  // });
});
