const mongoose =require('mongoose')
const log = require('debug')("development:mongoose")
require("dotenv").config
mongoose.connect(process.env.MONGOURL);

const db = mongoose.connection;

db.on("error",(err)=>{
    log(err)
})

db.on("open",()=>{
    log("Connected to Database successfully")
})

module.exports = db;