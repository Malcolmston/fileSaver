require('dotenv').config() // adds the ability to create environment variables

const express = require('express');
const multer = require('multer');

const app = express();


const {PORT,HOST} = process.env;


app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded


app.set('view engine', 'ejs');
app.use(express.static('scripts'))
app.use(express.static('styles'))


app.use(sessionMiddleware);

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);