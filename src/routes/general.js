'use strict'

const express = require('express');
const api = express.Router();

var controller = require('../controllers/general');

api.post('/commands', controller.commands);

module.exports = api;