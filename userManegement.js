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
const console = require('console');


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
        allowNull: true,
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
            isValid: function(value) {
                let type = this.getDataValue("type");

                if( type === "Basic"){
                    
                } else if( type === "Admin" ){
                    let reg = /\w{7,}\d{0,4}/g

                    if( !reg.test(value) ) {
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


User.hasMany(Logger);
Logger.belongsTo(User);

User.hasMany(Files);
Files.belongsTo(User);

/**
 * Create and manage accounts for users
 */
class Account {
    constructor() {

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
            if (await this.isDeleted(username)) return false;

            await User.destroy({ where: { username } });

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
            if ((await this.deleteAccount(username))) {
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

        return bcrypt.compareSync(password, user.password);


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

    static async restore(username) {
        return await this.restoreAccount(username);
    }
}


/**
 * creates the logger class 
 */
class Log {
    static async createMessage(message, userId) {
        if (userId == null) return;
        return await Logger.create({
            message: message,
            userId: userId,


        })
    }
}

/**
 * a class dedicated to handing files for users
*/
class File extends Basic {
    constructor(username) {
        super();


        File.isValid(username).then(function(bool) {
            if(!bool)  throw new Error("the given account can not modify files")
        })

        this.username = username;
    }

    /**
     * checks if a accont is valid and basic 
     * @param {String} username the username of the user to access
     * @returns {Boolean} true if the user is authorized to have files and false otherwise
     */
    static async isValid (username) {
        if ( (await super.isDeleted(username) ) ) return false; // checks if the user exists
        else if( !(await User.findOne({where: {username, type:"Basic"}}) ) ) return false; // check if user is Basic

        return true;
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
            if( (await Account.isDeleted(username) )) return false;
            let u = await User.findOne({where:{username}});

            // Count files with the same originalname prefix
            let id = await Account.getId(username);
            let count = await this.countFiles(id, originalname);

            // Create file entry
            let f;
            if( count > 0 ) {
                f = await Files.create({ encoding, mimetype, size, originalname: originalname+"-"+ count, name, data });
            } else {
                f = await Files.create({ encoding, mimetype, size, originalname, name, data });
            }
      

           
            await f.setUser(u)

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

    async countFiles( userId, fileName ) {
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
    async getAllFiles (username) {
        let userId = await Account.getId(username);


        let files = await Files.findAll({
            where: { userId },
            attributes: { exclude: ['encoding', 'userId', 'data'] },
            raw: true
        });
        //let c = byteSize(size)
        // return  c.value + c.unit

        return files.map((json) => {
            let { id, mimetype, size, originalname, name, createdAt, updatedAt } = json


            let c = byteSize(size);


            return { id, mimetype: icon(mimetype.split("/")[1]), size: c.value + c.unit, originalname, name, createdAt, updatedAt };
        })

    }
}


(async () => {
    await sequelize.sync({ force: true });


    with (Basic) {
        await signUp("a", "a", "a@a", "a", "a")
        await signUp("b", "b", "b@b", "b", "b")
        }

    with(Admin) {
        await signUp("MalcolmAdmin", "MalcolmAdmin18$", "mstone@code.com")
    }

    let f = new File("a")

    console.log( await f.fileCreate("","a/text", 10, "apple.txt") );
    console.log( await f.fileCreate("","a/text", 10, "apple.txt") );

    

    
    


})()


module.exports = {
    Basic, Admin, File
}