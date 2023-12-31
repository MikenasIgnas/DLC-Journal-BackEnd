const {uid} =                               require("uid");
const bcrypt =                              require("bcrypt");
const sendRes =                             require("../modules/UniversalRes");
const FilledChecklistData =                 require("../shemas/FilledChecklistData");
const jwt =                                 require('jsonwebtoken')
const config =                              process.env;
const MongoClient =                         require('mongodb').MongoClient;
const client =                              new MongoClient(process.env.MONGO_PATH);
const fs =                                  require('fs');
const multer =                              require('multer');
const { getCurrentDate, getCurrentTime } =  require("../helpers");
const nodemailer =                          require("nodemailer");
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
                        id: seqId,
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
              const payload = { email, userId: user._id, userRole: user.userRole, secret: user.secret, id: user.id};
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
                    id: seqId
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

    checklistHistoryCount: async (req, res) => {
        const checklistHistoryData = client.db('ChecklistDB').collection('checklistHistoryData');
        const totalHistoryData = await checklistHistoryData.countDocuments()
        return sendRes(res, false, "totalHistoryData",totalHistoryData)
    },
    visitsCount: async (req, res) => {
        const visits = client.db('ChecklistDB').collection('visits');
        const visitsCount = await visits.countDocuments()
        return sendRes(res, false, "totalHistoryData",visitsCount)
    },
    totalVisitsEntries: async (req, res) => {
        const visitsData = client.db('ChecklistDB').collection('visits');
        const visitsCount = await visitsData.countDocuments()
        return sendRes(res, false, "visitsCount",visitsCount)
    },
    getTotalAreasCount: async (req, res) => {
        const collection = client.db('ChecklistDB').collection('areasTable');
        const totalAreasCount = await collection.countDocuments()
        return sendRes(res, false, "totalAreasCount",totalAreasCount)
    },
    deleteVisit: async (req, res) => {
        const visits = client.db('ChecklistDB').collection('visits');
        const {id} = req.params
        await visits.findOneAndDelete({id: Number(id)})
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
        const {id} = req.params
        const userRole = req.body.userRole
        const newRole = await users.findOneAndUpdate(
            {id: Number(id)},
            {$set: {userRole:userRole}},
        )
        return sendRes(res, false, 'newRole', newRole)
    },

    editUserProfile:async(req,res)=> {
        const users = client.db('ChecklistDB').collection('registeredusers');
        const archivedUsers = client.db('ChecklistDB').collection('archivedusers');
        const {id} = req.params
        const username = req.body.username
        const email = req.body.email
        const userRole = req.body.userRole
        const passwordOne = req.body.passwordOne
        if(!passwordOne){
            const editedProfileData = await users.findOneAndUpdate(
                {id: Number(id)},
                {$set: {username, email,userRole}},
            )
             await archivedUsers.findOneAndUpdate(
                {id: Number(id)},
                {$set: {username, email,userRole}},
            )
            return sendRes(res, false, 'editedProfileData', editedProfileData)   
            }else{
            const password = await bcrypt.hash(passwordOne, 10)
            const repeatPassword = password
            const editedProfileData = await users.findOneAndUpdate(
                {id: Number(id)},
                {$set: {username, email,userRole, password, repeatPassword}},
            )
            return sendRes(res, false, 'editedProfileData', editedProfileData)
            }    
    },

    changedUsername: async (req,res) => {
        const checklistHistoryData = client.db('ChecklistDB').collection('checklistHistoryData');
        const username = req.body.employee
        const {id} = req.params
        const changeUsernameInHistoryElements = await checklistHistoryData.updateMany(
            {id: Number(id)},
            {$set: {userName:username}},
        )
        return sendRes(res, false, 'changeUsernameInHistoryElements', changeUsernameInHistoryElements)
    },
    updateUsersTheme:async (req, res) => {
        const users = client.db('ChecklistDB').collection('registeredusers');
        const {id}= req.params
        const defaultTheme = req.body.defaultPageTheme
        const updateTheme = await users.findOneAndUpdate(
            {id: Number(id)},
            {$set: {defaultTheme}},
        )
        return sendRes(res, false, 'changeUsernameInHistoryElements', updateTheme)
    },
    addDeletionData: async (req, res) => {
        const archivedUsers = client.db('ChecklistDB').collection('archivedusers');
        const {id}= req.params
        const dateDeleted = req.body.dateDeleted
        const updateUsersStatus = await archivedUsers.findOneAndUpdate(
            {id: Number(id)},
            {$set: {dateDeleted}},
        )
        return sendRes(res, false, 'updateUsersStatus', updateUsersStatus)
    },

    deleteHistoryItem: async (req, res) => {
        const historyItem = client.db('ChecklistDB').collection('checklistHistoryData');
        const {id} = req.params
        const result = await historyItem.findOneAndDelete({ id: Number(id) });
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
            { $sort: { id: 1 } },
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
              cb(null, ('C:/Users/Public/Desktop/DLC-Checklist-main/DLC-Checklist-BackEnd/uploads') )
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
        const filePath = 'C:/Users/Public/Desktop/DLC JOURNAL/DLC-Checklist-FrontEnd/public/CompanyLogos'
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
        
        await companiesCollection.findOneAndUpdate({id: companyId.seq - 1}, { $set: {
            'companyInfo.companyPhoto': `${fileName}`}} )

            
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

    getSingleCompany: async (req, res) => {
        const companyId = req.query.companyId
        const companiesCollection = client.db('ChecklistDB').collection('companies');
        const singleCompany = await companiesCollection.findOne({id: Number(companyId)})
        sendRes(res, false, 'singleCompany', singleCompany)
    },
    getSingleCompaniesEmployees: async (req, res) => {
        const companyId = req.query.companyId
        const companyEmployeesCollection = client.db('ChecklistDB').collection('companyEmployees');
        const companiesEmployees = await companyEmployeesCollection.find({companyId: Number(companyId)}).toArray()
        sendRes(res, false, 'companiesEmployees', companiesEmployees)
    },
    postVisitDetails: async (req, res) => {
        const visistsCollection = client.db('ChecklistDB').collection('visits');
        const visitsIdCounter = client.db('ChecklistDB').collection('visitsIdCounter')
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
                    visitStatus:        req.body.visitStatus,
                    visitingClient:     req.body.visitingClient,
                    visitors:           req.body.visitors,
                    visitAddress:       req.body.visitAddress,
                    dlcEmployees:       req.body.dlcEmployees,
                    visitPurpose:       req.body.visitPurpose,
                    visitorsIdType:     req.body.visitorsIdType,
                    visitCollocation:   req.body.visitCollocation,
                    signature:          req.body.signature,
                    creationDate:       req.body.creationDate,
                    creationTime:       req.body.creationTime,
                    clientsGuests:      req.body.clientsGuests,
                    carPlates:          req.body.carPlates,
                    scheduledVisitTime: req.body.scheduledVisitTimes,
                    companyId:          req.body.companyId,
                    id:                 seqId,
                }
                    await visistsCollection.insertOne(visitRegistrationData);
                    return sendRes(res, false, "all good", visitRegistrationData.id)
                }
                );
        if(req.body.visitAddress === 'T72'){
            const visitors = req.body.visitors.map((el) => `${el.selectedVisitor.name} ${el.selectedVisitor.lastName}`) 
            const imagePath = 'src/Images/signatureLogo.png'

            const sendEmail = () => {
                return new Promise((resolve, reject) => {
                  const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                      user: 'mikenasignas@gmail.com',
                      pass: 'czwj jdyw xdyn qphs'
                    }
                  });
              
                  const mail_configs = {
                    from: 'mikenasignas@gmail.com',
                    to: 'ignas.mikenas@datalogistics.lt',
                    subject: `${req.body.visitingClient}  ${req.body.creationDate} ${req.body.creationTime}`,
                    attachments: [{
                        filename: 'signatureLogo.png',
                        path: imagePath,
                        cid: 'unique@nodemailer.com',
                    }],
                    html: `<!DOCTYPE html>
                          <html lang="en" >
                              <head>
                                  <meta charset="UTF-8">
                              </head>
                              <body>
                                  <div style="font-family: Helvetica,Arial,sans-serif;overflow:auto;line-height:2">
                                      <div style="margin:50px auto;width:70%;padding:20px 0">
                                          <p style="font-size:1.1em">Sveiki, </p>
                                          <span>Vizitas į DATAINN</span>
                                          <p>Klientas: ${req.body.visitingClient}</p>
                                          <p>Data/Laikas: ${req.body.scheduledVisitTime}</p>
                                          <p>Įmonės atstovai: ${req.body.visitors.map((el) => `${el.selectedVisitor.name} ${el.selectedVisitor.lastName}<br>`).join('')}</p>
                                          ${req.body.clientsGuests.length > 0 ? `<p>Palyda: ${req.body.clientsGuests.map((el) =>`${el}<br>`).join('')}</p>` : ''}
                                          ${req.body.carPlates.length > 0 ? `<p>Automobilių Nr.: ${req.body.carPlates.map((el) =>`${el}<br>`).join('')}</p>` : ''}
                                      </div>
                                      <div style="margin:50px auto;width:70%;padding:20px 0">
                                          <img src="cid:unique@nodemailer.com"/>
                                          <p style="font-size: 10px">Pagarbiai,</p>
                                          <p style="font-size: 10px">Monitoringo centras</p>
                                          <p style="font-size: 10px">UAB Duomenų logistikos centras  |  A. Juozapavičiaus g. 13  |  LT-09311 Vilnius</p>
                                          <p style="font-size: 10px">Mob. +370 618 44 445;  +370 674 44 455 |</p>
                                          <p style="font-size: 10px">El.paštas noc@datalogistics.lt</p>
                                          <p style="font-size: 10px">www.datalogistics.lt</p>
                                      </div>
                                  </div>
                              </body>
                          </html>`,
                  };
              
                  transporter.sendMail(mail_configs, function (error, info) {
                    if (error) {
                      return reject({ message: `An error has occurred` });
                    }
                    return resolve({ message: 'Email sent successfully' });
                  });
                });
              };
              sendEmail()
        }
    },
    getVisits: async (req, res) => {
        const visistsCollection = client.db('ChecklistDB').collection('visits');
        const visits = await visistsCollection.find().toArray()
        sendRes(res, false, 'visits', visits)
    },
    getSingleVisit: async (req, res) => {
        const visistsCollection = client.db('ChecklistDB').collection('visits');
        const visitId = req.query.visitId
        const visits = await visistsCollection.find({id: Number(visitId)}).toArray()
        sendRes(res, false, 'visits', visits)
    },
    getCollocations: async (req, res) => {
        const collocationsCollection = client.db('ChecklistDB').collection('Collocations');
        const collocations = await collocationsCollection.find().toArray()
        sendRes(res, false, 'collocations', collocations)
    },
    getSingleClientsCollocations: async (req, res) => {
        const collocationsCollection = client.db('ChecklistDB').collection('Collocations');
        const companyId = req.query.companyId
        const addressId = req.query.addressId
        const collocations = await collocationsCollection.find({companyId:companyId, PremiseId: addressId}).toArray()
        sendRes(res, false, 'collocations', collocations)
    },
    addCompany: async (req, res) => {
        const companies = client.db('ChecklistDB').collection('companies');
        const companiesIdCounter = client.db('ChecklistDB').collection('companiesIdCounter')
        companiesIdCounter.findOneAndUpdate(
            {id:"companyId"},
            {"$inc": {"seq":1}},
            {new: true, upsert: true},
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
                    id: seqId
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
            {new: true, upsert: true},
             async (err, cd) => {
                let seqId
                if (!cd || !cd.value.seq) {
                    seqId = 1;
                }
                else {
                    seqId = cd.value.seq;
                }
                req.body.employeeId = seqId
                 await companyEmployees.insertOne( req.body);
            }
        );
        return sendRes(res, false, "all good", null)
    },
    getClientsEmployees: async (req, res) => {
        const companyEmployees = client.db('ChecklistDB').collection('companyEmployees');
        const companyId = Number(req.query.companyId)
        const employeeId = Number(req.query.employeeId)
        const employee = await companyEmployees.findOne({companyId: companyId, employeeId: employeeId})
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
        const companiesIdCounter = client.db('ChecklistDB').collection('companiesIdCounter');
        const companiesEmployeesIdCounter = client.db('ChecklistDB').collection('employeeIdCounter');
        const clientsEmployees = await companyEmployees.find().toArray()
    
        const companyId = Number(req.query.companyId);
        const parentCompanyId = Number(req.query.parentCompanyId);
        const companyData = await company.findOneAndDelete({ id: companyId });
        if (!companyData.value) {
            return res.status(404).send({ success: false, message: 'Company not found' });
        }

        const deletedEmployees = await companyEmployees.deleteMany({ companyId: companyId });
        const numDocumentsDeleted = deletedEmployees.deletedCount;
        const companyName = companyData.value.companyInfo.companyName.replace(/\s+/g, '');
        const companyLogofilePath = `C:/Users/Public/Desktop/DLC JOURNAL/DLC-Checklist-FrontEnd/public/CompanyLogos/${companyName}Logo${companyId}.jpeg`;

        fs.unlink(companyLogofilePath, (err) => {
            if (err) {
                console.error('Error deleting company logo file:', err);
            }
        });

        for(let i = 1; i<= numDocumentsDeleted; i++){
            for(let i = Number(clientsEmployees[0].employeeId); i <= Number(clientsEmployees[clientsEmployees.length - 1].employeeId); i++ ){
                const companyEmployeePhotoFilePath = `C:/Users/Public/Desktop/DLC JOURNAL/DLC-Checklist-FrontEnd/public/ClientsEmployeesPhotos/${companyName}companyId${companyId}employeeId${i}.jpeg`
                fs.unlink(companyEmployeePhotoFilePath, (err) => {
                    if (err) {
                        console.error('Error deleting file:', err);
                    } 
                });
        }}

        await company.updateMany(
            { parentCompanyId: companyId },
            { $unset: { parentCompanyId: '' } }
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
        const employeeId = await employeeIdCounter.findOne({id:"employeeId"})
        const clientsEmployeesCollection = client.db('ChecklistDB').collection('companyEmployees');
        const companyName = req.query.companyName.replace(/\s+/g, '');  
        const companyId = req.query.companyId
        const fileName =  `${companyName}companyId${companyId}employeeId${employeeId.seq - 1}.jpeg`
        const storage = multer.diskStorage({
            destination: function (req, file, cb) {
              cb(null, (`C:/Users/Public/Desktop/DLC JOURNAL/DLC-Checklist-FrontEnd/public/ClientsEmployeesPhotos`) )
            },
            filename: function (req, file, cb) {
                cb(null, fileName)
            }
        })
      const upload = multer({ storage:storage }).single('file')
      await clientsEmployeesCollection.findOneAndUpdate({employeeId: Number(employeeId.seq - 1)}, { $set: {
        employeePhoto: `${fileName}` 
      }})
      
      upload(req,res,function(err) {
        if(err) {
            return handleError(err, res);
        }
        res.json({"status":"completed"});
        })
    },
    updateClientsEmployeesPhoto: async (req, res) => {
        const employeeIdCounter = client.db('ChecklistDB').collection('employeeIdCounter');
        const clientsEmployeesCollection = client.db('ChecklistDB').collection('companyEmployees');
        const companyName = req.query.companyName.replace(/\s+/g, '');  
        const companyId = req.query.companyId
        const employeeId = req.query.employeeId
        const fileName =  `${companyName}companyId${companyId}employeeId${employeeId}.jpeg`
        const storage = multer.diskStorage({
            destination: function (req, file, cb) {
              cb(null, (`C:/Users/Public/Desktop/DLC JOURNAL/DLC-Checklist-FrontEnd/public/ClientsEmployeesPhotos`) )
            },
            filename: function (req, file, cb) {
                cb(null, fileName)
            }
        })
      const upload = multer({ storage:storage }).single('file')
      await clientsEmployeesCollection.findOneAndUpdate({companyId:Number(companyId), employeeId: Number(employeeId)}, { $set: {
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
        const companyId = Number(req.query.companyId)
        const employeeId = Number(req.query.employeeId)
        const companyName = req.query.companyName.split(' ').join('')
        await clientsEmployees.findOneAndDelete({companyId, employeeId})
        const filePath = `C:/Users/Public/Desktop/DLC JOURNAL/DLC-Checklist-FrontEnd/public/ClientsEmployeesPhotos/${companyName}companyId${companyId}employeeId${employeeId}.jpeg`
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
        await companiesCollenction.findOneAndUpdate({id: Number(req.query.companyId)},  { $set: {
            'companyInfo.J13': req.body.J13, 
            'companyInfo.T72': req.body.T72, 
            'companyInfo.companyName': req.body.companyName, 
        }}) 
        return sendRes(res, false, "all good", null)
    },

    deleteCompaniesSubClient: async (req, res) => {
        const companiesIdCounter = client.db('ChecklistDB').collection('companiesIdCounter')
        const companiesCollenction = client.db('ChecklistDB').collection('companies');
        await companiesCollenction.findOneAndDelete({id: Number(req.query.subClientId), parentCompanyId: Number(req.query.parentCompanyId)})
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
            { new: true, upsert: true},
             async (err, cd) => {
                let seqId
                if (!cd || !cd.value.seq) {
                    seqId = 1;
                }
                else {
                    seqId = cd.value.seq;
                }
                const companyData = {
                    parentCompanyId: Number(req.query.parentCompanyId),
                    companyInfo: req.body,
                    id: seqId
                }
                 await companies.insertOne(companyData);
            }
        );
        return sendRes(res, false, "all good", null)
    },
    getSubClients: async (req, res) => {
        const companies = client.db('ChecklistDB').collection('companies');
        const parentCompanyId = req.query.parentCompanyId
        const subClient = await companies.find({parentCompanyId: Number(parentCompanyId)}).toArray()
        return sendRes(res, false, "all good", subClient)
    },
    getSingleSubClient: async (req, res) => {
        const companies = client.db('ChecklistDB').collection('companies');
        const parentCompanyId = req.query.parentCompanyId
        const subClientId = req.query.subClientId
        const subClient = await companies.findOne({parentCompanyId: Number(parentCompanyId), id: Number(subClientId)})
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
                req.body.employeeId = seqId
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
            const mainCompanies = companies.filter(item => !item.parentCompanyId).filter((el) => el.id !== Number(companyId));
            return sendRes(res, false, "all good", mainCompanies)
        },
        addMainCompanyAsSubClient: async (req, res) => {
            const companiesCollection = client.db('ChecklistDB').collection('companies');
            await companiesCollection.findOneAndUpdate({id: Number(req.query.companyId)}, {$set: {parentCompanyId: Number(req.query.parentCompanyId), wasMainClient: true}})
            return sendRes(res, false, "all good", null)
        },
        changeSubClientToMainClient: async (req, res) => {
            const companiesCollection = client.db('ChecklistDB').collection('companies');
            await companiesCollection.findOneAndUpdate(
                { id: Number(req.query.companyId) },
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
    
            const dateMonthAgo = `${newYear}/${newMonth}/${day}`
            const checklistHistoryData = client.db('ChecklistDB').collection('checklistHistoryData');
            const allHistoryData = await checklistHistoryData.find().toArray()
            const startDateRangeStart = new Date(dateMonthAgo)
            const endDateRange = new Date(currentDate)
            const filteredData2 = allHistoryData?.filter(user => {
                const userStartDate = new Date(user.endDate)
                return userStartDate >= startDateRangeStart && userStartDate <= endDateRange
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
        getSpecificDateReport: async (req, res) => {
            const checklistHistoryData = client.db('ChecklistDB').collection('checklistHistoryData');
            const allHistoryData = await checklistHistoryData.find().toArray()
            const startDate = req.query.startDate
            const endDate = req.query.endDate
            const startDateRangeStart = new Date(startDate)
            const endDateRange = new Date(endDate)
            const filteredData2 = allHistoryData?.filter(user => {
                const userStartDate = new Date(user.endDate)
                return userStartDate >= startDateRangeStart && userStartDate <= endDateRange
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
          const filterEmptyFilledData = filteredData.filter((el) => el.filledData.length > 0)
          return sendRes(res, false, "totalHistoryData",filterEmptyFilledData) 
        },
        getAllClientsEmployees: async (req, res) => {
            const companies = client.db('ChecklistDB').collection('companyEmployees');
            const companyId = req.query.companyId
            const employees = await companies.find({companyId: Number(companyId)}).toArray()
            return sendRes(res, false, "all good", employees)
        },
        endVisit: async (req, res) => {
            const visistsCollection = client.db('ChecklistDB').collection('visits');
            const updateVisitStatus = await visistsCollection.findOneAndUpdate(
                { id: Number(req.query.visitId) },
                { $set: { visitStatus: 'error', endDate: getCurrentDate(), endTime: getCurrentTime()}}
            );
            return sendRes(res, false, "all good", [updateVisitStatus.value])  
        },
        startVisit: async (req, res) => {
            const visistsCollection = client.db('ChecklistDB').collection('visits');
            const updateVisitStatus = await visistsCollection.findOneAndUpdate(
                { id: Number(req.query.visitId) },
                { $set: { visitStatus: 'success', startDate: getCurrentDate(), startTime: getCurrentTime(), endDate: '', endTime: ''}}
            );
            return sendRes(res, false, "all good",  [updateVisitStatus.value])  
        },
        prepareVisit: async (req, res) => {
            const visistsCollection = client.db('ChecklistDB').collection('visits');
            const updateVisitStatus = await visistsCollection.findOneAndUpdate(
                { id: Number(req.query.visitId) },
                { $set: { visitStatus: 'processing', startDate: '', startTime: '', endDate: '', endTime:'' } }
            );
            return sendRes(res, false, "all good", [updateVisitStatus.value])  
        },
        filterByStatus: async (req, res) => {
            const visistsCollection = client.db('ChecklistDB').collection('visits');
            const filterOption = req.query.filterOption
            let sortCriteria = {};
            if (filterOption === 'processing') {
                sortCriteria = { visitStatus: 1 };
            } else if (filterOption === 'success') {
                sortCriteria = { visitStatus: -1 };
            }
            const filteredVisits = await visistsCollection.find().sort(sortCriteria).toArray();

            return sendRes(res, false, "all good",filteredVisits)  
        },
        deleteVisitor: async (req, res) => {
            const visitId = req.query.visitId
            const employeeId = req.query.employeeId
            const visistsCollection = client.db('ChecklistDB').collection('visits')
            const result = visistsCollection.findOneAndUpdate(
                { id: Number(visitId) },
                { $pull: { 'visitors': { 'selectedVisitor.employeeId': Number(employeeId) } } },
                { returnDocument: 'after' }
            );
                
                return sendRes(res, false, "all good", result.value)  
        },
         updateVisitorList: async (req, res) => {
            const visitId = req.query.visitId;
            const visitsCollection = client.db('ChecklistDB').collection('visits');
            const result =  await visitsCollection.findOneAndUpdate(
                { id: Number(visitId) },
                { $push: { 'visitors':  {idType: '', selectedVisitor: req.body}  } },
                { returnDocument: 'after' }
            );
        
            return sendRes(res, false, "all good", [result.value]);
        },
        updateClientsGests: async (req, res) => {
            const visitId = req.query.visitId;
            const visitsCollection = client.db('ChecklistDB').collection('Visits');
            console.log(req.body )
            const result =  visitsCollection.findOneAndUpdate(
                { id: Number(visitId) },
                { $push: { 'clientsGuests':  req.body.value  } }, 
                { returnDocument: 'after' }
            );
            return sendRes(res, false, "all good", result.value);
        },
        updateCarPlates: async (req, res) => {
            const visitId = req.query.visitId;
            const visitsCollection = client.db('ChecklistDB').collection('visits');
            const result =  visitsCollection.findOneAndUpdate(
                { id: Number(visitId) },
                { $push: { 'carPlates':  req.body.value  } }, 
                { returnDocument: 'after' }
            );
            return sendRes(res, false, "all good", result.value);
        },
        
        removeClientsGuest: async (req, res) => {
            const visitId = req.query.visitId
            const index = req.query.index
            const visitsCollection = client.db('ChecklistDB').collection('visits');
            const visit = await visitsCollection.findOne({id: Number(visitId)})
            visit.clientsGuests.splice(Number(index), 1);
            await visitsCollection.updateOne({ id: Number(visitId) }, { $set: { clientsGuests: visit.clientsGuests } });
        },
        removeCarPlates: async (req, res) => {
            const visitId = req.query.visitId
            const index = req.query.index
            const visitsCollection = client.db('ChecklistDB').collection('visits');
            const visit = await visitsCollection.findOne({id: Number(visitId)})
            visit.carPlates.splice(Number(index), 1);
            await visitsCollection.updateOne({ id: Number(visitId) }, { $set: { carPlates: visit.carPlates } });
        },
        updateVisitInformation: async (req, res) => {
            const visitId =           req.query.visitId
            const visitsCollection =  client.db('ChecklistDB').collection('visits');
            const existingVisit = await visitsCollection.findOne({ id: Number(visitId) });
            const updateVisit =       await visitsCollection.findOneAndUpdate({id: Number(visitId)}, {$set: {
                visitCollocation:     req.body.visitCollocation,
                startDate:            req.body.startDate,
                startTime:            req.body.startTime,
                endDate:              req.body.endDate,
                endTime:              req.body.endTime,
                dlcEmployees:         req.body.dlcEmployees,
                visitAddress:         req.body.visitAddress,
                visitPurpose:         req.body.visitPurpose,
                visitors:             req.body.visitors.map((el, i) => ({   
                ...existingVisit.visitors[i],
                selectedVisitor: req.body.visitors[i].selectedVisitor,
                idType: req.body.visitors[i].idType, 
            })),
            }})
            return sendRes(res, false, "all good", updateVisit);
        },
        addSignature: async (req, res) => {
            const visitId =     req.query.visitId
            const employeeId =  req.query.employeeId
            const signature =   req.body.signature
            const visitsCollection =  client.db('ChecklistDB').collection('visits');
            await visitsCollection.updateOne(
                { "id": Number(visitId), "visitors.selectedVisitor.employeeId": Number(employeeId) },
                { $set: { "visitors.$.signature": signature } }
                );
                return sendRes(res, false, "all good", null);
            },
        deleteSignature: async (req, res) => {
        const visitId = req.query.visitId
        const employeeId =  req.query.employeeId
        const visitsCollection = client.db('ChecklistDB').collection('visits');
        await visitsCollection.updateOne(
            { "id": Number(visitId), "visitors.selectedVisitor.employeeId": Number(employeeId) },
            { $set: { "visitors.$.signature": null } }
            );
            return sendRes(res, false, "all good", null);
        },
        addCollocation: async (req, res) => {
            const collocationCollection = client.db('ChecklistDB').collection('Collocations');
            await collocationCollection.updateOne(
                { "colocations.id": req.body.addressId, },
                {
                  $push: {
                    "colocations.$.premises": {
                      "premiseName": req.body.premise,
                      "racks": req.body.racks
                    }
                  }
                }
              );
            return sendRes(res, false, "all good", null);
        },
        deleteCollocation: async (req, res) => {
            const collocationCollection = client.db('ChecklistDB').collection('Collocations');
            const addressId = req.body.addressId;
            const premiseName = req.body.premiseName;
            const colocation = await collocationCollection.findOne({ "colocations.id": addressId });
            const premisesArray = colocation.colocations.find(c => c.id === addressId)?.premises;
            const premiseIndex = premisesArray.findIndex(p => p.premiseName === premiseName);
            premisesArray.splice(premiseIndex, 1);
            await collocationCollection.updateOne(
                { "colocations.id": addressId },
                { $set: { "colocations.$.premises": premisesArray } }
                );
                return sendRes(res, false, "Item deleted successfully", null);
            },
}