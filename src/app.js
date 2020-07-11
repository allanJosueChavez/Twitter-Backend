'use strict'
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const COMMANDS_ROUTE = require('./routes/general');

const app = express();
const DEFAULT_PORT = 3000;
const DEFAULT_HOST = 'localhost';
const PORT = 'port';
const HOST = 'host';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

app.set(PORT, process.env.PORT || DEFAULT_PORT);
app.set(HOST, process.env.HOST || DEFAULT_HOST);

app.use('/api', COMMANDS_ROUTE);
app.use(( res, next) => {
    res.header("Acces-Control-Allow-Origin", "*");
    res.header(
      "Acces-Control-Allow-Headers",
      "Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Acces-Control-Allow-Request-Method"
    );
    res.header("Acces-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    res.header("Allow", "GET, POST, OPTIONS, PUT, DELETE");
  
    next();
  });
const LISTENEABLE_PORT = app.get(PORT);
const LISTENEABLE_HOST = app.get(HOST);

module.exports = { 
    app, 
    LISTENEABLE_HOST, 
    LISTENEABLE_PORT 
}