const mongoose = require("mongoose")
const Schema = mongoose.Schema

const ArchivedUserSchema = new Schema({
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
    defaultTheme: {
        type:Boolean,
        required:true
    },
    dateDeleted: {
        type:String,
    },
    key:{
        type: String
      },
    secret: {
        type:String,
        required: true
    },

})

const exportArchivedUserSchema = mongoose.model("ArchivedUserSchema", ArchivedUserSchema)

module.exports = exportArchivedUserSchema