require("dotenv").config();

const { Basic, Admin, File } = require('./userManegement.js');
const byteSize = require('byte-size')
const fs = require('fs');
const session = require('express-session')


const {SECRET} =  process.env;

const sessionMiddleware = session({
    secret: SECRET,
    resave: true,
    saveUninitialized: true,
  });