require('dotenv').config();


const salt = process.env.SALT;


if (!salt) {
    console.error("Error: PORT, HOST, or SALT environment variables are missing.");
    process.exit(1);
}



const { Sequelize, DataTypes, Op } = require('sequelize');

const byteSize = require('byte-size')
const bcrypt = require("bcrypt");
const fs = require('fs');


(async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
})();


const Files = sequelize.define("files", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },


    encoding: {
        type: DataTypes.TEXT,
        isNull: false,
    },


    mimetype: {
        type: DataTypes.TEXT,
        isNull: false,
    },

    size: {
        type: DataTypes.NUMBER,
        isNull: false,
        get() {
            let size = this.getDataValue('size');


            let c = byteSize(size)
            return c.value + c.unit
        }
    },

    originalname: {
        type: DataTypes.TEXT,
        unique: true,
        allowNull: false,
    },

    name: {
        type: DataTypes.TEXT,
        unique: false,

        set: function (name) {
            if (!name) {
                this.setDataValue("name", this.getDataValue("originalname"))
            } else {
                this.setDataValue("name", name)
            }
        }
    },

    data: {
        type: DataTypes.BLOB,
        allowNull: false,
    }
}, { paranoid: true });

const User = sequelize.define("user", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    type: {
        type: DataTypes.TEXT,
        isNull: false,
    },

    firstName: DataTypes.TEXT,
    lastName: DataTypes.TEXT,

    username: {
        type: DataTypes.TEXT,
        unique: true,
    },

    password: {
        type: DataTypes.TEXT,
        allowNull: false,

        set: function (password) {
            let hash = bcrypt.hashSync(password, salt);

            this.setDataValue('password', hash)
        }

    },

    email: {
        type: DataTypes.TEXT,
        unique: true,
        isEmail: true,
    },

}, { paranoid: true });
