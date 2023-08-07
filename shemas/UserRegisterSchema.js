const mongoose = require("mongoose")
const Schema = mongoose.Schema

const UserRegisterSchema = new Schema({
    email: {
        type:String,
        required: true
    },
    password: {
        type:String,
        required: true
    },
    repeatPassword: {
        type:String,
        required: true
    },
    username: {
        type:String,
        required: true
    },
    userRole:{
        type:String,
        required: true
    },
    status:{
        type:String,
        required: true
    },
    dateCreated: {
        type:String,
        required: true
    },
    dateDeleted: {
        type:String,
    },
    defaultTheme: {
        type:Boolean,
        required:true
    },
    key:{
        type: String
      },
    secret: {
        type:String,
        // required: true
    },

    token: { 
        type: String 
    },
})

const exportUser = mongoose.model("RegisteredUsers", UserRegisterSchema)

module.exports = exportUser