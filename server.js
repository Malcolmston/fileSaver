require('dotenv').config() // adds the ability to create environment variables

const express = require('express');
const multer = require('multer');
const { sessionMiddleware } = require('./router.js')
const { Basic, Admin, File } = require('./userManegement.js');


const app = express();
const upload = multer();


const { PORT, HOST } = process.env;


app.use(express.json({ limit: '1gb' })) // for parsing application/json
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

app.get("/api/v1/myFiles", async (req, res) => {
    let { username, json } = req.query
    if (!username) return;

    const file = (new File(username));

    json = (json ? true : false)

    try {

        let files = JSON.stringify((await file.getAllFiles(username)))

        if (json) {
            res.json({ files })
        } else {
            res.render("./basic_tabs/fileHandle", {username, files })
        }

    } catch (e) {
        console.error(e)
        res.status(500).json({ message: "the given username is not valid", ok: false })
    }
})



app.post("/login", async (req, res) => {
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

        res.render('basic', { username, message: "" });
    } else {
        res.render('home', { message: "sign up failed" });
    }
});

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

app.post('api/v1/fileupload', upload.single("file"), async (req, res) => {
    let { username} = req.body
    let file = req.file;

    if (!username) {
        res.status(403).json({ message: "you must log in inorder to user this feture", ok: false });
    }

    if( !file ){
        res.status(400).json({ message: "you must submit a file", ok: false });
    }


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
            res.status(402).render('basic', { username, message: `Error uploading a file` });
        } else {
            res.status(200).redirect('/login');
        }

        
    } catch (e) {
        console.error(e);
        res.status(500).render('basic', { username, message: 'Error uploading file.' });
    }

});

app.put("/change/fname", async (req, res) => {
    let username = req.session.username
    let fname = req.body.fname;

    if(!username) res.status(400).json({ message: "please enter a valid username", ok: false });
    if(!fname) res.status(400).json({ message: "please enter a first name", ok: false });


    with(Basic){
        try{
            let ret = await changeFirstName(username, fname);
            if( ret){
                res.status(200).json({ message: "Name changed", ok: true});
            } else {
                res.status(400).json( { message: 'Error changing name', ok: false });
            }
        } catch(e){
            console.error( e );
            res.status(500).json('basic', { message: 'Error '+e, ok: false });

        }
    }
})


app.put("/change/lname", async (req, res) => {
    let username = req.session.username
    let lname = req.body.lname;

    if(!username) res.status(400).json({ message: "please enter a valid username", ok: false });
    if(!lname) res.status(400).json({ message: "please enter a last name", ok: false });


    with(Basic){
        try{
            let ret = await changeLastName(username, lname);
            if( ret){
                res.status(200).json({ message: "last name changed", ok: true});
            } else {
                res.status(400).json( { message: 'Error changing name', ok: false });
            }
        } catch(e){
            console.error( e );
            res.status(500).json('basic', { message: 'Error '+e, ok: false });

        }
    }
})

app.put("/change/username", async (req, res) => {
    let username = req.session.username
    let new_username = req.body.new_username;

    if(!username) res.status(400).json({ message: "please enter a valid username", ok: false });
    if(!new_username) res.status(400).json({ message: "please enter a new username", ok: false });


    with(Basic){
        try{
            let ret = await changeUsername(username, new_username);
            if( ret){
                res.status(200).json({ message: "last username changed", ok: true});
            } else {
                res.status(400).json( { message: 'Error changing username', ok: false });
            }
        } catch(e){
            console.error( e );
            res.status(500).json('basic', { message: 'Error '+e, ok: false });

        }
    }
})

app.put("/change/password", async (req, res) => {
    let username = req.session.username
    let new_password = req.body.new_password;

    if(!username) res.status(400).json({ message: "please enter a valid username", ok: false });
    if(!new_password) res.status(400).json({ message: "please enter a new password", ok: false });


    with(Basic){
        try{
            let ret = await changeUsername(username, new_username);
            if( ret){
                res.status(200).json({ message: "last password changed", ok: true});
            } else {
                res.status(400).json( { message: 'Error changing password', ok: false });
            }
        } catch(e){
            console.error( e );
            res.status(500).json( { message: 'Error '+e, ok: false });

        }
    }
})

app.put("/api/v1/fileRename", async (req, res) => {
    let { username, fileId, newFileName } = req.query

    if(!username || !fileId || Number(fileId) == NaN || !newFileName) res.status(406).json({message:"you must input the valid data", ok: false});
    try {
        let file = new File(username);
        
        let f = await file.fileRename(Number(fileId), newFileName);

        if( f ){
            res.status(200).json({message: "file name was changed", ok: true});
        } else {
            res.status(401).json({message:"files name was not changed", ok: false});
        }
    } catch (e) {
        res.status(500).json( { message: 'files are not available without a proper username', ok: false });

    }
})

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);