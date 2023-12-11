const isEmail =             require("is-email")
const sendRes =             require("../modules/UniversalRes")
const UserRegisterSchema =  require("../shemas/UserRegisterSchema")
const jwt =                 require("jsonwebtoken");
const MongoClient =         require('mongodb').MongoClient;
const client =              new MongoClient('mongodb://10.81.7.29:27017/');
require('dotenv').config()
const config =              process.env;

module.exports  = {
    registerValidation:async (req, res, next) => {
        const users = client.db('ChecklistDB').collection('registeredusers');
        const {email, passwordOne, passwordTwo} = req.body
        const emailExists = await users.findOne({email})
            if(!isEmail(email)) return sendRes(res, true, "bad email", null)
            if(emailExists) return sendRes(res, true, "User With That Email Aleardy Exists", null)
            if(passwordOne !== passwordTwo) return sendRes(res, true, "password should match", null)
            if(passwordOne.length < 5) return sendRes(res, true, 'Password should be at least 5 characters long')
            if(!passwordOne) return sendRes(res, true, "password should be longer than 0", null)
        next()
    },

    secretValidate: async (req, res, next) => {
        const {secret} = req.params
        const userExists = await UserRegisterSchema.findOne({secret})
        if(!userExists) return  sendRes(res, true, "bad user secret", null)
        next()
    },

    passwordChangeValidation: async (req, res, next) => {
        const {passwordOne, passwordTwo} = req.body
        if(passwordOne !== passwordTwo) return sendRes(res, true, "password should match", null)
        if(passwordOne.length < 5) return sendRes(res, true, 'Password should be at least 5 characters long')
        next()
    },

    verifyToken: (req, res, next) => {
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return sendRes(res, true, 'Authorization header not provided')
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            return sendRes(res, true, 'token not provided')
        }
        try {
        const decoded = jwt.decode(token, config.TOKEN_KEY);
        if (decoded.exp < Date.now() / 1000) {
            return sendRes(res, true, 'token has expired')
        }
        req.user = decoded;
        next();
        } catch (err) {
            console.log(err)
            return sendRes(res, true, 'Invalid token')
        }
  },
}
