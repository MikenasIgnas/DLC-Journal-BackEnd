const {uid} =               require("uid");
const bcrypt =              require("bcrypt");
const sendRes =             require("../modules/UniversalRes");
const FilledChecklistData = require("../../shemas/FilledChecklistData");
const jwt =                 require('jsonwebtoken')
const config =              process.env;
const MongoClient =         require('mongodb').MongoClient;
const client =              new MongoClient('mongodb://10.81.7.29:27017/');
const { ObjectId } =        require('mongodb');
const path =                require('path'); // Import the 'path' module
const fs =                  require('fs');
const multer = require('multer')
// const upload = multer({ dest: 'C:/Users/ignas/OneDrive/Desktop/DLC-Checklist-main/DLC-Checklist-BackEnd/uploads' })
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

        const storage = multer.diskStorage({
            destination: function (req, file, cb) {
              cb(null, ('C:/Users/ignas/OneDrive/Desktop/DLC-Checklist-main/DLC-Checklist-BackEnd/uploads') )
            },
            filename: function (req, file, cb) {
              cb(null, `asdasdasd.jpeg`)
            }
          })
  
      const upload = multer({ storage:storage }).single('file')

      upload(req,res,function(err) {
          if(err) {
              return handleError(err, res);
          }
          res.json({"status":"completed"});
      })
    },
    uploadCompanysPhoto: async (req, res) => {
        const companyIdCounter = client.db('ChecklistDB').collection('companiesIdCounter');
        const companiesCollection =  client.db('ChecklistDB').collection('companies');
        const companyId = await companyIdCounter.findOne({id:"companyId"})
        const companyName = req.query.companyName.replace(/\s+/g, '');  
        const filePath = 'C:/Users/ignas/OneDrive/Desktop/DLC-Checklist-main/DLC-Checklist-FrontEnd/public/CompanyLogos'
        const fileName =  `${companyName}Logo${companyId.seq -1}.jpeg`
        const storage = multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, (filePath) )
            },
            filename: function (req, file, cb) {
                cb(null, fileName)
            }
        })
        const upload = multer({ storage:storage }).single('file')
        
        await companiesCollection.findOneAndUpdate({id: String(companyId.seq - 1)}, { $set: {
            'companyInfo.companyPhoto': `${fileName}` // New photo URL or filename
          }} )
      upload(req,res,function(err) {
          if(err) {
              return handleError(err, res);
          }
          res.json({"status":"completed"});
      })
    },
    getCompanies: async (req, res) => {
        const companiesCollection = client.db('ChecklistDB').collection('companies');
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
    singleCompanyPage: async (req, res) => {
        const {id}= req.params
        const companiesCollection = client.db('ChecklistDB').collection('companies');
        const singleCompany = await companiesCollection.findOne({id})
        sendRes(res, false, 'singleCompany', singleCompany)
    },
    getSingleCompaniesEmployees: async (req, res) => {
        const {id} = req.params
        const companyEmployeesCollection = client.db('ChecklistDB').collection('companyEmployees');
        const companiesEmployees = await companyEmployeesCollection.find({companyId: id}).toArray()
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
    },
    getCollocations: async (req, res) => {
        const collocationsCollection = client.db('ChecklistDB').collection('Collocations');
        const collocations = await collocationsCollection.find().toArray()
        sendRes(res, false, 'collocations', collocations)
    },
    addCompany: async (req, res) => {
        const companies = client.db('ChecklistDB').collection('companies');
        const companiesIdCounter = client.db('ChecklistDB').collection('companiesIdCounter')
        companiesIdCounter.findOneAndUpdate(
            {id:"companyId"},
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
                const companyData = {
                    companyInfo: req.body,
                    id: String(seqId)
                }
                 await companies.insertOne(companyData);
            }
        );
        return sendRes(res, false, "all good", null)
    },
    addEmployee: async (req, res) => {
        const companyEmployees = client.db('ChecklistDB').collection('companyEmployees');
        const employeeIdCounter = client.db('ChecklistDB').collection('employeeIdCounter')
        employeeIdCounter.findOneAndUpdate(
            {id:"employeeId"},
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
                req.body.employeeId = String(seqId)
                 await companyEmployees.insertOne( req.body);
            }
        );
        return sendRes(res, false, "all good", null)
    },
    getClientsEmployees: async (req, res) => {
        const companyEmployees = client.db('ChecklistDB').collection('companyEmployees');
        const companyId = req.query.companyId
        const employeeId = req.query.employeeId
        const employee = await companyEmployees.findOne({companyId: String(companyId), employeeId: String(employeeId)})
        return sendRes(res, false, "all good", employee)
    },
    getClientsEmployeesCompanyName: async (req, res) => {
        const companies = client.db('ChecklistDB').collection('companies');
        const {id} = req.params
        const companyName = await companies.findOne({id})
        return sendRes(res, false, "all good", companyName.companyInfo.companyName)
    },
    deleteCompany: async (req, res) => {
        const company = client.db('ChecklistDB').collection('companies');
        const companyEmployees = client.db('ChecklistDB').collection('companyEmployees');
        const companiesIdCounter = client.db('ChecklistDB').collection('companiesIdCounter')
        const companiesEmployeesIdCounter = client.db('ChecklistDB').collection('employeeIdCounter')
        const {id} = req.params
        const companyData = await company.findOne({id})
        const clientsEmployees = await companyEmployees.find().toArray()
        const companyName = companyData.companyInfo.companyName.replace(/\s+/g, '');  
        await company.findOneAndDelete({id})
        const deletedEmployees = await companyEmployees.deleteMany({companyId: id})
        const numDocumentsDeleted = deletedEmployees.deletedCount;
        const companyLogofilePath = `C:/Users/ignas/OneDrive/Desktop/DLC-Checklist-main/DLC-Checklist-FrontEnd/public/CompanyLogos/${companyName}Logo${id}.jpeg`

        fs.unlink(companyLogofilePath, (err) => {
            if (err) {
                console.error('Error deleting file:', err);
            } 
        });

        for(let i = 1; i<= numDocumentsDeleted; i++){
            for(let i = clientsEmployees[0].employeeId; i <= clientsEmployees[clientsEmployees.length - 1].employeeId; i++ ){
                const companyEmployeePhotoFilePath = `C:/Users/ignas/OneDrive/Desktop/DLC-Checklist-main/DLC-Checklist-FrontEnd/public/ClientsEmployeesPhotos/${companyName}companyId${id}employeeId${i}.jpeg`
                fs.unlink(companyEmployeePhotoFilePath, (err) => {
                    if (err) {
                        console.error('Error deleting file:', err);
                    } 
                });
            }
            }
        companiesIdCounter.findOneAndUpdate(
            { id: "companyId" },
            { $inc: { seq: -1 } },
            { new: true, upsert: true },
            async (err, cd) => {
              let seqId;
              if (!cd || !cd.value.seq) {
                seqId = 1;
              } else {
                seqId = cd.value.seq;
              }
            }
          );
          companiesEmployeesIdCounter.findOneAndUpdate(
            { id: "employeeId" },
            { $inc: { seq: -numDocumentsDeleted } }, 
            { new: true, upsert: true },
            async (err, cd) => {
              let seqId;
              if (!cd || !cd.value.seq) {
                seqId = 1;
              } else {
                seqId = cd.value.seq;
              }
            }
          );
        res.send({success: true})
    },
    uploadCliesntEmployeesPhoto: async (req, res) => {
        const employeeIdCounter = client.db('ChecklistDB').collection('employeeIdCounter');
        const clientsEmployeesCollection = client.db('ChecklistDB').collection('companyEmployees');
        const companyName = req.query.companyName.replace(/\s+/g, '');  
        const companyId = req.query.companyId
        const employeeId = req.query.employeeId
        const fileName =  `${companyName}companyId${companyId}employeeId${employeeId}.jpeg`
        const storage = multer.diskStorage({
            destination: function (req, file, cb) {
              cb(null, (`C:/Users/ignas/OneDrive/Desktop/DLC-Checklist-main/DLC-Checklist-FrontEnd/public/ClientsEmployeesPhotos`) )
            },
            filename: function (req, file, cb) {
                cb(null, fileName)
            }
        })
      const upload = multer({ storage:storage }).single('file')
      await clientsEmployeesCollection.findOneAndUpdate({employeeId: String(employeeId)}, { $set: {
        employeePhoto: `${fileName}` 
      }})
      
      upload(req,res,function(err) {
        if(err) {
            return handleError(err, res);
        }
        res.json({"status":"completed"});
        })
    },
    deleteClientsEmployee: async (req, res) => {
        const clientsEmployees = client.db('ChecklistDB').collection('companyEmployees');
        const employeesIdCounter = client.db('ChecklistDB').collection('employeeIdCounter');
        const companyId = req.query.companyId
        const employeeId = req.query.employeeId
        const companyName = req.query.companyName
        await clientsEmployees.findOneAndDelete({companyId, employeeId})
        const filePath = `C:/Users/ignas/OneDrive/Desktop/DLC-Checklist-main/DLC-Checklist-FrontEnd/public/ClientsEmployeesPhotos/${companyName}companyId${companyId}employeeId${employeeId}.jpeg`
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error('Error deleting file:', err);
            } 
        });
        employeesIdCounter.findOneAndUpdate(
            { id: "employeeId" },
            { $inc: { seq: -1 } },
            { new: true, upsert: true },
            async (err, cd) => {
              let seqId;
              if (!cd || !cd.value.seq) {
                seqId = 1;
              } else {
                seqId = cd.value.seq;
              }
            }
          );
        res.send({success: true})
    },
    updateClientsEmployee: async (req, res) => {
        const clientsEmployees = client.db('ChecklistDB').collection('companyEmployees');
        await clientsEmployees.findOneAndUpdate({companyId: req.body.companyId, employeeId: req.body.employeeId}, { $set: req.body})
        return sendRes(res, false, "all good", null)
    },
    updateCompaniesData: async (req, res) => {
        const companiesCollenction = client.db('ChecklistDB').collection('companies');
        await companiesCollenction.findOneAndUpdate({id:req.query.companyId},  { $set: {
            'companyInfo.J13': req.body.J13, 
            'companyInfo.T72': req.body.T72, 
            'companyInfo.companyName': req.body.companyName, 
        }}) 
        return sendRes(res, false, "all good", null)
    },

    deleteCompaniesSubClient: async (req, res) => {
        const companiesIdCounter = client.db('ChecklistDB').collection('companiesIdCounter')
        const companiesCollenction = client.db('ChecklistDB').collection('companies');
        await companiesCollenction.findOneAndDelete({id: req.query.subClientId, parentCompanyId: req.query.parentCompanyId})
        companiesIdCounter.findOneAndUpdate(
            { id: "companyId" },
            { $inc: { seq: -1 } },
            { new: true, upsert: true },
            async (err, cd) => {
              let seqId;
              if (!cd || !cd.value.seq) {
                seqId = 1;
              } else {
                seqId = cd.value.seq;
              }
            }
          );
        return sendRes(res, false, "all good", null)
    },

    addSubClient: async (req, res) => {
        const companies = client.db('ChecklistDB').collection('companies');
        const companiesIdCounter = client.db('ChecklistDB').collection('companiesIdCounter')
        companiesIdCounter.findOneAndUpdate(
            {id:"companyId"},
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
                const companyData = {
                    parentCompanyId: req.query.parentCompanyId,
                    companyInfo: req.body,
                    id: String(seqId)
                }
                 await companies.insertOne(companyData);
            }
        );
        return sendRes(res, false, "all good", null)
    },
    getSubClients: async (req, res) => {
        const companies = client.db('ChecklistDB').collection('companies');
        const parentCompanyId = req.query.parentCompanyId
        const subClient = await companies.find({parentCompanyId: parentCompanyId}).toArray()
        return sendRes(res, false, "all good", subClient)
    },
    getSingleSubClient: async (req, res) => {
        const companies = client.db('ChecklistDB').collection('companies');
        const parentCompanyId = req.query.parentCompanyId
        const subClientId = req.query.subClientId
        const subClient = await companies.findOne({parentCompanyId: parentCompanyId, id: subClientId})
        return sendRes(res, false, "all good", subClient)
    },
    addSubClientsEmployee: async (req, res) => {
        const companyEmployees = client.db('ChecklistDB').collection('companyEmployees');
        const employeeIdCounter = client.db('ChecklistDB').collection('employeeIdCounter')
        employeeIdCounter.findOneAndUpdate(
            {id:"employeeId"},
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
                req.body.employeeId = String(seqId)
                req.body.subClientId = req.query.subClientId
                 await companyEmployees.insertOne( req.body);
            }
        );
        return sendRes(res, false, "all good", null)
    },
    getSubClientsEmployees: async (req, res) => {
        const companyEmployees = client.db('ChecklistDB').collection('companyEmployees');
        const subClientEmployees = await companyEmployees.find({subClientId: req.query.subClientId }).toArray()
        return sendRes(res, false, "all good", subClientEmployees)
    },
    deleteSubClientsEmployee: async (req, res) => {
        const subClientsEMployees = client.db('ChecklistDB').collection('companyEmployees');
        const employeesIdCounter = client.db('ChecklistDB').collection('employeeIdCounter');
        const companyId = req.query.companyId
        const employeeId = req.query.employeeId
        await subClientsEMployees.findOneAndDelete({companyId, employeeId})
        employeesIdCounter.findOneAndUpdate(
            { id: "employeeId" },
            { $inc: { seq: -1 } },
            { new: true, upsert: true },
            async (err, cd) => {
                let seqId;
                if (!cd || !cd.value.seq) {
                    seqId = 1;
                } else {
                    seqId = cd.value.seq;
                }
            }
            );
            res.send({success: true})
        },
        getAllMainCompanies: async (req, res) => {
            const companiesCollection = client.db('ChecklistDB').collection('companies');
            const companies = await companiesCollection.find().toArray()
            const companyId = req.query.companyId
            const mainCompanies = companies.filter(item => !item.parentCompanyId).filter((el) => el.id !== companyId);
            return sendRes(res, false, "all good", mainCompanies)
        },
        addMainCompanyAsSubClient: async (req, res) => {
            const companiesCollection = client.db('ChecklistDB').collection('companies');
            await companiesCollection.findOneAndUpdate({id: req.query.companyId}, {$set: {parentCompanyId: req.query.parentCompanyId, wasMainClient: true}})
            return sendRes(res, false, "all good", null)
        },
        changeSubClientToMainClient: async (req, res) => {
            const companiesCollection = client.db('ChecklistDB').collection('companies');
            await companiesCollection.findOneAndUpdate(
                { id: req.query.companyId },
                { $unset: { parentCompanyId: 1 }, $set: { wasMainClient: false } }
                );
            return sendRes(res, false, "all good", null)
        },
        getAllHistoryData: async (req, res) => {
            return sendRes(res, false, "totalHistoryData",totalHistoryData) 
        },
        generateMonthlyPDFReport: async (req, res) => {

            const today = new Date()
            const year = today.getFullYear()
            const month = today.getMonth() + 1 // Month is 0-based, so add 1
            const day = today.getDate()
    
            const currentDate = `${year}/${month}/${day}`
            let newYear = year
            let newMonth = month - 1
            if (newMonth < 1) {
              newMonth = 12
              newYear--
            }
    
            const dateInOneMoth = `${newYear}/${newMonth}/${day}`

            const checklistHistoryData = client.db('ChecklistDB').collection('checklistHistoryData');
            const allHistoryData = await checklistHistoryData.find().toArray()
              const startDateRangeStart = new Date(dateInOneMoth)
              const startDateRangeEnd = new Date(currentDate)
              const filteredData2 = allHistoryData?.filter(user => {
                const userStartDate = new Date(user.endDate)
                return userStartDate >= startDateRangeStart && userStartDate <= startDateRangeEnd
            })
            const filteredData = filteredData2?.map(user => ({
                  ...user,
                filledData: user?.filledData?.filter(page => {
                  const values = Object?.values(page?.values)
                  return values?.some(pageValues =>
                    Object?.values(pageValues)?.some(value =>
                      typeof value === 'object' ? Object?.values(value)?.some(innerValue => innerValue === true) : value === true
                    ))
                }),
            }))
            return sendRes(res, false, "totalHistoryData",filteredData) 
        },
        getAllClientsEmployees: async (req, res) => {
            const companies = client.db('ChecklistDB').collection('companyEmployees');
            const companyId = req.query.companyId
            const employees = await companies.find({companyId: companyId}).toArray()
            return sendRes(res, false, "all good", employees)
        }
    }
    
