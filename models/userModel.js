const mongoose = require('mongoose')

const users = mongoose.Schema({
    email:String,
    password:String,
    hisaab:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"user"
        }
    ]
})

module.exports = mongoose.model("user",users)