"use strict";
const jwt = require("jwt-simple");
const moment = require("moment");
const SECRET = 'SecretKeyTwitter'


exports.ensureAuth = (req, res, next) => {
  let action = req.body.commands;
  var separate = action.split(' ');
  var command = (separate[0] != null && separate.length > 0 ? separate[0] : "");

  if (command != "REGISTER" && command != "LOGIN") {
    if (!req.headers.authorization) {
      return res.status(403).send({
        message: "You must log in for do this action."
      });
    }
    let token = req.headers.authorization.replace(/['"]+/g, "");
    try {
      var payload = jwt.decode(token, SECRET);
      if (payload.exp <= moment().unix()) {
        return res.status(401).send({
          message: "The Token was expired"
        });
      }
    } catch (ex) {
      return res.status(404).send({
        message: "Invalid Token"
      });
    }
  }


  req.user = payload;
  next();
};
