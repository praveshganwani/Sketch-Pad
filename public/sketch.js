let socket;
let color = '#FFF';
let strokeWidth = 4;
let username = '';
let room_code = '';
let save_button = document.getElementById('save-canvas');
let take_attendance = document.getElementById('take-attendance');
var http = new XMLHttpRequest();

take_attendance.addEventListener('click', () => {
  const rcode = select('#rcode');
  room_code = rcode.elt.outerText
    .replace('Room Code: ', '')
    .replace('(', '')
    .replace(')', '');
  window.open('http://localhost:3000/attendance?room_code=' + room_code);
  // var url = 'http://localhost:3000/attendance';
  // var params = 'room_code=' + room_code;
  // http.open('GET', url + '?' + params, true);
  // http.onreadystatechange = function () {
  //   if (http.readyState == 4 && http.status == 200) {
  //     alert(http.responseText);
  //   }
  // };
  // http.send(null);
});

function setup() {
  // Creating canvas
  const cv = createCanvas(800, 600);
  cv.position(600, 90);
  cv.background(0);
  const rcode = select('#rcode');
  room_code = rcode.elt.outerText
    .replace('Room Code: ', '')
    .replace('(', '')
    .replace(')', '');
  save_button.addEventListener('click', () => {
    saveCanvas(cv, 'Canvas-' + room_code, 'jpg');
  });

  // Start the socket connection
  socket = io.connect('http://localhost:3000');

  // Callback function
  socket.on('mouse', (data) => {
    stroke(data.color);
    strokeWeight(data.strokeWidth);
    line(data.x, data.y, data.px, data.py);
    // text(data.username, data.mouseX + 20, data.mouseY + 20);
  });

  socket.on('username', (data) => {
    console.log('Here ', data.username);
    textSize(16);
    fill(500);
    strokeWeight(1);
    text(data.username, data.x + 20, data.y + 20);
  });

  socket.on('user_joined', (users) => {
    const user = select('#user-name');
    username = user.elt.outerText.replace('Welcome, ', '');
    console.log('User Joined: ', users);
    var parent_div = document.getElementById('users');
    parent_div.innerHTML = '';
    users.forEach((user) => {
      var tag = document.createElement('div');
      tag.className = 'mb-1';
      if (username == user) {
        tag.innerHTML = user + ' (You)';
      } else {
        tag.innerHTML = user;
      }
      parent_div.appendChild(tag);
    });
  });

  socket.on('user_disconnected', (users) => {
    console.log('User Disconnected: ', users);
    var parent_div = document.getElementById('users');
    parent_div.innerHTML = '';
    users.forEach((user) => {
      var tag = document.createElement('div');
      tag.className = 'mb-1';
      if (username == user) {
        tag.innerHTML = user + ' (You)';
      } else {
        tag.innerHTML = user;
      }
      // var text = document.createTextNode(user);
      // tag.appendChild(text);
      parent_div.appendChild(tag);
    });
  });

  // Getting our buttons and the holder through the p5.js dom
  const color_picker = select('#pickcolor');
  const color_btn = select('#color-btn');
  const color_holder = select('#color-holder');
  color = color_picker.value();
  color_holder.style('background-color', color);
  const stroke_width_picker = select('#stroke-width-picker');
  const stroke_btn = select('#stroke-btn');
  strokeWidth = stroke_width_picker.value();
  // Adding a mousePressed listener to the button
  color_btn.mousePressed(() => {
    // Checking if the input is a valid hex color
    if (/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(color_picker.value())) {
      color = color_picker.value();
      color_holder.style('background-color', color);
    } else {
      console.log('Enter a valid hex value');
    }
  });

  // Adding a mousePressed listener to the button
  stroke_btn.mousePressed(() => {
    const width = parseInt(stroke_width_picker.value());
    if (width > 0) strokeWidth = width;
  });

  const clear_btn = select('#clear-canvas');
  clear_btn.mousePressed(() => {
    clear();
    cv.background(0);
  });
}

function mouseDragged() {
  const user = select('#user-name');
  const rcode = select('#rcode');
  username = user.elt.outerText.replace('Welcome, ', '');
  room_code = rcode.elt.outerText
    .replace('Room Code: ', '')
    .replace('(', '')
    .replace(')', '');
  // Draw
  stroke(color);
  strokeWeight(strokeWidth);
  line(mouseX, mouseY, pmouseX, pmouseY);
  // Send the mouse coordinates
  sendmouse(mouseX, mouseY, pmouseX, pmouseY, username, room_code);
}

function mouseReleased() {
  const user = select('#user-name');
  const rcode = select('#rcode');
  username = user.elt.outerText.replace('Welcome, ', '');
  room_code = rcode.elt.outerText
    .replace('Room Code: ', '')
    .replace('(', '')
    .replace(')', '');
  textSize(16);
  fill(500);
  strokeWeight(1);
  text(username, mouseX + 20, mouseY + 20);
  // Send the mouse coordinates
  sendusername(mouseX, mouseY, username, room_code);
}

// Sending data to the socket
function sendmouse(x, y, pX, pY, username) {
  const data = {
    x: x,
    y: y,
    px: pX,
    py: pY,
    color: color,
    strokeWidth: strokeWidth,
    username: username,
    roomCode: room_code,
  };

  socket.emit('mouse', data);
}

function sendusername(x, y, username) {
  const data = {
    x: x,
    y: y,
    color: color,
    strokeWidth: strokeWidth,
    username: username,
    roomCode: room_code,
  };

  socket.emit('username', data);
}
