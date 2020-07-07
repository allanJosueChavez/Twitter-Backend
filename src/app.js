'use strict'
const express = require('express');
const app = express();
const bodyParser = require("body-Parser");
const cors = require('cors');

const COMMANDS_ROUTE = require('./routes/general');

const Default_Port = 3000;
const Default_Host = 'localhost';
const Port = 'port';
const Host = 'host';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.set(Port, process.env.Port || Default_Port);
app.set(Host, process.env.Host || Default_Host);

app.use('/api', COMMANDS_ROUTE);


const Listeneable_Port = app.get(Port);
const Listeneable_Host = app.get(Host);

module.exports = { 
    app, 
    Listeneable_Host, 
    Listeneable_Port 
}