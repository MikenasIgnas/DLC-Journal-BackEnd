const {uid} =               require("uid");
const bcrypt =              require("bcrypt");
const sendRes =             require("../modules/UniversalRes");
const FilledChecklistData = require("../../shemas/FilledChecklistData");
const jwt =                 require('jsonwebtoken')
const config =              process.env;
const MongoClient =         require('mongodb').MongoClient;
const client =              new MongoClient('mongodb://10.81.7.29:27017/');
const { ObjectId } =        require('mongodb');
require('dotenv').config()

module.exports = {
    createUser: async (req, res) => {
        const users = client.db('ChecklistDB').collection('registeredusers');
        const archivedUsers = client.db('ChecklistDB').collection('archivedusers');
        const userIdCounter = client.db('ChecklistDB').collection('userIdCounter');
        userIdCounter.findOneAndUpdate(
            { id: "userId" },
            { "$inc": { "seq": 1 } },
            { new: true, upsert: true },
            async (err, cd) => {
                let seqId
                  if (!cd || !cd.value.seq) {
                        seqId = 1;
                    }
                    else {
                        seqId = cd.value.seq;
                    }
                try {
                    const { email, passwordOne, passwordTwo, username, userRole, status, dateCreated, defaultTheme } = req.body
                    if (!(email && passwordOne && username, userRole)) {
                        res.status(400).send("All input is required");
                    }
                    const oldUser = await users.findOne({ email });
                    if (oldUser) {
                        return res.status(409).send("User Already Exist. Please Login");
                    }
                    encryptedPassword = await bcrypt.hash(passwordOne, 10);
                    const secret = uid()
                    const user = {
                        email: email.toLowerCase(),
                        password: encryptedPassword,
                        repeatPassword: encryptedPassword,
                        username,
                        userRole,
                        status,
                        dateCreated,
                        dateDeleted: '',
                        defaultTheme,
                        key: seqId,
                        secret: secret
                    };
        
                    await users.insertOne(user);
                    await archivedUsers.insertOne(user);
    
                    res.status(201).json(user);
                } catch (err) {
                    console.log(err);
                }
            }
        );
    },

    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            const collection = client.db('ChecklistDB').collection('registeredusers');
            const user = await collection.findOne({ email });;
            if (!(email && password)) {
              res.status(400).send("All input is required");
            }
            if (user && (await bcrypt.compare(password, user.password)) ) {
              const payload = { email, userId: user._id, userRole: user.userRole, secret: user.secret};
              const options = { expiresIn: '30m', algorithm: 'HS256' };
              const token = jwt.sign(payload, config.TOKEN_KEY, options);
              user.token = token;
              res.status(200).json(user);
            } else {
              res.status(400).send("Invalid Credentials");
            }
          } catch (err) {
            console.log(err);
          }
    },

    getAllUsers: async (req, res) => {
        const collection = client.db('ChecklistDB').collection('registeredusers');
        const allUsers = await collection.find().toArray()
        return sendRes(res, false, "all good", allUsers)
    },

    getArchivedUsers:async (req,res) => {
        const collection = client.db('ChecklistDB').collection('archivedusers');
        const archivedUsers = await collection.find().toArray()
        return sendRes(res, false, "all good",archivedUsers)
    },

    routeData: async (req, res) => {
        const collection = client.db('ChecklistDB').collection('routesTable');
        const routes = await collection.find().sort({id: 1}).toArray()
        return sendRes(res, false, "all routes", routes)
    },

    areasData: async (req, res) => {
        const collection = client.db('ChecklistDB').collection('areasTable');
        const areas = await collection.find().sort({id: 1}).toArray()
        return sendRes(res, false, "all areas", areas)
    },

    todoData: async (req, res) => {
        const collection = client.db('ChecklistDB').collection('todoTable');
        const todo = await collection.find().sort({id: 1}).toArray()
        return sendRes(res, false, "all todo", todo)
    },

    problemsData: async (req, res) => {
        const collection = client.db('ChecklistDB').collection('problemsTable');
        const problems = await collection.find().sort({id: 1}).toArray()
        return sendRes(res, false, "all problems", problems)
    },
    
    postFilledChecklistData:  (req, res) => {
        const checklistHistoryData = client.db('ChecklistDB').collection('checklistHistoryData');
        const historyIdCounter = client.db('ChecklistDB').collection('historyIdCounter');
        historyIdCounter.findOneAndUpdate(
            {id:"historyId"},
            {"$inc": {"seq":1}},
            { new: true, upsert: true },
             async (err, cd) => {
                let seqId
                if (!cd || !cd.value.seq) {
                    seqId = 1;
                }
                else {
                    seqId = cd.value.seq;
                }
                const filledData = {
                    userName:req.body.userName,
                    filledData: req.body.filledData,
                    startDate: req.body.startDate,
                    startTime: req.body.startTime,
                    endDate: req.body.endDate,
                    endTime: req.body.endTime,
                    problemCount: req.body.problemCount,
                    secret: req.body.secret,
                    userRole:req.body.userRole,
                    id: String(seqId)
                }
                 await checklistHistoryData.insertOne(filledData);
            }
        );
        return sendRes(res, false, "all good", null)
    },

    getSingleHistoryELementData: async (req, res) => {
        const {id} = req.params
        const checklistHistoryData = client.db('ChecklistDB').collection('checklistHistoryData');
        const singleHistoryElementData = await checklistHistoryData.findOne({id})
        return sendRes(res, false, "getSingleHistoryELementData", singleHistoryElementData)
    },

    updateFilledChecklistData: async (req, res) => {
        const {pageId, values} = req.body
        await FilledChecklistData.findOneAndUpdate({pageId: String(pageId)}, {$set: {values: values}}, {new : true})
        res.send({success: true})
    },

    totalHistoryEntries: async (req, res) => {
        const checklistHistoryData = client.db('ChecklistDB').collection('checklistHistoryData');
        const totalHistoryData = await checklistHistoryData.countDocuments()
        return sendRes(res, false, "totalHistoryData",totalHistoryData)
    },

    getTotalAreasCount: async (req, res) => {
        const collection = client.db('ChecklistDB').collection('areasTable');
        const totalAreasCount = await collection.countDocuments()
        return sendRes(res, false, "totalAreasCount",totalAreasCount)
    },

    FindUser: async(req, res) => {
        const users = client.db('ChecklistDB').collection('registeredusers');
        const {secret} = req.params
        const user = await users.findOne({secret})
        return sendRes(res, false, 'User', user)
    },

    deleteUser: async (req, res) => {
        const users = client.db('ChecklistDB').collection('registeredusers');
        const {secret} = req.params
        await users.findOneAndDelete({secret})
        res.send({success: true})
    },

    changePassword:async(req, res) => {
        const users = client.db('ChecklistDB').collection('registeredusers');
        const passwordOne = req.body.passwordOne
        const email = req.body.email
        const password = await bcrypt.hash(passwordOne, 10)
        const repeatPassword = password
        const user = await users.findOneAndUpdate(
            {email: email},
            {$set: {password, repeatPassword: repeatPassword}},
        )
        await user.save()
        return sendRes(res, false, 'User', user)
    },

    changeUsersRole:async(req, res) => {
        const users = client.db('ChecklistDB').collection('registeredusers');
        const {secret} = req.params
        const userRole = req.body.userRole
        const newRole = await users.findOneAndUpdate(
            {secret: secret},
            {$set: {userRole:userRole}},
        )
        return sendRes(res, false, 'newRole', newRole)
    },

    editUserProfile:async(req,res)=> {
        const users = client.db('ChecklistDB').collection('registeredusers');
        const archivedUsers = client.db('ChecklistDB').collection('archivedusers');
        const {secret} = req.params
        const username = req.body.username
        const email = req.body.email
        const userRole = req.body.userRole
        const passwordOne = req.body.passwordOne
        if(!passwordOne){
            
            const editedProfileData = await users.findOneAndUpdate(
                {secret: secret},
                {$set: {username, email,userRole}},
            )
             await archivedUsers.findOneAndUpdate(
                {secret: secret},
                {$set: {username, email,userRole}},
            )
            return sendRes(res, false, 'editedProfileData', editedProfileData)   
            }else{
            const password = await bcrypt.hash(passwordOne, 10)
            const repeatPassword = password
            const editedProfileData = await users.findOneAndUpdate(
                {secret: secret},
                {$set: {username, email,userRole, password, repeatPassword}},
            )
            return sendRes(res, false, 'editedProfileData', editedProfileData)
            }    
    },

    changedUsername: async (req,res) => {
        const checklistHistoryData = client.db('ChecklistDB').collection('checklistHistoryData');
        const username = req.body.username
        const {secret} = req.params
        const changeUsernameInHistoryElements = await checklistHistoryData.updateMany(
            {secret: secret},
            {$set: {userName:username}},
        )
        return sendRes(res, false, 'changeUsernameInHistoryElements', changeUsernameInHistoryElements)
    },

    FindSingleUser: async (req, res)=> {
        const users = client.db('ChecklistDB').collection('registeredusers');
        const {secret} = req.params
        const singleUser = await users.findOne({secret: secret})
        return sendRes(res, false, 'User', singleUser)
    },

    updateUsersTheme:async (req, res) => {
        const users = client.db('ChecklistDB').collection('registeredusers');
        const {secret}= req.params
        const defaultTheme = req.body.defaultPageTheme
        const updateTheme = await users.findOneAndUpdate(
            {secret: secret},
            {$set: {defaultTheme}},
        )
        return sendRes(res, false, 'changeUsernameInHistoryElements', updateTheme)
    },

    changeUsersStatus: async (req,res)=> {
        const archivedUsers = client.db('ChecklistDB').collection('archivedusers');
        const {secret}= req.params
        const status = req.body.status
        const updateUsersStatus = await archivedUsers.findOneAndUpdate(
            {secret: secret},
            {$set: {status}},
        )
        return sendRes(res, false, 'updateUsersStatus', updateUsersStatus)
    },

    addDeletionData: async (req, res) => {
        const archivedUsers = client.db('ChecklistDB').collection('archivedusers');
        const {secret}= req.params
        const dateDeleted = req.body.dateDeleted
        const updateUsersStatus = await archivedUsers.findOneAndUpdate(
            {secret: secret},
            {$set: {dateDeleted}},
        )
        return sendRes(res, false, 'updateUsersStatus', updateUsersStatus)
    },

    deleteHistoryItem: async (req, res) => {
        const historyItem = client.db('ChecklistDB').collection('checklistHistoryData');
        const {_id} = req.params
        const result = await historyItem.findOneAndDelete({ _id: ObjectId(_id) });
        if (result.value === null) {
          return res.status(404).json({ error: 'Document not found' });
        }  
        res.send({ success: true });
    },

    latestHistoryItem: async(req,res)=> {
        const historyItem = client.db('ChecklistDB').collection('checklistHistoryData');
        const latestHistoryItem = await historyItem.find().sort({_id:-1}).limit(1).toArray()
        sendRes(res, false, 'latestHistoryItem', latestHistoryItem)
    },

    updateHistoryItem: async (req, res) => {
        const historyItem = client.db('ChecklistDB').collection('checklistHistoryData');
        const {id}= req.params
        const item = await historyItem.findOneAndUpdate(
            {id},
            {$set: {filledData: req.body.updatedArray, problemCount: req.body.problemCount}},
        )
        sendRes(res, false, 'latestHistoryItem', item.value)
    },

    getHistoryData: async (req, res) => {
        const historyItem = client.db('ChecklistDB').collection('checklistHistoryData');
        const items = await historyItem
          .aggregate([
            { $sort: { id: -1 } },
            { $addFields: { numericId: { $toInt: '$id' } } },
            { $sort: { numericId: -1 } },
            { $unset: 'numericId' }
          ])
          .toArray();
        sendRes(res, false, 'historyItems', items);
      },

    postPhotos: async (req, res) => {
        const problemPhotos = client.db('ChecklistDB').collection('problemPhotos');
        const historyIdCounter = client.db('ChecklistDB').collection('historyIdCounter');
        const historyItemId = await historyIdCounter.findOne({id:"historyId"})
        const count = await problemPhotos.countDocuments() 
        if(count === 0){
            await problemPhotos.updateMany(
                    { checklistId:historyItemId.seq - 1 },
                    { $set: { checklistId: Number(historyItemId.seq)} }
             );
                const photosWithChecklistId = req.body.map((item) => ({
                        ...item,
            checklistId: historyItemId.seq
          }));
          for (const item of photosWithChecklistId) {
                await problemPhotos.insertOne(item);
              }
            sendRes(res, false, 'problemPhotos', historyItemId)
        }else{
            await problemPhotos.updateMany(
                { checklistId:historyItemId.seq - 1 },
                { $set: { checklistId: Number(historyItemId.seq)} }
         );
            const photosWithChecklistId = req.body.map((item) => ({
                ...item,
                checklistId: historyItemId.seq 
            }));
            for (const item of photosWithChecklistId) {
                const filter = {
                  checklistId: item.checklistId,
                  photoId: item.photoId
                };
                const update = { $set: { photo: item.photo } };
                const options = { upsert: true };
                await problemPhotos.updateMany(filter, update, options);
              }
            sendRes(res, false, 'postLastestAndCurrentPhotos', photosWithChecklistId)
        }
    },

    postLastestAndCurrentPhotos: async (req, res) => {
        const problemPhotos = client.db('ChecklistDB').collection('problemPhotos');
        const historyIdCounter = client.db('ChecklistDB').collection('historyIdCounter');
        const historyItemId = await historyIdCounter.findOne({id:"historyId"})
        const currentPhotos = req.body.currentPhotos // FROM LOCAL STORAGE
        if(currentPhotos){
            const photosWithChecklistId = currentPhotos.map((item) => ({
                ...item,
                checklistId: historyItemId.seq 
            }));
            for (const item of photosWithChecklistId) {
                await problemPhotos.updateMany(
                  { checklistId: item.checklistId, photo: item.photo, photoId: item.photoId},
                  { $set: { photo: item.photo } },
                  { upsert: true }
                );
              }
            sendRes(res, false, 'postLastestAndCurrentPhotos', photosWithChecklistId)
        }
    },

    postLatestPhotos: async (req, res) => {
        const problemPhotos = client.db('ChecklistDB').collection('problemPhotos');
        const historyIdCounter = client.db('ChecklistDB').collection('historyIdCounter');
        const historyItemId = await historyIdCounter.findOne({id:"historyId"})
        const updateLatest = await problemPhotos.updateMany(
            { checklistId:historyItemId.seq - 1 },
            { $set: { checklistId: Number(historyItemId.seq)} }
          );    
          sendRes(res, false, 'postLatestPhotos', updateLatest)
    },

    getPhotos: async (req, res) => {
        const problemPhotos = client.db('ChecklistDB').collection('problemPhotos');
        const {photoId}= req.params
        const photos = await problemPhotos.find({checklistId: Number(photoId)}).toArray()
        sendRes(res, false, 'getPhotos', photos)
    },

    latestPhotos: async (req,res) => {
        const lastesPhotos = client.db('ChecklistDB').collection('problemPhotos');
        const historyIdCounter = client.db('ChecklistDB').collection('historyIdCounter');
        const historyItemId = await historyIdCounter.findOne({id:"historyId"})
        const latestHistoryItemPhotos = await lastesPhotos.find({checklistId: historyItemId.seq - 1}).toArray()
        sendRes(res, false, 'lastestPhotos', latestHistoryItemPhotos)
    },

    deletePhoto: async (req, res) => {
        const photos = client.db('ChecklistDB').collection('problemPhotos');
        const {photoId} = req.params
        await photos.findOneAndDelete({photoId})
        res.send({success: true})
    },

    uploadPhoto: async (req, res) => {
        const photos = client.db('ChecklistDB').collection('problemPhotos');
        const uploadedPhoto = await photos.findOneAndUpdate(
            { checklistId: req.body.checklistId, photoId: req.body.photoId},
            { $set: { photo: req.body.photo } },
            { upsert: true }
          );
        sendRes(res, false, 'uploadPhoto', uploadedPhoto)
    },

    getCompanies: async (req, res) => {
        const companiesCollection = client.db('ChecklistDB').collection('companiesTable');
        const companies = await companiesCollection.find().toArray()
        sendRes(res, false, 'Companies', companies)
    },
    getCompaniesSites: async (req, res) => {
        const CompanySitesTableCollection = client.db('ChecklistDB').collection('CompanySitesTable');
        const companiesSites = await CompanySitesTableCollection.find().toArray()
        sendRes(res, false, 'CompanySitesTable', companiesSites)
    },
    getCompaniesPremises: async (req, res) => {
        const companyPremisesCollection = client.db('ChecklistDB').collection('CompanyPremisesTable');
        const companiesPremises = await companyPremisesCollection.find().toArray()
        sendRes(res, false, 'CompaniesPremisesTable', companiesPremises)
    },
    getCompaniesColocation: async (req, res) => {
        const companyColocationCollection = client.db('ChecklistDB').collection('ColocationTable');
        const companiesCollocation = await companyColocationCollection.find().toArray()
        sendRes(res, false, 'coclocation', companiesCollocation)
    },
    getCompaniesEmployees: async (req, res) => {
        const companyEmployeesCollection = client.db('ChecklistDB').collection('EmployeesTable');
        const companiesEmployees = await companyEmployeesCollection.find().toArray()
        sendRes(res, false, 'CompaniesEmployees', companiesEmployees)
    },
    singleCompanyPage: async (req, res) => {
        const {id}= req.params
        const companiesCollection = client.db('ChecklistDB').collection('companiesTable');
        const singleCompany = await companiesCollection.findOne({id})
        sendRes(res, false, 'singleCompany', singleCompany)
    },
    getSingleCompaniesEmployees: async (req, res) => {
        const {id} = req.params
        const companyEmployeesCollection = client.db('ChecklistDB').collection('EmployeesTable');
        const companiesEmployees = await companyEmployeesCollection.find({CompanyId: id}).toArray()
        sendRes(res, false, 'companiesEmployees', companiesEmployees)
    },
    getSingleCompaniesSites: async (req, res) => {
        const {id} = req.params
        const companySitesCollection = client.db('ChecklistDB').collection('CompanySitesTable');
        const companiesSites = await companySitesCollection.find({CompanyId: id}).toArray()
        sendRes(res, false, 'companiesSites', companiesSites)
    },
    postVisitDetails: async (req, res) => {
        const visistsCollection = client.db('ChecklistDB').collection('Visits');
        const visitsIdCounter = client.db('ChecklistDB').collection('VisitsIdCounter')

        visitsIdCounter.findOneAndUpdate(
            {id:"visitId"},
            {"$inc": {"seq":1}},
            { new: true, upsert: true },
             async (err, cd) => {
                let seqId
                if (!cd || !cd.value.seq) {
                    seqId = 1;
                }
                else {
                    seqId = cd.value.seq;
                }
                const visitRegistrationData = {
                    visitInfo:  req.body.visitInfo,
                    visitGoal:  req.body.visitGoal,
                    visitorsId: req.body.visitorsId,
                    id: String(seqId)
                }
                 await visistsCollection.insertOne(visitRegistrationData);
            }
        );
        return sendRes(res, false, "all good", null)
    },
    getVisits: async (req, res) => {
        const visistsCollection = client.db('ChecklistDB').collection('Visits');
        const visits = await visistsCollection.find().toArray()
        sendRes(res, false, 'visits', visits)
    },
    getSingleVisit: async (req, res) => {
        const visistsCollection = client.db('ChecklistDB').collection('Visits');
        const {id} = req.params
        const visits = await visistsCollection.find({id}).toArray()
        sendRes(res, false, 'visits', visits)
    }
}