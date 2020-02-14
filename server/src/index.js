import server from './server';
import express from 'express';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import path from 'path';
import Fingerprint from 'express-fingerprint';
import SocketIO from 'socket.io';
import http from 'http';
import socket from './socket';

const app = express();
const httpServer = http.createServer(app);
const dirname = __dirname || '/app/server/src';
// const httpServer = require('https').createServer(
//   {
//     key: fs.readFileSync(path.join(dirname, '../config/server.key')),
//     cert: fs.readFileSync(path.join(dirname, '../config/server.cert')),
//     requestCert: false,
//     rejectUnauthorized: false
//   },
//   app
// );

const io = new SocketIO(httpServer);
socket(io);
io.listen(httpServer);

console.log(`env is ${process.env.IS_UNDER_CONSTRUCTION}`);
if (process.env.IS_UNDER_CONSTRUCTION === 'true') {
  app.get('*', (req, res) => {
    app.use(express.static(path.join(dirname, '../../client/build')));
    res.sendFile(path.join(dirname, '../../client/build', 'construction.html'));
  });
} else if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(dirname, '../../client/build')));
  app.get('/', function(req, res) {
    res.sendFile(path.join(dirname, '../../client/build', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.sendFile(path.join(dirname, '../../client/build', 'index.html'));
  });
}

app.use(cookieParser());

app.use((req, res, next) => {
  if (!req.cookies || !req.cookies.token) {
    return next();
  }
  const { token } = req.cookies;
  if (token) {
    const { userId } = jwt.verify(token, process.env.JWT_SECRET);
    // Put the userId onto the req for future requests to access
    req.userId = userId;
  }
  next();
});

app.use(
  Fingerprint({
    parameters: [
      // Defaults
      Fingerprint.useragent,
      Fingerprint.acceptHeaders,
      Fingerprint.geoip
    ]
  })
);

server.applyMiddleware({
  app,
  path: '/graphql',
  cors: {
    credentials: true,
    origin: process.env.DOMAIN_FULL + ':' + process.env.PORT || '3000'
  }
});

httpServer.listen(
  {
    port: process.env.PORT || 4000,
    host: '0.0.0.0'
  },
  () => console.log(`Server is running on ${server.graphqlPath}`)
);
