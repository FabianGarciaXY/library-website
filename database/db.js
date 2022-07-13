const mongoose = require('mongoose');
require('dotenv').config();


// Setting up the database connection
const URI = process.env.MONGODB;
mongoose.connect(URI, {useNewUrlParser: true, useUnifiedTopology: true});

// Getting the connection
const db = moongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));


// Exporting the connection
module.exports = db;