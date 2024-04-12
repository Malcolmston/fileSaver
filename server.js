require('dotenv').config() // adds the ability to create environment variables

const express = require('express');
const multer = require('multer');
const { sessionMiddleware } = require('./router.js')
const fs = require('fs');
const path = require('path');
const { Basic, Admin, File, Groups } = require('./userManegement.js');


const app = express();
const upload = multer();


const { PORT, HOST } = process.env;

const handle = async (req, res) => {
    if( req.session.valid ){
        return false
    } else  {
        let r = await Basic.Token.validate( req.headers.authorization )

        if(r) {
            res.status(405).json({message: "Invalid token", ok: false})
            return true;
         } else {
            let token = new Basic.Token( req.params.username || req.body.username || req.query.username);

            if( (await token.use()) ){
                return false;
            } else {
                 res.status(403).json({message: "token has been used all 100 times", ok: false})
                 return true
            }

         }

    }

     

  
}

app.use(express.json({ limit: '1gb' })) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded


app.set('view engine', 'ejs');
app.use(express.static('scripts'))
app.use(express.static('styles'))
app.use(sessionMiddleware);

app.get("/", async (req, res) => {
    const { valid, username, isAdmin } = req.session
    if (isAdmin && valid) {
    } else if (valid) {
        res.render('basic', { username, message: '' });
    } else {
        res.render('home', { message: "" });
    }


})

app.get("/myFiles/:room", async (req, res) => {
    let room = req.params.room;
    let username = req.session.username;



    try {
        let userId = await Basic.getId(username);
        let roomId = await Groups.getRoom(room);

        if (!userId) {
            res.status(403).json({ message: "you must log in inorder to user this feture", ok: false });
        } else if (roomId <= 0) {
            res.status(403).json({ message: "you must select a valid room", ok: false });
        }

        let files = JSON.stringify((await File.getAllFiles(null, room)))

        let size = 0//(await file.getSize());
        return res.status(200).render("./basic_tabs/fileHandle", { username, files, size })


    } catch (e) {
        console.error(e)
        res.status(500).json({ message: "the given username is not valid", ok: false })
    }
})

app.get("/api/v1/myFiles", async (req, res) => {
    let { username, json } = req.query
    if (!username)  return res.status(403).json({ message: "you must log in inorder to user this feture", ok: false });


    const file = (new File(username));

    json = (json == "true" ? true : false)

    try {

        let files = JSON.stringify((await File.getAllFiles(username)))
        let size = (await file.getSize());
        if (json) {
            res.json({ files })
        } else {
            res.render("./basic_tabs/fileHandle", { username, files, size })
        }

    } catch (e) {
        console.error(e)
        res.status(500).json({ message: "the given username is not valid", ok: false })
    }
})

app.get('/api/v1/getFile', async (req, res) => {
    let { id, json, username } = req.query;

    json = (json == "false" ? false : true)
    json = json || false;

    if (!id) res.status(400).send({ message: "File ID is required.", ok: false });
    if (!username) res.status(400).send({ message: "username is required", ok: false });

    try {
        let file = new File(username);

        let f = await file.getFile(id);
        if (!f) return res.status(404).send({ message: "The chosen file dose not exist." });

        if (json) {
            res.status(200).send(f)
        } else {
            res.setHeader('Content-Type', f.mimetype);
            res.send(f.data);
        }

    } catch (e) {
        console.error(e);
        return res.status(500).send({ message: "Error " + e, ok: false });
    }
})

app.get("/api/v1/count", async (req, res) => {
    try {
   if( !(await handle(req, res)) ) {
    let c = await Basic.count();
        res.status(200).json(c);
    }
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: err.message, ok: false });
    }


})

app.get('/api/v1/users', async (req, res) => {
    let { username, search } = req.query;
    if( !(await handle(req, res)) ) {

    if (!username) {
        res.status(403).json({ message: "you must log in inorder to user this feture", ok: false });
    }
    try {
        let all;
        if( username == search) {
            all = {};
            all[username] = "you";
        } else {
            all = (await Basic.getUsers(username, search))
        }
        res.status(200).json(all);
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: err.message, ok: false });
    }
}


})

app.get("/api/v1/getUser", async (req, res) => {
    let { username, json, page} = req.query;

    json = (json == "true" ? true : false)
   

    if( !username  ) return res.status(400).json({ message:"please give a username", ok: false});

    if( !req.session.isAdmin  ) return res.status(400).json({ message:"to use this you must be admin", ok: false});
    try {
        if( !(await handle(req, res)) ) {
            let c = await Admin.getUser(username);
            let logs = await Admin.getLogs(username);

            c.logs = logs;
            if(json) {
                res.status(200).json(c);
            } else {
                const directoryPath = path.join(__dirname, 'views/admin_tabs');

                switch (page) {
                    case "1":
                        res.render("./admin_tabs/home", c);
                        break;
                    case "2":
                        res.render("./admin_tabs/account", c);
                        break;
                    case "3":
                        res.render("./admin_tabs/account_logs", c);
                        break;
                    case "all":
                    default:
                        fs.readdir(directoryPath, function (err, files) {
                            // handling error
                            if (err) {
                                res.status(500).json({ message: err.message, ok: false });
                            }
                
                            let d = {};
                            // Render all admin tabs
                            d["data"] = c
                            d["logs"] = logs

                            files.forEach(function (file) {
                                // Extract file name without extension
                                const tabName = path.parse(file);
                               
                                
                                let n = fs.readFileSync(directoryPath+"/"+file, "utf8");

                                d[tabName.name] = n;

                            });

                            res.status(200).json(d)
                        });
                        break;
                }

                
                }                
         }
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: err.message, ok: false });
         }

    
})

app.get("/room/open/:room", async (req, res) => {
    let room = req.params.room;
    let username = req.session.username;

    let userId = await Basic.getId(username);
    let roomId = await Groups.getRoom(room);


    if (!userId) {
        res.status(403).json({ message: "you must log in inorder to user this feture", ok: false });
    } else if (roomId <= 0) {
        res.status(403).json({ message: "you must select a valid room", ok: false });
    }

    res.status(200).render("rooms", { username, room })
})

app.get("/getRooms", async (req, res) => {
    let username = req.session.username;

    if (!username) {
        res.status(403).json({ message: "you must log in inorder to user this feture", ok: false });
    }

    try {
        let r = await Groups.myRooms(username)
        let reqT = [];

        for (let row in r) {
            reqT.push(row)
        }



        res.status(200).json({ arr: reqT })
    } catch (e) {
        res.status(500).json({ message: "A error has occerd on the server end", ok: false })
    }

})

app.get("/myRooms/:room", async (req, res) => {
    let room = req.params.room;
    let username = req.session.username;

    let userId = await Basic.getId(username);
    let roomId = await Groups.getRoom(room);

    if (!userId) {
        res.status(403).json({ message: "you must log in inorder to user this feture", ok: false });
    } else if (roomId <= 0) {
        res.status(403).json({ message: "you must select a valid room", ok: false });
    }

    try {
        let r = await Groups.myRooms(username)
        let reqT = {};

        for (let row in r) {
            if (row == room) {
                reqT[row] = []
                let people = r[row];
                for (let person of people) {
                    with (person) {
                        if (user.username == username) {
                            reqT[row].push(
                                (joined === null ? `<span> you </span> <input type='button' value='join' class='${row} join'/> <input type='button' value='cancel' class='${row} cancel'/>` : "you have joined")
                            );


                        } else if (joined === true && user.username != username) {
                            reqT[row].push(`${user.firstName} ${user.lastName} has joined`);
                        } else if (user.username != username && !joined) {
                            reqT[row].push(`${user.firstName} ${user.lastName} has not joined`);
                        }
                    }
                }
            }
        }



        res.status(200).render("roomGroup", { rooms: JSON.stringify(reqT) })
    } catch (e) {
        res.status(500).json({ message: "A error has occerd on the server end", ok: false })
    }
})

app.get("/api/v1/roomFiles", async (req, res) => {
    let { username, room, json } = req.query
    if (!username)  return res.status(403).json({ message: "you must log in inorder to user this feture", ok: false });

    if( !(await handle(req, res)) ) {
    const file = (new File(username));

    json = (json == "true" ? true : false)

    try {

        let files = JSON.stringify((await File.getAllFiles(null, room)))
        let size = (await file.getSize());
        if (json) {
            res.json({ files })
        } else {
            res.render("./basic_tabs/fileHandle", { username, files, size })
        }

    } catch (e) {
        console.error(e)
        res.status(500).json({ message: "the given username is not valid", ok: false })
    }
}
})

app.get("/home", async (req, res) => {
    if( req.session.username && req.session.valid) {

        if( !req.session.isAdmin  ){
            res.status(200).render('basic', { username: req.session.username , message: "" });
        } else {
            let a = await Admin.getUsers();
            res.status(200).render('admin', {users: JSON.stringify(a) });
        }

    } else {
        res.render('home', { message: "please login" });
    }

}) 

app.all("/login", async (req, res) => {
    let { username, password } = req.body

    if (!username || !password) res.status(400).render('home', { message: "login failed, please try again" });
    try {
        let a = await Basic.login(username, password);

        if (a) {
            req.session.valid = true
            req.session.username = username
            req.session.isAdmin = false;

            //res.status(200).render('basic', { username, message: "" });
            res.redirect("/home");
        } else {
            res.status(400).render('home', { message: "login failed" });
        }
    } catch (e) {
        res.status(500).render('home', { message: "login failed, due to a server error" })
    }
})

app.post("/signup", async (req, res) => {
    let { fname, lname, username, password, email } = req.body


    let a = await Basic.signUp(username, password, email, fname, lname);

    if (a) {
        req.session.valid = true
        req.session.username = username
        req.session.isAdmin = false;
        res.redirect("/home");
    } else {
        res.render('home', { message: "sign up failed" });
    }
});

app.post("/logout", (req, res) => {
    req.session.destroy();
    res.status(200).render('home', { message: "logged out" });
})

app.post("/admin", async(req, res) => {
    let { username, password } = req.body

    if (!username || !password) res.status(400).render('home', { message: "login failed, please try again" });
    try {
        let a = await Admin.login(username, password);

        if (a) {
            req.session.valid = true
            req.session.username = username
            req.session.isAdmin = true;

            //res.status(200).render('basic', { username, message: "" });
            res.redirect("/home");
        } else {
            res.status(400).render('home', { message: "login failed" });
        }
    } catch (e) {
        res.status(500).render('home', { message: "login failed, due to a server error" })
    }  
})

app.post('/fileupload', upload.array('file', 100), async (req, res) => {
    let username = req.session.username

    if (!username) {
        res.status(403).json({ message: "you must log in inorder to user this feture", ok: false });
    }


    try {
        const file_class = new File(username);

        let ans = true;


        for (let file of req.files) {
            let { encoding, mimetype, size, originalname } = file;

            let f_blob;
            if (Object.keys(file).includes("buffer")) {

                f_blob = file.buffer

            } else {
                let path = file.path;
                let fileBuffer = fs.readFileSync(path);

                // Delete the temporary file
                fs.unlinkSync(path);

                f_blob = fileBuffer
            }

            let r = await file_class.fileCreate(encoding, mimetype, size, originalname, f_blob);


            if (!r) {
                ans = false;
                break;
            } else {
                continue;
            }

        }

        if (ans) {
            res.status(200).redirect('/login');
        } else {

            res.status(402).render('basic', { username, message: `Error uploading a file` });
        }
    } catch (e) {
        console.error(e);
        res.status(500).render('basic', { username, message: 'Error uploading file.' });
    }

});

app.post('/api/v1/fileupload', upload.single("file"), async (req, res) => {
    let { username } = req.body
    let file = req.file;

    if (!username) {
        res.status(403).json({ message: "you must log in inorder to user this feture", ok: false });
    }

    if (!file) {
        res.status(400).json({ message: "you must submit a file", ok: false });
    }

    if( !(await handle(req, res)) ) {
    try {
        const file_class = new File(username);

        let { encoding, mimetype, size, originalname } = file;

        let f_blob;
        if (Object.keys(file).includes("buffer")) {

            f_blob = file.buffer

        } else {
            let path = file.path;
            let fileBuffer = fs.readFileSync(path);

            // Delete the temporary file
            fs.unlinkSync(path);

            f_blob = fileBuffer
        }

        let r = await file_class.fileCreate(encoding, mimetype, size, originalname, f_blob);


        if (!r) {
            res.status(402).json({ message: `Error uploading a file`, ok: false });
        } else {
            res.status(200).redirect('/login');
        }


    } catch (e) {
        console.error(e);
        res.status(500).json({message: 'Error uploading file.', ok: false });
    }
}

});

app.post('/room/fileupload/:room', upload.array('file', 100), async (req, res) => {
    let username = req.session.username
    let room = req.params.room

    if (username === undefined || room === undefined) {
        return res.status(403).json({ message: "input valid data", ok: false });
    }

    try {
        let userId = await Basic.getId(username);
        let roomId = await Groups.getRoom(room);



        if (!userId) {
            return res.status(403).json({ message: "you must log in inorder to user this feture", ok: false });
        } else if (roomId <= 0) {
            return res.status(401).json({ message: "you must select a valid room", ok: false });
        }


        let ans = true;

        for (let file of req.files) {
            let { encoding, mimetype, size, originalname } = file;

            let f_blob;
            if (Object.keys(file).includes("buffer")) {

                f_blob = file.buffer

            } else {
                let path = file.path;
                let fileBuffer = fs.readFileSync(path);

                // Delete the temporary file
                fs.unlinkSync(path);

                f_blob = fileBuffer
            }
            let r = await Groups.fileCreate(roomId, encoding, mimetype, size, originalname, f_blob)

            if (!r) {
                ans = false;
                break;
            } else {
                continue;
            }

        }

        if (ans) {
            return res.status(200).json({ message: `good`, ok: true });//.redirect('/login');
        } else {
            return res.status(402).json({ message: `Error uploading a file`, ok: false });
        }
    } catch (e) {
        console.error("500 fail -> " + e);
        return res.status(500).json({ username, message: 'Error uploading file.', ok: false });
    }

});

app.put("/change/fname", async (req, res) => {
    let username = req.session.username
    let fname = req.body.fname;

    if (!username) res.status(400).json({ message: "please enter a valid username", ok: false });
    if (!fname) res.status(400).json({ message: "please enter a first name", ok: false });


    with (Basic) {
        try {
            let ret = await changeFirstName(username, fname);
            if (ret) {
                res.status(200).json({ message: "Name changed", ok: true });
            } else {
                res.status(400).json({ message: 'Error changing name', ok: false });
            }
        } catch (e) {
            console.error(e);
            res.status(500).json('basic', { message: 'Error ' + e, ok: false });

        }
    }
})

app.put("/change/lname", async (req, res) => {
    let username = req.session.username
    let lname = req.body.lname;

    if (!username) res.status(400).json({ message: "please enter a valid username", ok: false });
    if (!lname) res.status(400).json({ message: "please enter a last name", ok: false });


    with (Basic) {
        try {
            let ret = await changeLastName(username, lname);
            if (ret) {
                res.status(200).json({ message: "last name changed", ok: true });
            } else {
                res.status(400).json({ message: 'Error changing name', ok: false });
            }
        } catch (e) {
            console.error(e);
            res.status(500).json('basic', { message: 'Error ' + e, ok: false });

        }
    }
})

app.put("/change/username", async (req, res) => {
    let username = req.session.username
    let new_username = req.body.new_username;

    if (!username) res.status(400).json({ message: "please enter a valid username", ok: false });
    if (!new_username) res.status(400).json({ message: "please enter a new username", ok: false });


    with (Basic) {
        try {
            let ret = await changeUsername(username, new_username);
            if (ret) {
                res.status(200).json({ message: "last username changed", ok: true });
            } else {
                res.status(400).json({ message: 'Error changing username', ok: false });
            }
        } catch (e) {
            console.error(e);
            res.status(500).json('basic', { message: 'Error ' + e, ok: false });

        }
    }
})

app.put("/change/password", async (req, res) => {
    let username = req.session.username
    let new_password = req.body.new_password;

    if (!username) res.status(400).json({ message: "please enter a valid username", ok: false });
    if (!new_password) res.status(400).json({ message: "please enter a new password", ok: false });


    with (Basic) {
        try {
            let ret = await changeUsername(username, new_username);
            if (ret) {
                res.status(200).json({ message: "last password changed", ok: true });
            } else {
                res.status(400).json({ message: 'Error changing password', ok: false });
            }
        } catch (e) {
            console.error(e);
            res.status(500).json({ message: 'Error ' + e, ok: false });

        }
    }
})

app.put("/api/v1/fileRename", async (req, res) => {
    let { username, fileId, newFileName } = req.query

    if (!username  || username === undefined || !fileId || Number(fileId) == NaN || !newFileName) res.status(406).json({ message: "you must input the valid data", ok: false });
    if( !(await handle(req, res)) ) {
    try {
        let file = new File(username);

        let f = await file.fileRename(Number(fileId), newFileName);

        if (f) {
            res.status(200).json({ message: "file name was changed", ok: true });
        } else {
            res.status(401).json({ message: "files name was not changed", ok: false });
        }
    } catch (e) {
        res.status(500).json({ message: 'files are not available without a proper username', ok: false });

    }
}
})

app.put("/api/v1/fileDelete", async (req, res) => {
    let { username, fileId } = req.query

    if (!username || !fileId || Number(fileId) == NaN) res.status(406).json({ message: "you must input the valid data", ok: false });
    if( !(await handle(req, res)) ) {
    try {
        let file = new File(username);

        let f = await file.deleteFile(Number(fileId));

        if (f) {
            res.status(200).json({ message: "file name was changed", ok: true });
        } else {
            res.status(401).json({ message: "files name was not changed", ok: false });
        }
    } catch (e) {
        res.status(500).json({ message: 'files are not available without a proper username', ok: false });

    }
}
})

app.put("/api/v1/fileRestore", async (req, res) => {
    let { username, fileId } = req.query

    if (!username || !fileId || Number(fileId) == NaN) res.status(406).json({ message: "you must input the valid data", ok: false });
    if( !(await handle(req, res)) ) {
    try {
        let file = new File(username);

        let f = await file.restoreFile(fileId);

        if (f) {
            res.status(200).json({ message: "file name was restored", ok: true });
        } else {
            res.status(401).json({ message: "files name was not restored", ok: false });
        }
    } catch (e) {
        res.status(500).json({ message: 'files are not available without a proper username', ok: false });

    }
}
})

app.put("/joinRoom/:room", async (req, res) => {
    let username = req.session.username;
    let room = req.params.room;


    let r = await Groups.getRoom(room);
    if (r >= 1) {
        if ((await Groups.join(r, username))) {
            res.status(200).json({ message: "good", ok: true });
        } else {
            res.status(400).json({ message: "bad", ok: false })
        }
    }
})

app.put("/cancelRoom/:room", async (req, res) => {
    let username = req.session.username;
    let room = req.params.room;


    let r = await Groups.getRoom(room);
    if (r >= 1) {
        if ((await Groups.join(r, username, 0))) {
            res.status(200).json({ message: "good", ok: true });
        } else {
            res.status(400).json({ message: "bad", ok: false })
        }
    }
})

app.put("/room/createNew", async (req, res) => {
    let user = req.body.users

    if (!user) res.status(400).json({ message: "invalid list of users", ok: false });
    let c = (await Promise.all(user.map((user) => Basic.isDeleted(user)))).filter(x => !x);
    if (c.length != user.length) res.status(400).json({ message: "one of the given users is invalid", ok: false });

    try {
        let r = await Groups.createRoom(...user);

        if (!r) res.status(404).json({ message: "Room already exists", ok: false });
        else if (r) res.status(200).json({ message: "Room created", ok: true });
    } catch (e) {
        res.status(500).json({ message: "Room creation error", ok: false });
    }
})

app.put("/admin/change/fname/:username", async (req, res) => {
    let username = req.params.username;
    let fname = req.body.fname;

    if (!username) res.status(400).json({ message: "please enter a valid username", ok: false });
    if (!fname) res.status(400).json({ message: "please enter a first name", ok: false });
    if (!req.session.isAdmin) res.status(400).json({ message: "This account is not admin", ok: false });


    with (Basic) {
        try {
            let ret = await changeFirstName(username, fname);
            if (ret) {
                res.status(200).json({ message: "Name changed", ok: true });
            } else {
                res.status(400).json({ message: 'Error changing name', ok: false });
            }
        } catch (e) {
            console.error(e);
            res.status(500).json('basic', { message: 'Error ' + e, ok: false });

        }
    }
})

app.put("/admin/change/lname/:username", async (req, res) => {
    let username = req.params.username;
    let lname = req.body.lname;

    if (!username) res.status(400).json({ message: "please enter a valid username", ok: false });
    if (!lname) res.status(400).json({ message: "please enter a last name", ok: false });
    if (!req.session.isAdmin) res.status(400).json({ message: "This account is not admin", ok: false });


    with (Basic) {
        try {
            let ret = await changeLastName(username, lname);
            if (ret) {
                res.status(200).json({ message: "last name changed", ok: true });
            } else {
                res.status(400).json({ message: 'Error changing name', ok: false });
            }
        } catch (e) {
            console.error(e);
            res.status(500).json('basic', { message: 'Error ' + e, ok: false });

        }
    }
})

app.put("/admin/change/username/:username", async (req, res) => {
    let username = req.params.username;
    let new_username = req.body.new_username;

    if (!username) res.status(400).json({ message: "please enter a valid username", ok: false });
    if (!new_username) res.status(400).json({ message: "please enter a new username", ok: false });
    if (!req.session.isAdmin) res.status(400).json({ message: "This account is not admin", ok: false });


    with (Basic) {
        try {
            let ret = await changeUsername(username, new_username);
            if (ret) {
                res.status(200).json({ message: "last username changed", ok: true });
            } else {
                res.status(400).json({ message: 'Error changing username', ok: false });
            }
        } catch (e) {
            console.error(e);
            res.status(500).json('basic', { message: 'Error ' + e, ok: false });

        }
    }
})

app.put("/admin/change/password/:username", async (req, res) => {
    let username = req.params.username;
    let new_password = req.body.new_password;

    if (!username) res.status(400).json({ message: "please enter a valid username", ok: false });
    if (!new_password) res.status(400).json({ message: "please enter a new password", ok: false });
    if (!req.session.isAdmin) res.status(400).json({ message: "This account is not admin", ok: false });


    with (Basic) {
        try {
            let ret = await changeUsername(username, new_username);
            if (ret) {
                res.status(200).json({ message: "last password changed", ok: true });
            } else {
                res.status(400).json({ message: 'Error changing password', ok: false });
            }
        } catch (e) {
            console.error(e);
            res.status(500).json({ message: 'Error ' + e, ok: false });

        }
    }
})

app.put("/admin/restore/:username", async (req, res) => {
    let username = req.params.username;

    if (!username) res.status(400).json({ message: "please enter a valid username", ok: false });
    if (!req.session.isAdmin) res.status(400).json({ message: "This account is not admin", ok: false });

    with (Admin) {
        try {
            let ret = await restore(username);
            if (ret) {
                res.status(200).json({ message: "Account was restored", ok: true });
            } else {
                res.status(400).json({ message: 'Error restoring this account', ok: false });
            }
        } catch (e) {
            console.error(e);
            res.status(500).json({ message: 'Error ' + e.message, ok: false });

        }
    }
})

app.delete("/deleteAccount", async (req, res) => {
    let username = req.session.username;

    if (!username) req.status(403).json({ message: "user is reqired", ok: false })

    try {
        let del = await Basic.deleteAccount(username);
        if (!del) res.status(403).json({ message: "account was not deleted", ok: false })

        req.session.destroy();
        res.status(200).json({ message: "account was deleted", ok: true });//.render('home', { message:"logged out", ok: true});
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "account was not deleted, Ddue to a server error", ok: false })
    }
})

app.delete("/admin/deleteAccount/:username", async (req, res) => {
    let username = req.params.username;

    if (!username) req.status(403).json({ message: "user is reqired", ok: false })
    if ( !req.session.isAdmin ) res.status(400).json({ message: "This account is not admin", ok: false });
    

    try {
        let del = await Basic.deleteAccount(username);
        if (!del) res.status(403).json({ message: "account was not deleted", ok: false })

        //req.session.destroy();
        res.status(200).json({ message: "account was deleted", ok: true });//.render('home', { message:"logged out", ok: true});
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "account was not deleted, Ddue to a server error", ok: false })
    }
})
app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);