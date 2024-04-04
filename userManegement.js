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
/**
 * based on a given date and time, this function takes a date and formats in
 * @param {Date} data a date
 * @returns {String} formatted date 
 */
const lineDate = (data) => {
    return new Date(data).toLocaleDateString('en-us', { weekday: "long", year: "numeric", month: "long", day: "numeric" })
}
/**
 * takes the sql date time and converts the date into a true date
 * @param {String} str the date
 * @returns {Date} a date that is given from the str param
 */
const SQLDate = (str) => {
    str = str.replace(" +00:00", "");
    return new Date(Date.parse(str));
}

/**
 * tests if the contents of an arrar are the same
 * @param  {...Date} dates a list of dates to compare
 * @returns {Boolean} true if the contents of the arrays are the same
 */
const sameDateds = (...dates) => {
    return dates.every((x, i) => {
        if (i + 1 < dates.length) {
            return dates[i].getTime() == (dates[i + 1].getTime())
        } else {
            return dates[i].getTime() == (dates[0].getTime())
        }
    })
}


(async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
})();

/**
 * converts file types into icons 
 * @param {String} type the file mine type
 * @returns {Url} a url of the file type
 */
function icon(type) {
    switch (type) {
        case "txt":
            return "https://cdn-icons-png.flaticon.com/512/4248/4248224.png";
        case "png":
            return "https://cdn-icons-png.flaticon.com/512/8243/8243033.png";
        case "svg":
        case "svg+xml":
            return "https://cdn-icons-png.flaticon.com/512/5063/5063253.png";
        case "jpeg":
            return "https://cdn-icons-png.flaticon.com/512/7858/7858983.png";
        case "obj":
            return "https://cdn-icons-png.flaticon.com/512/29/29536.png";
        case "gif":
            return "https://cdn-icons-png.flaticon.com/512/2306/2306094.png";
        case "webp":
            return "https://cdn-icons-png.flaticon.com/512/8263/8263118.png";
        case "bmp":
            return "https://cdn-icons-png.flaticon.com/512/8085/8085527.png";
        case "ico":
            return "https://cdn-icons-png.flaticon.com/512/1126/1126873.png";
        case "tif":
            return "https://cdn-icons-png.flaticon.com/512/8176/8176632.png";
        case "sql":
            return "https://cdn-icons-png.flaticon.com/512/4299/4299956.png";
        case "js":
        case "x-javascript":
            return "https://cdn-icons-png.flaticon.com/512/8945/8945622.png";
        case "json":
            return "https://cdn-icons-png.flaticon.com/512/136/136525.png";
        case "ts":
            return "https://cdn-icons-png.flaticon.com/512/8300/8300631.png";
        case "md":
            return "https://cdn-icons-png.flaticon.com/512/617/617467.png";
        case "cc":
            return "https://cdn-icons-png.flaticon.com/512/9095/9095099.png";
        case "cs":
            return "https://cdn-icons-png.flaticon.com/512/2306/2306037.png";
        case "c":
            return "https://cdn-icons-png.flaticon.com/512/3585/3585350.png";
        case "csv":
            return "https://cdn-icons-png.flaticon.com/512/9159/9159105.png";
        case "t":
            return "https://cdn-icons-png.flaticon.com/512/4490/4490695.png";
        case "r":
            return "https://cdn-icons-png.flaticon.com/512/8112/8112727.png";
        case "d":
            return "https://cdn-icons-png.flaticon.com/512/8112/8112877.png";
        case "h":
            return "https://cdn-icons-png.flaticon.com/512/8112/8112548.png";
        case "cs":
            return "https://cdn-icons-png.flaticon.com/512/7496/7496950.png";
        case "css":
            return "https://cdn-icons-png.flaticon.com/128/136/136527.png";
        case "html":
            return "https://cdn-icons-png.flaticon.com/512/136/136528.png";
        case "htm":
            return "https://cdn-icons-png.flaticon.com/512/136/136528.png";
        case "stylus":
            return "https://cdn-icons-png.flaticon.com/512/3650/3650875.png";
        case "sass":
            return "https://cdn-icons-png.flaticon.com/512/919/919831.png";
        case "php":
            return "https://cdn-icons-png.flaticon.com/512/2306/2306154.png";
        case "py":
            return "https://cdn-icons-png.flaticon.com/512/3098/3098090.png";
        case "node":
            return "https://cdn-icons-png.flaticon.com/512/5968/5968322.png";
        case "mp3":
            return "https://cdn-icons-png.flaticon.com/512/2306/2306139.png";
        case "mp4":
            return "https://cdn-icons-png.flaticon.com/512/1719/1719843.png";
        case "wav":
            return "https://cdn-icons-png.flaticon.com/512/8263/8263140.png";
        case "acc":
            return "https://cdn-icons-png.flaticon.com/512/8300/8300275.png";
        case "flac":
            return "https://cdn-icons-png.flaticon.com/512/730/730567.png";
        case "mp2":
            return "https://cdn-icons-png.flaticon.com/512/8300/8300531.png";
        case "mp1":
            return "https://cdn-icons-png.flaticon.com/512/8300/8300500.png";
        case "doc":
            return "https://cdn-icons-png.flaticon.com/512/4725/4725970.png";
        case "pdf":
        case "octet-stream":
            return "https://cdn-icons-png.flaticon.com/512/136/136522.png";
        case "jpg":
            return "https://cdn-icons-png.flaticon.com/512/337/337940.png";
        case "xls":
            return "https://cdn-icons-png.flaticon.com/512/3997/3997638.png";
        default:
            return "https://cdn-icons-png.flaticon.com/512/660/660726.png";
    }
}

const Files = sequelize.define("files", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },


    encoding: {
        type: DataTypes.TEXT,
        allowNull: false,
    },


    mimetype: {
        type: DataTypes.TEXT,
        allowNull: false,
    },

    size: {
        type: DataTypes.NUMBER,
        allowNull: false,
        get() {
            let size = this.getDataValue('size');


            let c = byteSize(size)
            return c.value + c.unit
        }
    },

    originalname: {
        type: DataTypes.TEXT,
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

        validate: {
            isValid: function (value) {
                let type = this.getDataValue("type");

                if (type === "Basic") {

                } else if (type === "Admin") {
                    let reg = /\w{7,}\d{0,4}/g

                    if (!reg.test(value)) {
                        throw new Error("A admin username must have atlest 7 letters and can have up to 4 numbers")
                    }
                }
            }
        }
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

const Rooms = sequelize.define("room", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.TEXT,
        unique: true,
        allowNull: false
    }
}, { paranoid: true })

const Members = sequelize.define("member", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    place: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        allowNull: false
    },
    switch: {
        type: DataTypes.TINYINT,
        get: function () {
            let value = this.getDataValue("switch");
            if (value == -1 || value == null) return -1
            else if (value == 0 && value != null) return 0
            else if (value == 1 && value && value != null) return 1;
            else return -1;
        },
        validate: {
            isSwitch(value) {
                if (!(value >= -1 && value <= 1)) {
                    throw new Error("invalid value" + value + " is not a switch");
                }

            }
        }
    }
})

const Tokens = sequelize.define("token", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    key: {
        type: DataTypes.TEXT,
        unique: true,
        allowNull: false
    },
    uses: {
      type: DataTypes.INTEGER,
      defaultValue: 100,
    }
}, { paranoid: true })

User.hasMany(Logger);
Logger.belongsTo(User);

User.hasMany(Files);
Files.belongsTo(User);

Rooms.hasMany(Files);
Files.belongsTo(Rooms);

User.hasMany(Tokens);
Tokens.belongsTo(User);

User.belongsToMany(Rooms, { through: Members })
Rooms.belongsToMany(User, { through: Members })

/**
 * Create and manage accounts for users
 */
class Account {
    constructor() {

    }

    /**
     * gets the total amount of accounts
     * @param {String} type the account type
     * @returns the total amout of found users
     */
    static async count (type = "Basic") {
        let {count} = await User.findAndCountAll({where: {type}})

        return count;
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
            if (await this.userExists(username)) return false;

            let user = await User.findOne({ where: { username, deletedAt: { [Op.ne]: [null] } } });
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
            if (!(await this.deleteAccount(username))) {
                return false; // Account already exists
            }

            let user = await User.create({ username, password, type, firstName, lastName, email });

            await Log.createMessage("Acccount was created", user.id)

            return user.toJSON();
        } catch (error) {
            // console.error("Error creating account:", error);
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
            console.error("Error retrieving user ID:");
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
            if (await this.isDeleted(username)) return false;

            await User.destroy({ where: { username } });
            await Log.createMessage("Acccount was deleted", (await Account.getId(username)))

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
            if (!(await this.deleteAccount(username))) {
                return false; // Account already exists
            }

            await User.restore();
            await Log.createMessage("Acccount was restored", (await Account.getId(username)))

            return true;
        } catch (error) {
            console.error("Error restoring account:", error);
            return false;
        }
    }


    /**
     * Change the user's first name.
     * @param {String} firstName The new first name.
     * @returns {Boolean} True if the first name was successfully changed, false otherwise.
     */
    static async changeFirstName(username, firstName) {
        try {
            if ((await this.isDeleted(username))) {
                return false;
            }
            let a = await User.update({ firstName }, { where: { username }, limit: 1 });
            await Log.createMessage("Acccount first name was changed", (await Account.getId(username)))


            return a[0] == 1;
        } catch (error) {
            console.error("Error changing first name:", error);
            return false;
        }
    }

    /**
    * Change the user's last name.
    * @param {String} lastName The new first name.
    * @returns {Boolean} True if the first name was successfully changed, false otherwise.
    */
    static async changeLastName(username, lastName) {
        try {
            if ((await this.isDeleted(username))) {
                return false;
            }
            let a = await User.update({ lastName }, { where: { username }, limit: 1 });
            await Log.createMessage("Acccount last name was changed", (await Account.getId(username)))

            return a[0] == 1;
        } catch (error) {
            console.error("Error changing last name:", error);
            return false;
        }
    }

    /**
* Change the user's username.
* @param {String} username.
* @param {String} newUsername  the new username.
* @returns {Boolean} True if the first name was successfully changed, false otherwise.
*/
    static async changeUsername(username, newUsername) {
        try {
            if ((await this.isDeleted(username))) {
                return false;
            }
            let a = await User.update({ username: newUsername }, { where: { username }, limit: 1 });
            if (a[0] == 1) {
                await Log.createMessage("Acccount  username was changed", (await Account.getId(newUsername)))
            }
            return a[0] == 1;
        } catch (error) {
            console.error("Error changing username:", error);
            return false;
        }
    }

    /**
     * Change the user's password.
     * @param {String} newPassword The new password.
     * @returns {Boolean} True if the password was successfully changed, false otherwise.
     */
    static async changePassword(username, password) {
        try {

            if ((await this.isDeleted(username))) {
                return false;
            }
            let a = await User.update({ password }, { where: { username }, limit: 1 });
            await Log.createMessage("Acccount password was changed", (await Account.getId(username)))

            return a[0] == 1;
        } catch (error) {
            console.error("Error changing password:", error);
            return false;
        }
    }
}
/**
 * a more specilized virson of Accout that solly handes basic accounts
 */
class Basic extends Account {

    /**
* Signs a user up
* @param {String} username The username to sign up
* @param {String} password The password to sign up
* @param {String} email The email to sign up
* @param {String} firstName The first name to sign up
* @param {String} lastName The last name to sign up
* @returns {Boolean} True if signed up and false otherwise
*/
    static async signUp(username, password, email, firstName, lastName) {
        return (await Account.createSafely(username, password, email, "Basic", firstName, lastName)) != false;
    }

    /**
 * Logs a user in
 * @param {String} username The username to log in
 * @param {String} password The password to log in
 * @returns {Boolean} True if logged in and false otherwise
 */
    static async login(username, password) {
        if ((await this.isDeleted(username))) return false;

        let user = await User.findOne({ where: { username, type: "Basic" } });


        if (!user) return false;

        return bcrypt.compareSync(password, user.password);


    }

    /**
     * gets all basic users
     * @param {String} username The username to log in
     * @param {String} search the username string to search
     * @returns {Boolean} True if logged in and false otherwise
     */
    static async getUsers(username, search) {
        if (!(await this.isDeleted(username))) {
            return (await User.findAll({
                where: 
                { 
                    [Op.or]: {
                username: {[Op.like]: search},
                email: {[Op.like]: search},
                    },
                type: "Basic", 
                deletedAt: null,
                
            }, raw: true, attributes: {
                    include: [
                        "firstName",
                        "lastName",
                        "username"
                    ],
                    exclude: [
                        "updatedAt",
                        "createdAt",
                        "deletedAt",
                        "password"
                    ]
                }
            })) || false;
        }
        return false
    }

    /**
     * crates a token for a users account
     * @param {String} username The username to log in 
     * @returns {Boolean} true if the user had a token added, false otherwise
     */
    static async generateTokens(username) {
        let token = new this.Token(username);

        
       let res = await token.custom();

        return res !== null
    }

    /**
     * tokens can only be created by basic users
     */
     static Token = class Token {
  
        constructor (username) {
            this.key = require('crypto').randomBytes(64).toString('hex');
            this.username = username;
        }
        
        /**
         * creates a custom token for users
         * @param {String} username username of the user
         * @returns returns a new object with the token
         */
        async custom () {
            try {
                if( (await Token.canAdd(this.username)) ) return;


            let t = await Tokens.create({
                key: this.key
            })

            let a = await User.findOne({where: {username: this.username}})

            t.setUser(a)

            return t;
            } catch (e) {
                console.log(e)
                return null;
            }
        }

        /**
         * uses a users token
         * @param {String} username username of the user
         */
        async use () {
            let username = this.username;

            let t =  await Tokens.findOne({
                include: { model: User, where: {username}},
            })


            t.increment({["uses"]: {by: -1}})
        }

        /**
         * Validates a user, and gaters if the account has a valid token
         * @param {String} username username of the user
         * @returns {Boolean} true if the code is valid, false otherwise
         */
        static async canAdd (username) {
            let t =  await Tokens.findOne({
                include: { model: User, where: {username}},
            })
            return t !== null;
        }

        /**
         * gets if a token key code is valid
         * @param {String} room a room id
         * @returns {Boolean} true if the code is valid
         */
        static async validate (key) {
            let r = await Tokens.findOne({where: {key}, raw: true});
            return r !== null;
        }


    }
}

/**
 * the admin class like the basic class create admin spicivic users
 */
class Admin extends Account {
    /**
* Signs a user up
* @param {String} username The username to sign up
* @param {String} password The password to sign up
* @param {String} email The email to sign up
* @param {String} firstName The first name to sign up
* @param {String} lastName The last name to sign up
* @returns {Boolean} True if signed up and false otherwise
*/
    static async signUp(username, password, email, firstName, lastName) {
        return (await Account.createSafely(username, password, email, "Admin", firstName, lastName)) != false;
    }

    /**
* Logs a user in
* @param {String} username The username to log in
* @param {String} password The password to log in
* @returns {Boolean} True if logged in and false otherwise
*/
    static async login(username, password) {
        if ((await this.isDeleted(username))) return false;

        let user = await User.findOne({ where: { username, type: "Admin" } });

        return bcrypt.compareSync(password, user.password);


    }
    /**
     * this function restores account, using the Account version
     * @param {String} username the username of the basic user to restore
     * @see Acccount.restoreAccount
     */
    static async restore(username) {
        return await this.restoreAccount(username);
    }
}


/**
 * creates the logger class 
 */
class Log {
    /**
     * this function creates messages
     * @param {String} message the action that is done
     * @param {number} userId the id of the user that did the transaction
     * @param {number | null} fileId the file that the transaction is linked to
     * @returns {boolean} true if the transaction was successful
     */
    static async createMessage(message, userId, fileId = null) {
        if (userId == null) return;
        return (await Logger.create({
            message: message,
            userId: userId,
            fileId: fileId
        })) != null
    }
}

/**
 * a class dedicated to handing files for users
*/
class File extends Basic {
    constructor(username) {
        super();


        File.isValid(username).then(function (bool) {
            if (!bool) throw new Error("the given account can not modify files")
        })

        this.username = username;
    }

    /**
     * checks if a accont is valid and basic 
     * @param {String} username the username of the user to access
     * @returns {Boolean} true if the user is authorized to have files and false otherwise
     */
    static async isValid(username) {
        if ((await super.isDeleted(username))) return false; // checks if the user exists
        else if (!(await User.findOne({ where: { username, type: "Basic" } }))) return false; // check if user is Basic

        return true;
    }

    /**
* Check if the file has been deleted.
* @param {String} fileName the name of the file to check
* @returns {Boolean} True if the file has been deleted, false otherwise.
*/
    async isDeleted(fileName) {
        try {
            let file = await Files.findOne({ where: { [Op.or]: { name: fileName, originalname: fileName }, deletedAt: { [Op.ne]: [null] } } });

            return file != null;
        } catch (error) {
            console.error("Error checking if account is deleted:", error);
            return false;
        }
    }

    /**
     * delets a file softly
     * @param {integer} fileId the id of a file to delete
     * @returns {boolean} true if the file is deleted
     */
    async deleteFile(fileId) {
        try {

            await Files.destroy({ where: { id: fileId } });

            await Log.createMessage("a file was deleted", (await Account.getId(this.username)), fileId)

            return true;
        } catch (error) {
            console.error("Error deleting account:", error);
            return false;
        }
    }

    /**
 * restores deleted file
 * @param {integer} fileId the id of a file to restore
 * @returns {boolean} true if the file is restored
 */
    async restoreFile(fileId) {
        try {
            await Files.restore({ where: { id: fileId } });

            await Log.createMessage("a file was restored", (await Account.getId(this.username)), fileId)

            return true;
        } catch (error) {
            console.error("Error restoring account:", error);
            return false;
        }
    }

    /**
     * this function creates file for users.
     * @param {String} encoding the files encoding style. THis dose not matter right now, but cirten file types could be utf8 
     * @param {String} mimetype the files minetype
     * @param {integer} size the size of a file
     * @param {String} originalname the original name of the file to be created
     * @param {String | null} name either the original name of the file or a custum alias for the file
     * @param {Blob} data the file as a blob to be added to the array
     * @returns {Boolean} true if the file was added successfully;
     */
    async fileCreate(encoding, mimetype, size, originalname, data, name = null) {
        let username = this.username;
        try {
            if ((await Account.isDeleted(username))) return false;
            let u = await User.findOne({ where: { username } });

            // Count files with the same originalname prefix
            let id = await Account.getId(username);
            let count = await this.countFiles(id, originalname);

            // Create file entry
            let f;
            if (count > 0) {
                f = await Files.create({ encoding, mimetype, size, originalname: originalname + "-" + count, name, data });
            } else {
                f = await Files.create({ encoding, mimetype, size, originalname, name, data });
            }



            await f.setUser(u)

            await Log.createMessage("a new file was created", id, f.id)


            return true;
        } catch (error) {
            console.error('Error in fileCreate:', error);
            return false; // Return null on error
        }
    }

    /**
     * counts simmilar file names all created by a cirten user
     * @param {Integer} userId th id that corisponds to a user in a databace
     * @param {String} fileName the name of the file
     * @returns {integer} the amout of files %(like) a filename
     */

    async countFiles(userId, fileName) {
        // Count files with the same originalname prefix
        const { count } = await Files.findAndCountAll({
            where: {
                userId,
                originalname: {
                    [Op.like]: fileName + "%"
                }
            }
        });

        return count;

    }

    /**
     * gets a list of all the files from a user
     * @param {String} username the username of the account to get information
     * @returns {ArrayList<JSON>} returns a list of the found file
     */
    static async getAllFiles(username, room = null) {
        let userId = await Account.getId(username);
        let roomId = room ? (await Groups.getRoom(room)) : null
        roomId <= 0 ? null : roomId;


        let files = await Files.findAll({
            where: { userId, roomId },
            attributes: { exclude: ['encoding', 'userId', 'data'] },
            raw: true,
            paranoid: false
        });
        //let c = byteSize(size)
        // return  c.value + c.unit

        return files.map((json) => {
            // let { id, mimetype, size, originalname, name, createdAt, updatedAt } = json
            let d = byteSize(json.size)
            json.size = d.value + d.unit;

            json.createdAt = SQLDate(json.createdAt.toString());
            json.updatedAt = SQLDate(json.updatedAt.toString());

            if (sameDateds(json.createdAt, json.updatedAt)) {
                json.updatedAt = "The same as the creation time"
            } else {
                json.updatedAt = lineDate(json.updatedAt);
            }

            json.createdAt = lineDate(json.createdAt);


            json.wasDeleted = (json.deletedAt == null) ? "No" : "Yes"
            delete json.deletedAt;


            return json;//{ id, mimetype: icon(mimetype.split("/")[1]), size: c.value + c.unit, originalname, name, createdAt, updatedAt };
        })

    }

    async getSize() {
        let userId = await Account.getId(this.username);
        let json = byteSize(await Files.sum("size", { where: { userId } }))

        return json.value + " " + json.long;
    }

    /**
     * gets a users file by the file id
     * @param {String} id the file id to fetch
     * @returns {JSON | null} gets the file; however if no file is found, then null is returned
     */
    async getFile(id) {
        let userId = await Account.getId(this.username);

        return await Files.findByPk(id, { where: userId, paranoid: false, raw: true })
    }

    /**
     * this re-names fikes by there given id
     * @param {integer} id the id of the given file to change
     * @param {String} newName the new file name to change to
     * @returns {boolean} true if the file was changed
     */
    async fileRename(id, newName) {
        let username = this.username;

        try {
            if ((await this.isDeleted(username))) {
                return false;
            }
            let file = await Files.findByPk(id);
            if (file === null) return false;

            file.name = newName;

            file.save();

            return !!file;
        } catch (error) {
            console.error("Error changing file name:", error);
            return false;
        }
    }
}

/**
 * this class handes rooms
 */
class Groups {
    /**
     * adds x amouount of users to a room, where x is the amount of users.
     * @param  {...String} users a list of usernames to be added to a room
     * @returns {Boolean} true if room was added successfully
     */
    static async createRoom(...users) {
        if ((await this.isRoom(...users))) return false;

        let room = await Rooms.create({ name: Math.random().toString(36).substring(2, 7) });

        let roomPeople = users.filter(async username => {
            return !(await Account.isDeleted(username))
        })

        roomPeople = await Promise.all(roomPeople);

        roomPeople = roomPeople.map(async (username, index) => {
            let userId = await Account.getId(username);
            if (index === 0) {
                return { userId, roomId: room.id, place: 2, switch: 1 }
            } else {
                return { userId, roomId: room.id }
            }

        })

        roomPeople = await Promise.all(roomPeople);


        try {
            await Members.bulkCreate(roomPeople)
            return true
        } catch (err) {
            return false
        }
    }
    /**
     * this function gets the id of a room by its name
     * @param {Strign} name The name of the room
     * @returns {integer} n > 0 if the room exists and -1 otherwise
     */
    static async getRoom(name) {
        let r = await Rooms.findOne({ where: { name: name } })

        return r != null ? r.id : -1
    }

    /**
     * gets wether or not a room exists
     * @param  {...String} users a list of usernames to be added to a room
     * @returns {Boolean} true if the room already exists
     */
    static async isRoom(...users) {
        let userIds = users.map(async username => {
            let userId = await Account.getId(username);
            return userId
        })
        let rooms = (await Rooms.findAll({ raw: true })).map(x => x.id)


        userIds = await Promise.all(userIds);


        for (let room of rooms) {
            let { count, rows } = await Members.findAndCountAll({
                where: {
                    roomId: room, //rooms[0]
                    [Op.or]: { userId: userIds }
                },
                raw: true,
            });


            if (rows.length === users.length) {
                return true
            } else {
                continue;
            }
        }
        return false;


    }

    /**
     * this function adds users to a room
     * @param {number} roomId the id of the room to join
     * @param {String} username the username of the single user to add to the room
     * @param {0 | 1 | 2} place the users accout status
     * @returns {boolean} true if the room was successfully joined
     */
    static async append(roomId, username, place = 0) {
        let userId = await Account.getId(username);

        if (place < 0 || place > 2) place = 0;
        try {
            await Members.create({ userId, roomId: roomId, place })
            return true
        } catch (e) {
            return false;
        }
    }

    /**
     * removes a user from a given room
     * @param {number} roomId the id of the room to join
     * @param {String} username the username of the single user to remove from the room
     * @returns {boolean} true if the room was successfully left
     */
    static async pop(roomId, username) {
        let userId = await Account.getId(username);

        try {
            return (await Members.destroy({ where: { roomId, userId } })) == 1
        } catch (e) {
            return false;
        }
    }

    /**
     * gets all the room assoseaed to a user
     * @param {String} username the username of the user
     * @returns {Object | null} gets an object of all the users rooms or null
     */
    static async myRooms(username) {
        let userId = await Account.getId(username);

        if (!userId) return null;

        let memb = await Members.findAll({ where: { userId }, raw: true })
        memb = [...new Set(memb.map(room => room.roomId))]

        let res = await Members.findAll({ where: { roomId: { [Op.or]: memb } }, raw: true });

        res = await Promise.all(res.map(async (row, index) => {
            var { userId, roomId } = row;
            let joined = row.switch;

            if (joined == 2) res[index].switch = true
            else if (joined == 1) res[index].switch = false;
            else res[index].switch = null;

            let user = await User.findByPk(userId);
            let room = await Rooms.findByPk(roomId, {
                attributes: {
                    exclude: ["createdAt", "updatedAt", "deletedAt"]
                }
            });




            return { user: { firstName: user.firstName, lastName: user.lastName, username: user.username }, name: room.name, joined: res[index].switch }
        }));


        let json = {};
        for (let row of res) {
            let u = {}
            if (Object.keys(json).includes(row.name)) {
                u.user = row.user
                u.joined = row.joined
                json[row.name].push(u)
            } else {
                json[row.name] = [];

                u.user = row.user
                u.joined = row.joined
                json[row.name].push(u)

            }
        }


        return json
    }

    /**
     * this function can upgrade or down grade users place
     * @param {number} roomId the id of the room
     * @param {String} username the username of the single user
     * @param {0 | 1 | 2} newPlace the users accout status
     * @returns {boolean} true if the user placeId was changed
     */
    static async changeMember(roomId, username, newPlace) {
        let userId = await Account.getId(username);

        let a = await Members.find({ where: { roomId, userId } })

        if (!a) return false;

        a.place = newPlace;

        a.save();
        return true;
    }

    /**
     * this function creates file for users.
     * @param {number} roomId the id of the room to join
     * @param {String} encoding the files encoding style. THis dose not matter right now, but cirten file types could be utf8 
     * @param {String} mimetype the files minetype
     * @param {integer} size the size of a file
     * @param {String} originalname the original name of the file to be created
     * @param {String | null} name either the original name of the file or a custum alias for the file
     * @param {Blob} data the file as a blob to be added to the array
     * @returns {Boolean} true if the file was added successfully;
     */
    static async fileCreate(roomId, encoding, mimetype, size, originalname, data, name = null) {
        try {
            let u = await Rooms.findByPk(roomId);

            // Count files with the same originalname prefix

            // Create file entry
            let f = await Files.create({ encoding, mimetype, size, originalname, data, name});

            await f.setRoom(u)

            return true;
        } catch (error) {
            console.error('Error in fileCreate:', error);
            return false; // Return null on error
        }
    }

    /**
     * update a users acount to either joined on not joined
     * @param {number} roomId the id of the room to join
     * @param {String} username the username of the single user
     * @param {number | 1} switchValue the value to switch a user join status
     * @returns 
     */
    static async join(roomId, username, switchValue = 1) {

        let userId = await Account.getId(username);

        if (!userId) return false;

        try {
            await Members.update({ switch: switchValue }, { where: { roomId, userId } })
            return true
        } catch (e) {
            return false;
        }
    }

}



(async () => {
    await sequelize.sync({ force: false });

    
    with (Basic) {
        await signUp("a","a","a@a", "a", "a");
        await signUp("b","b","b@b", "b", "b");
        await signUp("c","c","c@c", "c", "c");

        await generateTokens("a");
    }

    with (Groups) {
        await createRoom("a", "b");
        await createRoom("b", "c");
        await createRoom("a", "c");

        await createRoom("c", "a");

        //  console.log( (await getRoom("a", "b") ))
    }
})()


module.exports = {
    Basic, Admin, File, Groups
}