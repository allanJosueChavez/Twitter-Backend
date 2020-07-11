'use strict'
const md_auth = require('../middlewares/authenticated');
const express = require('express');
const api = express.Router();

var controller = require('../controllers/general');

//api.post('/commands/:action', controller.commands);
api.post('/commands',md_auth.ensureAuth, controller.commands);


module.exports = api; 