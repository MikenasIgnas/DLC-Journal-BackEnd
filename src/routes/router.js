const express =             require("express")
const router =              express.Router()
const FilledChecklistData = require("../shemas/FilledChecklistData");
const VisitsData =          require('../shemas/VisitsSchema')
const AllUsersData =        require('../shemas/AllUsersSchema')
const MongoClient =         require('mongodb').MongoClient;
const client =              new MongoClient('mongodb://10.81.7.29:27017/');

const {
    registerValidation,
    passwordChangeValidation,
    verifyToken,
} = require("../middleware/middle")

const {
  createUser, 
    login,
    routeData,
    areasData,
    todoData,
    problemsData,
    postFilledChecklistData,
    getSingleHistoryELementData,
    updateFilledChecklistData,
    checklistHistoryCount,
    allUsersCount,
    visitsCount,
    archivedUsersCount,
    getTotalAreasCount,
    FindUser,
    getAllUsers,
    deleteUser,
    deleteVisit,
    changePassword,
    changeUsersRole,
    editUserProfile,
    changedUsername,
    FindSingleUser,
    updateUsersTheme,
    changeUsersStatus,
    addDeletionData,
    deleteHistoryItem,
    latestHistoryItem,
    updateHistoryItem,
    getHistoryData,
    postPhotos,
    getPhotos,
    latestPhotos,
    deletePhoto,
    postLastestAndCurrentPhotos,
    postLatestPhotos,
    uploadPhoto,
    getCompanies,
    getCompaniesSites,
    getCompaniesPremises,
    getCompaniesColocation,
    singleCompanyPage,
    getSingleCompaniesEmployees,
    postVisitDetails,
    getVisits,
    getSingleVisit,
    getCollocations,
    addCompany,
    addEmployee,
    getClientsEmployees,
    getClientsEmployeesCompanyName,
    uploadCompanysPhoto,
    deleteCompany,
    uploadCliesntEmployeesPhoto,
    deleteClientsEmployee,
    updateClientsEmployee,
    updateCompaniesData,
    addSubClient,
    deleteCompaniesSubClient,
    getSubClients,
    addSubClientsEmployee,
    getSubClientsEmployees,
    deleteSubClientsEmployee,
    getAllMainCompanies,
    addMainCompanyAsSubClient,
    changeSubClientToMainClient,
    getSingleSubClient,
    getAllHistoryData,
    generateMonthlyPDFReport,
    getAllClientsEmployees,
    getSingleClientsCollocations,
    getSpecificDateReport,
    totalVisitsEntries,
    endVisit,
    startVisit,
    prepareVisit,
    filterByStatus,
    deleteVisitor,
    updateVisitorList,
    updateClientsGests,
    updateCarPlates,
    removeClientsGuest,
    removeCarPlates,
    updateVisitInformation,
    addSignature,
    deleteSignature,
} = require("../controllers/mainController");
const { default: pdfController } = require("../controllers/pdfController");

router.post("/logInUser",                         login)
router.post("/createUser",                        verifyToken, registerValidation, createUser)
router.post('/postChecklistData',                 verifyToken, postFilledChecklistData)
router.post('/updateFilledChecklistData',         verifyToken, updateFilledChecklistData)
router.post('/changePassword',                    verifyToken, passwordChangeValidation,changePassword)
router.post("/changeUsersRole/:id",               verifyToken, changeUsersRole)
router.post("/editUserProfile/:id",               verifyToken, editUserProfile)
router.post("/changedUsername/:id",               verifyToken, changedUsername)
router.post("/updateUsersTheme/:id",              verifyToken, updateUsersTheme)
router.post("/changeUsersStatus/:id",             verifyToken, changeUsersStatus)
router.post("/addDeletionDate/:id",               verifyToken, addDeletionData)
router.post("/updateHistoryItem/:id",             verifyToken, updateHistoryItem)
router.post("/postPhotos",                        verifyToken, postPhotos)
router.post("/postLastestAndCurrentPhotos",       verifyToken, postLastestAndCurrentPhotos)
router.post("/postLatestPhotos",                  verifyToken, postLatestPhotos)
router.post("/uploadPhoto",                       uploadPhoto)
router.post("/uploadCompanysPhoto",               uploadCompanysPhoto)
router.post("/uploadCliesntEmployeesPhoto",       uploadCliesntEmployeesPhoto)
router.post("/postVisitDetails",                  verifyToken, postVisitDetails)

router.get("/startVisit",                         verifyToken, startVisit)
router.get("/endVisit",                           verifyToken, endVisit)
router.get("/prepareVisit",                       verifyToken, prepareVisit)
router.get("/routeData",                          verifyToken, routeData)
router.get("/areasData",                          verifyToken, areasData)
router.get("/todoData",                           verifyToken, todoData)
router.get("/problemsData",                       verifyToken, problemsData)
router.get("/getSingleHistoryELementData/:id",    verifyToken, getSingleHistoryELementData)
router.get('/FindUser/:id',                       verifyToken, FindUser)
router.get('/FindSingleUser/:id',                 verifyToken, FindSingleUser)
router.get('/getAllUsers',                        verifyToken, getAllUsers)

router.get("/checklistHistoryCount",              verifyToken, checklistHistoryCount)
router.get("/allUsersCount",                      verifyToken, allUsersCount)
router.get("/visitsCount",                        verifyToken, visitsCount)
router.get("/archivedUsersCount",                 verifyToken, archivedUsersCount)

router.get("/getTotalAreasCount",                 verifyToken, getTotalAreasCount)
router.get("/deleteUser/:id",                     verifyToken, deleteUser)
router.get("/deleteVisit/:id",                    verifyToken, deleteVisit)
router.get("/deleteHistoryItem/:id",              verifyToken, deleteHistoryItem)
router.get("/latestHistoryItem",                  verifyToken, latestHistoryItem)
router.get('/getHistoryData',                     verifyToken, getHistoryData)
router.get('/getPhotos/:photoId',                 verifyToken, getPhotos)
router.get('/latestPhotos',                       verifyToken, latestPhotos)
router.get('/deletePhoto/:photoId',               verifyToken, deletePhoto)
router.get('/getAllHistoryData',                  verifyToken, getAllHistoryData)
router.get('/generateMonthlyPDFReport',           verifyToken,   generateMonthlyPDFReport)

router.get('/getCompanies',                       verifyToken, getCompanies)
router.get('/getCompaniesSites',                  verifyToken, getCompaniesSites)
router.get('/getCompaniesPremises',               verifyToken, getCompaniesPremises)
router.get('/getCompaniesColocation',             verifyToken, getCompaniesColocation)

router.get('/SingleCompanyPage/:id',              verifyToken, singleCompanyPage)
router.get('/getSingleCompaniesEmployees/:id',    verifyToken, getSingleCompaniesEmployees)
router.get('/getVisits',                          verifyToken, getVisits)
router.get('/getSingleVisit/:id',                 verifyToken, getSingleVisit)
router.get('/getCollocations',                    verifyToken, getCollocations)
router.get('/getSingleClientsCollocations',       verifyToken, getSingleClientsCollocations)
router.get('/getClientsEmployee',                 verifyToken, getClientsEmployees)
router.get('/getClientsEmployeesCompanyName/:id', verifyToken, getClientsEmployeesCompanyName)
router.get('/getAllClientsEmployees',             verifyToken, getAllClientsEmployees)
router.get('/deleteCompany/:id',                  verifyToken, deleteCompany)
router.get('/deleteClientsEmployee',              verifyToken, deleteClientsEmployee)
router.get('/deleteCompaniesSubClient',           verifyToken, deleteCompaniesSubClient)
router.get('/getSubClients',                      verifyToken, getSubClients)
router.get('/getSingleSubClient',                 verifyToken, getSingleSubClient)
router.get('/getSubClientsEmployees',             verifyToken, getSubClientsEmployees)
router.get('/deleteSubClientsEmployee',           verifyToken, deleteSubClientsEmployee)
router.get('/getAllMainCompanies',                verifyToken, getAllMainCompanies)

router.post('/addCompany',                        verifyToken, addCompany)
router.post('/addEmployee',                       verifyToken, addEmployee)
router.post('/updateClientsEmployee',             verifyToken, updateClientsEmployee)
router.post('/updateCompaniesData',               verifyToken, updateCompaniesData)
router.post('/addSubClient',                      verifyToken, addSubClient)
router.post('/addSubClientsEmployee',             verifyToken, addSubClientsEmployee)
router.post('/addMainCompanyAsSubClient',         verifyToken, addMainCompanyAsSubClient)
router.get('/changeSubClientToMainClient',        verifyToken, changeSubClientToMainClient)
router.get('/getSpecificDateReport',              verifyToken, getSpecificDateReport)
router.get('/totalVisitsEntries',                 verifyToken, totalVisitsEntries)
router.get('/deleteVisitor',                      verifyToken, deleteVisitor)
router.post('/updateVisitorList',                 verifyToken, updateVisitorList)

router.post('/updateClientsGests',                verifyToken, updateClientsGests)
router.post('/updateCarPlates',                   verifyToken, updateCarPlates)
router.post('/updateVisitInformation',            verifyToken, updateVisitInformation)

router.get('/filterByStatus',                     verifyToken, filterByStatus)
router.get('/removeClientsGuest',                 verifyToken, removeClientsGuest)
router.get('/removeCarPlates',                    verifyToken, removeCarPlates)
router.post('/addSignature',                      verifyToken, addSignature)
router.get('/deleteSignature',                    verifyToken, deleteSignature)

router.get('/generatePdf',                    pdfController)

router.get('/checklistHistoryData',               verifyToken, paginatedResults(FilledChecklistData, 'checklistHistoryData'), (req,res) => {
  res.json(res.paginatedResults.results)
})

router.get('/visitsData',                         verifyToken, paginatedResults(VisitsData, 'Visits'), async(req,res) => {
  res.json(res.paginatedResults.results)
})
router.get('/allUsers',                           verifyToken, paginatedResults(AllUsersData, 'registeredusers'), async(req,res) => {
  res.json(res.paginatedResults.results)
})
router.get('/getArchivedUsers',                   verifyToken, paginatedResults(AllUsersData, 'archivedusers'), async(req,res) => {
  res.json(res.paginatedResults.results)
})

function paginatedResults(model, collection) {
  return async (req, res, next) => {
    const dbCollection =  client.db('ChecklistDB').collection(collection);
    const page =          parseInt(req.query.page);
    const limit =         parseInt(req.query.limit);
    const filterOption =  req.query.filter;
    const startIndex =    (page - 1) * limit;
    const endIndex =      page * limit;
    const results =       {};
    const selectFilter =  req.query.selectFilter;
    try {
      if (endIndex < await model.countDocuments().exec()) {
        results.next = { page: page + 1, limit: limit };
      }
      if (startIndex > 0) {
        results.previous = { page: page - 1, limit: limit };
      }

      let query;
      if (filterOption !== undefined) {
        const filterFunction = item => {
          for (const key in item) {
            if (key === 'signature') {
              continue
            }
            if (typeof item[key] === 'string' && item[key].toLowerCase().includes(filterOption)) {
              return true;
            }
          }
          return false;
        };
        const allDocuments = await dbCollection.find().toArray();
        const filteredDocuments = allDocuments.filter(filterFunction);
        query = dbCollection.find({ _id: { $in: filteredDocuments.map(doc => doc._id) } });
      } else if (selectFilter !== undefined) {
        const filterFunction = item => {
            for (const key in item) {
                if (key === 'signature') {
                    continue;
                }
                if (typeof item[key] === 'string' && item[key].toLowerCase() === selectFilter.toLowerCase()) {
                    return true;
                }
            }
            return false;
        };
    
        const allDocuments = await dbCollection.find().toArray();
        const filteredDocuments = allDocuments.filter(filterFunction);
        query = dbCollection.find({ _id: { $in: filteredDocuments.map(doc => doc._id) } });
    }else {
        query = dbCollection.find().sort({id: -1});
      }

      results.results = await query.skip(startIndex).limit(limit).toArray();
      res.paginatedResults = results;
      next();
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  };
}
  
  module.exports = router

                                  