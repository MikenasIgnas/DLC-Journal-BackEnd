const express =             require("express")
const router =              express.Router()
const FilledChecklistData = require("../../shemas/FilledChecklistData");
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
    totalHistoryEntries,
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
    getArchivedUsers,
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
    getCompaniesEmployees,
    singleCompanyPage,
    getSingleCompaniesEmployees,
    getSingleCompaniesSites,
    postVisitDetails,
    getVisits,
    getSingleVisit,
} = require("../controllers/mainController")

router.post("/logInUser",                       login)
router.post("/createUser",                      verifyToken, registerValidation, createUser)
router.post('/postChecklistData',               verifyToken, postFilledChecklistData)
router.post('/updateFilledChecklistData',       verifyToken, updateFilledChecklistData)
router.post('/changePassword',                  verifyToken, passwordChangeValidation,changePassword)
router.post("/changeUsersRole/:secret",         verifyToken, changeUsersRole)
router.post("/editUserProfile/:secret",         verifyToken, editUserProfile)
router.post("/changedUsername/:secret",         verifyToken, changedUsername)
router.post("/updateUsersTheme/:secret",        verifyToken, updateUsersTheme)
router.post("/changeUsersStatus/:secret",       verifyToken, changeUsersStatus)
router.post("/addDeletionDate/:secret",         verifyToken, addDeletionData)
router.post("/updateHistoryItem/:id",           verifyToken, updateHistoryItem)
router.post("/postPhotos",                      verifyToken, postPhotos)
router.post("/postLastestAndCurrentPhotos",     verifyToken, postLastestAndCurrentPhotos)
router.post("/postLatestPhotos",                verifyToken, postLatestPhotos)
router.post("/uploadPhoto",                     verifyToken, uploadPhoto)
router.post("/postVisitDetails",                verifyToken, postVisitDetails)

router.get("/routeData",                        verifyToken, routeData)
router.get("/areasData",                        verifyToken, areasData)
router.get("/todoData",                         verifyToken, todoData)
router.get("/problemsData",                     verifyToken, problemsData)
router.get("/getSingleHistoryELementData/:id",  verifyToken, getSingleHistoryELementData)
router.get('/FindUser/:secret',                 verifyToken, FindUser)
router.get('/FindSingleUser/:secret',           verifyToken, FindSingleUser)
router.get('/getAllUsers',                      verifyToken, getAllUsers)
router.get('/getArchivedUsers',                 verifyToken, getArchivedUsers)
router.get("/totalHistoryEntries",              verifyToken, totalHistoryEntries)
router.get("/getTotalAreasCount",               verifyToken, getTotalAreasCount)
router.get("/deleteUser/:secret",               verifyToken, deleteUser)
router.get("/deleteHistoryItem/:_id",           verifyToken, deleteHistoryItem)
router.get("/latestHistoryItem",                verifyToken, latestHistoryItem)
router.get('/getHistoryData',                   verifyToken, getHistoryData)
router.get('/getPhotos/:photoId',               verifyToken, getPhotos)
router.get('/latestPhotos',                     verifyToken, latestPhotos)
router.get('/deletePhoto/:photoId',             verifyToken, deletePhoto)

router.get('/getCompanies',                     verifyToken, getCompanies)
router.get('/getCompaniesSites',                verifyToken, getCompaniesSites)
router.get('/getCompaniesPremises',             verifyToken, getCompaniesPremises)
router.get('/getCompaniesColocation',           verifyToken, getCompaniesColocation)
router.get('/getCompaniesEmployees',            verifyToken, getCompaniesEmployees)
router.get('/SingleCompanyPage/:id',            verifyToken, singleCompanyPage)
router.get('/getSingleCompaniesEmployees/:id',  verifyToken, getSingleCompaniesEmployees)
router.get('/getSingleCompaniesSites/:id',      verifyToken, getSingleCompaniesSites)
router.get('/getVisits',                        verifyToken, getVisits)
router.get('/getSingleVisit/:id',               verifyToken, getSingleVisit)

router.get('/checklistHistoryData',             verifyToken, paginatedResults(FilledChecklistData), (req,res) => {
  res.json(res.paginatedResults)
})

  function paginatedResults(model) {
    const checklistHistoryData = client.db('ChecklistDB').collection('checklistHistoryData');
    return async (req, res, next) => {
      const page = parseInt(req.query.page)
      const limit = parseInt(req.query.limit)
      const startIndex = (page - 1) * limit
      const endIndex = page * limit
      const results = {}
      if (endIndex < await model.countDocuments().exec()) {
        results.next = {
          page: page + 1,
          limit: limit
        }
      }
      if (startIndex > 0) {
        results.previous = {
          page: page - 1,
          limit: limit
        }
      }
      try {
        results.results = await checklistHistoryData.find().skip(startIndex).sort({ _id: -1 }).limit(limit).toArray();
        res.paginatedResults = results
        next()
      } catch (e) {
        res.status(500).json({ message: e.message })
      }
    }
  }

module.exports = router

