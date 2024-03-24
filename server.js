require('dotenv').config() // adds the ability to create environment variables

const express = require('express');
const multer = require('multer');
const {sessionMiddleware} = require('./router.js')
const { Basic, Admin, File } = require('./userManegement.js');

const app = express();


const {PORT,HOST} = process.env;


app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded


app.set('view engine', 'ejs');
app.use(express.static('scripts'))
app.use(express.static('styles'))
app.use(sessionMiddleware);

app.get("/", async (req, res) => {
    const { valid, username, isAdmin } = req.session
    if (isAdmin && valid) {
      let data = await Admin.getAll(username);
  
  
    } else if (valid) {
      res.render('basic', { username, message: '' });
    } else {
      res.render('home', { message: "" });
    }
  
  
  })

app.post("/login",async (req, res) => {
    let { username, password } = req.body
  
    let a = await Basic.login(username, password);

    if (a) {
        req.session.valid = true
        req.session.username = username
        req.session.isAdmin = false;

        res.render('basic', { username, message: "" });
    } else {
        res.render('home', { message: "login failed" });
    }
  })

  app.post("/signup", async (req, res) => {
    let { fname, lname, username, password, email } = req.body
  
    let a = await Basic.signUp(username, password, email, fname, lname);
  
    if (a) {
      req.session.valid = true
      req.session.username = username
      req.session.isAdmin = false;
  
      res.render('basic', { username, message: ""});
    } else {
      res.render('home', { message: "sign up failed" });
    }
  });


app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);