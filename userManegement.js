require('dotenv').config();


const salt = process.env.SALT;


if (!salt) {
    console.error("Error: PORT, HOST, or SALT environment variables are missing.");
    process.exit(1);
}

const { Sequelize, DataTypes, Op } = require('sequelize');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'database.sqlite',
    standardConformingStrings: true,
    benchmark: true,
    logging: false,
});

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

const Logger = sequelize.define("logger", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    message: DataTypes.TEXT,

}, { paranoid: true })


User.hasMany(Logger);
Logger.belongsTo(User);

User.hasMany(Files);
Files.belongsTo(User);

/**
 * Create and manage accounts for users
 */
class Account {
    constructor () {

    }

    /**
     * Check if the account exists.
     * @param {String} username The username of the account to create/look at
     * @returns {Boolean} True if the account exists, false otherwise.
     */
    static async userExists(username) {
        try {
            const user = await User.findOne({ where: { username } });
            return !!user;
        } catch (error) {
            console.error("Error checking if user exists:", error);
            return false;
        }
    }

        /**
     * Check if the account has been deleted.
     * @param {String} username account username
     * @returns {Boolean} True if the account has been deleted, false otherwise.
     */
        static async isDeleted(username) {
            try {
                if( await this.userExists(username) ) return false;

                let user = await User.findOne({ where: { username, deletedAt: {[Op.ne]: [null]} } });
                return user != null;
            } catch (error) {
                console.error("Error checking if account is deleted:", error);
                return false;
            }
        }

    /**
 * Create a new account if it does not already exist.
 * @param {String} username The username of the account to create/look at
 * @param {String} password A password, that is hashed before entering the SQL database
 * @param {String} email The email of the user's account
 * @param {"Basic" | "Admin" | "Log"} type The account type
 * @param {String | null} firstName A user's first name
 * @param {String | null} lastName A user's last name
 * @returns {Object|Boolean} Returns user data if account created successfully, or false if the account already exists or an error occurred.
 */
    static async createSafely(username, password, email, type = "Basic", firstName = null, lastName = null) {
        try {
            

            if ( !(await this.deleteAccount(username)) ) {
                return false; // Account already exists
            }

            let user = await User.create({ username, password, type, firstName, lastName, email });

            return user.toJSON();
        } catch (error) {
            console.error("Error creating account:", error);
            return false;
        }
    }

    /**
     * 
     * @param {String} username the username of the given user
     * @returns 
     */
    static async getId(username) {
        try {
            let user = await User.findOne({ where: { username: username } });
            return user ? user.id : null;
        } catch (error) {
            console.error("Error retrieving user ID:", error);
            return null;
        }
    }


        /**
     * Softly delete the account.
     * @param {String} username the users username 
     * @returns {Boolean} True if the account was deleted, false otherwise.
     */
       static async deleteAccount(username) {
            try {
                if( await this.isDeleted(username) ) return false;
    
                await User.destroy({where: {username}});

                return true;
            } catch (error) {
                console.error("Error deleting account:", error);
                return false;
            }
        }

        /**
         * restores softly deleted accounts 
         * @param {String} username the users username 
         * @returns 
         */
        static async restoreAccount(username) {
            try {
             if ( (await this.deleteAccount(username)) ) {
                return false; // Account already exists
            }
    
                await user.restore();

                return true;
            } catch (error) {
                console.error("Error restoring account:", error);
                return false;
            }
        }
    
    /**
     * Change the user's password.
     * @param {String} newPassword The new password.
     * @returns {Boolean} True if the password was successfully changed, false otherwise.
     */
    static async changePassword(username, newPassword) {
        try {
            if (newPassword === null || newPassword === undefined) {
                return false;
            }

            if ( !(await this.deleteAccount(username)) ) {
                return false;
            }


            await User.update({ password: newPassword }, {where:{username}})

            return true;
        } catch (error) {
            console.error("Error changing password:", error);
            return false;
        }
    }
}

(async () => {
    await sequelize.sync({ force: true });

    with( Account ){
        await createSafely("a", "a", "a@a");
       // console.log( (await deleteAccount("a") ) )
        console.log( (await changePassword("a", "aaa") ) )

    }
   

    
})()
