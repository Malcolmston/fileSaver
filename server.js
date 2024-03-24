require('dotenv').config() // adds the ability to create environment variables

const express = require('express');
const multer = require('multer');

const app = express();


const {PORT,HOST} = process.env;

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);