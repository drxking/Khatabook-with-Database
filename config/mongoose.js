const mongoose =require('mongoose')
const log = require('debug')("development:mongoose")
mongoose.connect("mongodb://127.0.0.1:27017/khatabook");

const db = mongoose.connection;

db.on("error",(err)=>{
    log(err)
})

db.on("open",()=>{
    log("Connected to Database successfully")
})

module.exports = db;