require('dotenv').config();


const salt = process.env.SALT;


if (!salt) {
    console.error("Error: PORT, HOST, or SALT environment variables are missing.");
    process.exit(1);
}