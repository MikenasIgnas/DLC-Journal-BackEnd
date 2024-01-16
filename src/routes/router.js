import { Router }                     from 'express'

import {
  routeData,
  areasData,
  todoData,
  problemsData,
  postFilledChecklistData,
  getSingleHistoryELementData,
  updateFilledChecklistData,
  checklistHistoryCount,
  visitsCount,
  getTotalAreasCount,
  deleteVisit,
  changedUsername,
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
  getSingleCompany,
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
  updateClientsEmployeesPhoto,
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
  // getAllHistoryData,
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
  addCollocation,
  deleteCollocation,
}                                     from '../controllers/mainController'
import { verifyToken  }               from '../middleware/middle'
import allCollocationsCsvController   from '../controllers/allCollocationsCsvController'
import checklistPdfController         from '../controllers/checklistPdfController'
import FilledChecklistData            from '../shemas/FilledChecklistData'
import multipleVisitPdfController     from '../controllers/multipleVisitPdfController'
import singleCollocationCsvController from '../controllers/singleCollocationCsvController'
import singleVisitPdfController       from '../controllers/singleVisitPdfController'
import VisitsData                     from '../shemas/VisitsSchema'

import {
  paginatedResults,
  paginatedVisitsResults,
}                                     from './paginatedResultsFunctions'

const router = Router()


router.post('/postChecklistData', verifyToken, postFilledChecklistData)
router.post('/updateFilledChecklistData', verifyToken, updateFilledChecklistData)
router.post('/changedUsername/:id', verifyToken, changedUsername)
router.post('/addDeletionDate/:id', verifyToken, addDeletionData)
router.post('/updateHistoryItem/:id', verifyToken, updateHistoryItem)
router.post('/postPhotos', verifyToken, postPhotos)
router.post('/postLastestAndCurrentPhotos', verifyToken, postLastestAndCurrentPhotos)
router.post('/postLatestPhotos', verifyToken, postLatestPhotos)
router.post('/uploadPhoto', uploadPhoto)
router.post('/uploadCompanysPhoto', uploadCompanysPhoto)
router.post('/uploadCliesntEmployeesPhoto', uploadCliesntEmployeesPhoto)
router.post('/updateClientsEmployeesPhoto', updateClientsEmployeesPhoto)
router.post('/postVisitDetails', verifyToken, postVisitDetails)

router.get('/startVisit', verifyToken, startVisit)
router.get('/endVisit', verifyToken, endVisit)
router.get('/prepareVisit', verifyToken, prepareVisit)
router.get('/routeData', verifyToken, routeData)
router.get('/areasData', verifyToken, areasData)
router.get('/todoData', verifyToken, todoData)
router.get('/problemsData', verifyToken, problemsData)
router.get('/getSingleHistoryELementData/:id', verifyToken, getSingleHistoryELementData)

router.get('/checklistHistoryCount', verifyToken, checklistHistoryCount)
router.get('/visitsCount', verifyToken, visitsCount)

router.get('/getTotalAreasCount', getTotalAreasCount)
router.get('/deleteVisit', verifyToken, deleteVisit)
router.get('/deleteHistoryItem', verifyToken, deleteHistoryItem)
router.get('/latestHistoryItem', verifyToken, latestHistoryItem)
router.get('/getHistoryData', verifyToken, getHistoryData)
router.get('/getPhotos/:photoId', verifyToken, getPhotos)
router.get('/latestPhotos', verifyToken, latestPhotos)
router.get('/deletePhoto/:photoId', verifyToken, deletePhoto)
// router.get('/getAllHistoryData', verifyToken, getAllHistoryData)

router.get('/getCompanies', verifyToken, getCompanies)
router.get('/getCompaniesSites', verifyToken, getCompaniesSites)

router.get('/getSingleCompany', verifyToken, getSingleCompany)
router.get('/getSingleCompaniesEmployees', verifyToken, getSingleCompaniesEmployees)
router.get('/getVisits', verifyToken, getVisits)
router.get('/getSingleVisit', verifyToken, getSingleVisit)
router.get('/getCollocations', verifyToken, getCollocations)
router.get('/getSingleClientsCollocations', verifyToken, getSingleClientsCollocations)
router.get('/getClientsEmployee', verifyToken, getClientsEmployees)
router.get('/getClientsEmployeesCompanyName/:id', verifyToken, getClientsEmployeesCompanyName)
router.get('/getAllClientsEmployees', verifyToken, getAllClientsEmployees)
router.get('/deleteCompany', verifyToken, deleteCompany)
router.get('/deleteClientsEmployee', verifyToken, deleteClientsEmployee)
router.get('/deleteCompaniesSubClient', verifyToken, deleteCompaniesSubClient)
router.get('/getSubClients', verifyToken, getSubClients)
router.get('/getSingleSubClient', verifyToken, getSingleSubClient)
router.get('/getSubClientsEmployees', verifyToken, getSubClientsEmployees)
router.get('/deleteSubClientsEmployee', verifyToken, deleteSubClientsEmployee)
router.get('/getAllMainCompanies', verifyToken, getAllMainCompanies)

router.post('/addCompany', verifyToken, addCompany)
router.post('/addEmployee', verifyToken, addEmployee)
router.post('/updateClientsEmployee', verifyToken, updateClientsEmployee)
router.post('/updateCompaniesData', verifyToken, updateCompaniesData)
router.post('/addSubClient', verifyToken, addSubClient)
router.post('/addSubClientsEmployee', verifyToken, addSubClientsEmployee)
router.post('/addMainCompanyAsSubClient', verifyToken, addMainCompanyAsSubClient)
router.get('/changeSubClientToMainClient', verifyToken, changeSubClientToMainClient)
router.get('/getSpecificDateReport', verifyToken, getSpecificDateReport)
router.get('/totalVisitsEntries', verifyToken, totalVisitsEntries)
router.get('/deleteVisitor', verifyToken, deleteVisitor)
router.post('/updateVisitorList', verifyToken, updateVisitorList)

router.post('/updateClientsGests', verifyToken, updateClientsGests)
router.post('/updateCarPlates', verifyToken, updateCarPlates)
router.post('/updateVisitInformation', verifyToken, updateVisitInformation)

router.get('/filterByStatus', verifyToken, filterByStatus)
router.get('/removeClientsGuest', verifyToken, removeClientsGuest)
router.get('/removeCarPlates', verifyToken, removeCarPlates)
router.post('/addSignature', verifyToken, addSignature)
router.post('/addCollocation', verifyToken, addCollocation)
router.post('/deleteCollocation', verifyToken, deleteCollocation)
router.get('/deleteSignature', verifyToken, deleteSignature)

router.get('/generatePdf', verifyToken, singleVisitPdfController)
router.get('/generateMultipleVisitPdf', verifyToken, multipleVisitPdfController)
router.post('/generateAllCollocationsCSV', verifyToken, allCollocationsCsvController)
router.post('/generateSingleCollocationCSV', verifyToken, singleCollocationCsvController)

router.get('/generateMultipleChecklistHistoryPdf',verifyToken, checklistPdfController)



router.get(
  '/checklistHistoryData',
  verifyToken,
  paginatedResults(FilledChecklistData, 'ChecklistDB', 'checklistHistoryData'),
  (req, res) => { res.json(res.paginatedResults.results) }
)

router.get(
  '/visitsData',
  verifyToken,
  paginatedVisitsResults(VisitsData, 'visits'),
  async (req, res) => { res.json(res.paginatedResults.results) }
)


export default router

