const mongoose = require("mongoose")
const Schema = mongoose.Schema

const AllUsersSchema = new Schema({
        key: {
            type:String,
            required: true
        },
        email: {
            type:String,
            required: true
        },
        secret: {
            type:String,
            required: true
        },
        userRole: {
            type:String,
            required: true
        },
        username: {
            type:String,
            required: true
        },
        dateCreated: {
            type:String,
            required: true
        },
        dateDeleted: {
            type:String,
            required: true
        },
        status: {
            type:String,
            required: true
        },
        _id: {
            type:String,
            required: true
        },
        id: {
            type:String,
            required: true
        },
   
})

const exportUsers = mongoose.model("AllUsers", AllUsersSchema)

module.exports = exportUsers