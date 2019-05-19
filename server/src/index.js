import '@babel/polyfill/noConflict';
import server from './server';
import express from 'express';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import path from 'path';

const app = express();
const httpServer = require('http').createServer(app);
const io = require('socket.io')(httpServer);
require('./socket')(io);
io.listen(httpServer);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/build')));
  app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '../../client/build', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/public', 'index.html'));
  });
}

app.use(cookieParser());

app.use((req, res, next) => {
  if (!req.cookies || !req.cookies.token) {
    return next();
  }
  const { token } = req.cookies;
  if (token) {
    console.log(process.env.PORT);
    const { userId } = jwt.verify(token, process.env.JWT_SECRET);
    // Put the userId onto the req for future requests to access
    req.userId = userId;
  }
  next();
});

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
    port: process.env.PORT || 4000
  },
  () => console.log(`Server is running on ${server.graphqlPath}`)
);
