require('dotenv').config();


const salt = process.env.SALT;


if (!salt) {
    console.error("Error: PORT, HOST, or SALT environment variables are missing.");
    process.exit(1);
<<<<<<< 1441a9afc1ee25c27633a7d1e81e14df7f3525e7
}
=======
}

const { Sequelize, DataTypes, Op } = require('sequelize');

const byteSize = require('byte-size')
const bcrypt = require("bcrypt");
const fs = require('fs');
>>>>>>> packages for node
