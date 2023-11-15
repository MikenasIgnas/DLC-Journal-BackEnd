const express =             require("express")
const router =              express.Router()
const FilledChecklistData = require("../../shemas/FilledChecklistData");
const VisitsData =          require('../../shemas/VisitsSchema')
const AllUsersData =        require('../../shemas/AllUsersSchema')
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
    getSingleCompaniesSites,
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
} = require("../controllers/mainController")

router.post("/logInUser",                       login)
router.post("/createUser",                      verifyToken, registerValidation, createUser)
router.post('/postChecklistData',               verifyToken, postFilledChecklistData)
router.post('/updateFilledChecklistData',       verifyToken, updateFilledChecklistData)
router.post('/changePassword',                  verifyToken, passwordChangeValidation,changePassword)
router.post("/changeUsersRole/:id",         verifyToken, changeUsersRole)
router.post("/editUserProfile/:id",         verifyToken, editUserProfile)
router.post("/changedUsername/:id",         verifyToken, changedUsername)
router.post("/updateUsersTheme/:id",        verifyToken, updateUsersTheme)
router.post("/changeUsersStatus/:id",       verifyToken, changeUsersStatus)
router.post("/addDeletionDate/:id",         verifyToken, addDeletionData)
router.post("/updateHistoryItem/:id",           verifyToken, updateHistoryItem)
router.post("/postPhotos",                      verifyToken, postPhotos)
router.post("/postLastestAndCurrentPhotos",     verifyToken, postLastestAndCurrentPhotos)
router.post("/postLatestPhotos",                verifyToken, postLatestPhotos)
router.post("/uploadPhoto",                     uploadPhoto)
router.post("/uploadCompanysPhoto",             uploadCompanysPhoto)
router.post("/uploadCliesntEmployeesPhoto",     uploadCliesntEmployeesPhoto)
router.post("/postVisitDetails",                verifyToken, postVisitDetails)

router.get("/startVisit",                       verifyToken, startVisit)
router.get("/endVisit",                         verifyToken, endVisit)
router.get("/prepareVisit",                     verifyToken, prepareVisit)
router.get("/routeData",                        verifyToken, routeData)
router.get("/areasData",                        verifyToken, areasData)
router.get("/todoData",                         verifyToken, todoData)
router.get("/problemsData",                     verifyToken, problemsData)
router.get("/getSingleHistoryELementData/:id",  verifyToken, getSingleHistoryELementData)
router.get('/FindUser/:id',                     verifyToken, FindUser)
router.get('/FindSingleUser/:id',               verifyToken, FindSingleUser)
router.get('/getAllUsers',                      verifyToken, getAllUsers)

router.get("/checklistHistoryCount",            verifyToken, checklistHistoryCount)
router.get("/allUsersCount",                    verifyToken, allUsersCount)
router.get("/visitsCount",                      verifyToken, visitsCount)
router.get("/archivedUsersCount",               verifyToken, archivedUsersCount)

router.get("/getTotalAreasCount",               verifyToken, getTotalAreasCount)
router.get("/deleteUser/:id",                   verifyToken, deleteUser)
router.get("/deleteHistoryItem/:_id",           verifyToken, deleteHistoryItem)
router.get("/latestHistoryItem",                verifyToken, latestHistoryItem)
router.get('/getHistoryData',                   verifyToken, getHistoryData)
router.get('/getPhotos/:photoId',               verifyToken, getPhotos)
router.get('/latestPhotos',                     verifyToken, latestPhotos)
router.get('/deletePhoto/:photoId',             verifyToken, deletePhoto)
router.get('/getAllHistoryData',                verifyToken, getAllHistoryData)
router.get('/generateMonthlyPDFReport',         verifyToken,   generateMonthlyPDFReport)

router.get('/getCompanies',                     verifyToken, getCompanies)
router.get('/getCompaniesSites',                verifyToken, getCompaniesSites)
router.get('/getCompaniesPremises',             verifyToken, getCompaniesPremises)
router.get('/getCompaniesColocation',           verifyToken, getCompaniesColocation)

router.get('/SingleCompanyPage/:id',            verifyToken, singleCompanyPage)
router.get('/getSingleCompaniesEmployees/:id',  verifyToken, getSingleCompaniesEmployees)
router.get('/getSingleCompaniesSites/:id',      verifyToken, getSingleCompaniesSites)
router.get('/getVisits',                        verifyToken, getVisits)
router.get('/getSingleVisit/:id',               verifyToken, getSingleVisit)
router.get('/getCollocations',                  verifyToken, getCollocations)
router.get('/getSingleClientsCollocations',     verifyToken, getSingleClientsCollocations)
router.get('/getClientsEmployee',               verifyToken, getClientsEmployees)
router.get('/getClientsEmployeesCompanyName/:id', verifyToken, getClientsEmployeesCompanyName)
router.get('/getAllClientsEmployees',           verifyToken, getAllClientsEmployees)
router.get('/deleteCompany/:id',                verifyToken, deleteCompany)
router.get('/deleteClientsEmployee',            verifyToken, deleteClientsEmployee)
router.get('/deleteCompaniesSubClient',         verifyToken, deleteCompaniesSubClient)
router.get('/getSubClients',                    verifyToken, getSubClients)
router.get('/getSingleSubClient',               verifyToken, getSingleSubClient)
router.get('/getSubClientsEmployees',           verifyToken, getSubClientsEmployees)
router.get('/deleteSubClientsEmployee',         verifyToken, deleteSubClientsEmployee)
router.get('/getAllMainCompanies',              verifyToken, getAllMainCompanies)

router.post('/addCompany',                      verifyToken, addCompany)
router.post('/addEmployee',                     verifyToken, addEmployee)
router.post('/updateClientsEmployee',           verifyToken, updateClientsEmployee)
router.post('/updateCompaniesData',             verifyToken, updateCompaniesData)
router.post('/addSubClient',                    verifyToken, addSubClient)
router.post('/addSubClientsEmployee',           verifyToken, addSubClientsEmployee)
router.post('/addMainCompanyAsSubClient',       verifyToken, addMainCompanyAsSubClient)
router.get('/changeSubClientToMainClient',      verifyToken, changeSubClientToMainClient)
router.get('/getSpecificDateReport',            verifyToken, getSpecificDateReport)
router.get('/totalVisitsEntries',               verifyToken, totalVisitsEntries)

router.get('/filterByStatus',                   verifyToken, filterByStatus)

router.get('/checklistHistoryData',             verifyToken, paginatedResults(FilledChecklistData, 'checklistHistoryData'), (req,res) => {
  res.json(res.paginatedResults)
})

router.get('/visitsData',                       verifyToken, paginatedResults(VisitsData, 'Visits'), async(req,res) => {
  res.json(res.paginatedResults.results)
})
router.get('/allUsers',                         verifyToken, paginatedResults(AllUsersData, 'registeredusers'), async(req,res) => {
  res.json(res.paginatedResults.results)
})
router.get('/getArchivedUsers',                         verifyToken, paginatedResults(AllUsersData, 'archivedusers'), async(req,res) => {
  res.json(res.paginatedResults.results)
})
function paginatedResults(model, collection) {
  return async (req, res, next) => {
    const dbCollection = client.db('ChecklistDB').collection(collection);
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const filterOption = req.query.filter;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const results = {};

    try {
      if (endIndex < await model.countDocuments().exec()) {
        results.next = { page: page + 1, limit: limit };
      }
      if (startIndex > 0) {
        results.previous = { page: page - 1, limit: limit };
      }
      const sortCriteriaMap = {
        default: { id: -1 },
        success: { visitStatus: -1 },
        processing: { visitStatus: 1 },
        '1': { 'visitInfo.visitAddress': 1 },
        '2': { 'visitInfo.visitAddress': -1 },
        admin: { userRole: 1 },
        user: { userRole: -1 },
        active: { status: 1},
        inactive: { status: -1}
      };
      const sortCriteria = sortCriteriaMap[filterOption] || sortCriteriaMap.default;
      const query = dbCollection.find().sort(sortCriteria);
      results.results = await query.skip(startIndex).limit(limit).toArray();
      res.paginatedResults = results;
      next();
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  };
}

module.exports = router