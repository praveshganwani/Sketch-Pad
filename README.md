# SketchPad!!!
Real Time Canvas Sharing Application implemented using Socket Programming

Our project “SketchPad!” tries to eliminate these virtual boundaries by bringing in real time canvas which can be shared amongst a team. This will help the team members to not only express their ideas or views virtually but also enhance other team members’ ideas and collaborate on a project.

## Technology Stack

- Front End: HTML, CSS, p5 JavaScript Library
- Back End: Node.JS
- Database: MySQL

## Architecture and Working

The p5 JS library provides us with a canvas over the front end. This canvas not only captures mouse strokes but also enables us to use metadata (i.e. width of the stroke, color of the stroke, etc.) along with primary X and Y axis co-ordinates.

The back end is implemented using Node.JS over Express Framework. Sockets are primarily used for establishing multi-client single server connections.
We have used Socket.IO to enable real-time, bidirectional and event-based communication. Socket.IO is a library that enables communication between the browser and the server. It consists of -
- A Node.JS server (implemented using Socket APIs in back end).
- A JavaScript Client Library for the browser (CDN in front end).

Whenever client logins to the portal, it establishes a socket connection with the back end. The client details get stored in the MySQL database along with the default stroke width and stroke color. The client is given a feature to change the stroke width and the stroke color of the brush. These values are stored as metadata along with X and Y co-ordinates. This metadata is broadcasted to other clients connected to the server. The metadata is interpreted by p5 JS and the same stroke is drawn for every client that is connected to the server.

## UI/UX

<img src="https://user-images.githubusercontent.com/59963061/125195566-ce963900-e273-11eb-8afe-da1da6609394.png" width="90%"></img> <img src="https://user-images.githubusercontent.com/59963061/125195568-d229c000-e273-11eb-9231-b35d7c28fb7c.png" width="90%"></img> <img src="https://user-images.githubusercontent.com/59963061/125195570-d3f38380-e273-11eb-9a92-375705e77fad.png" width="90%"></img>
