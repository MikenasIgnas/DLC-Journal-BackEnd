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
  getTotalAreasCount,
  changedUsername,
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
  getSpecificDateReport,
}                                     from '../controllers/mainController'
import { verifyToken  }               from '../middleware/middle'
import FilledChecklistData            from '../shemas/FilledChecklistData'

import {
  paginatedResults,
}                                     from './paginatedResultsFunctions'

const router = Router()


router.post('/postChecklistData', verifyToken, postFilledChecklistData)
router.post('/updateFilledChecklistData', verifyToken, updateFilledChecklistData)
router.post('/changedUsername/:id', verifyToken, changedUsername)
router.post('/updateHistoryItem/:id', verifyToken, updateHistoryItem)
router.post('/postPhotos', verifyToken, postPhotos)
router.post('/postLastestAndCurrentPhotos', verifyToken, postLastestAndCurrentPhotos)
router.post('/postLatestPhotos', verifyToken, postLatestPhotos)

router.get('/routeData', verifyToken, routeData)
router.get('/areasData', verifyToken, areasData)
router.get('/todoData', verifyToken, todoData)
router.get('/problemsData', verifyToken, problemsData)
router.get('/getSingleHistoryELementData/:id', verifyToken, getSingleHistoryELementData)

router.get('/checklistHistoryCount', verifyToken, checklistHistoryCount)

router.get('/getTotalAreasCount', getTotalAreasCount)
router.get('/deleteHistoryItem', verifyToken, deleteHistoryItem)
router.get('/latestHistoryItem', verifyToken, latestHistoryItem)
router.get('/getHistoryData', verifyToken, getHistoryData)
router.get('/getPhotos/:photoId', verifyToken, getPhotos)
router.get('/latestPhotos', verifyToken, latestPhotos)
router.get('/deletePhoto/:photoId', verifyToken, deletePhoto)

router.get('/getSpecificDateReport', verifyToken, getSpecificDateReport)


router.get(
  '/checklistHistoryData',
  verifyToken,
  paginatedResults(FilledChecklistData, 'ChecklistDB', 'checklistHistoryData'),
  (req, res) => { res.json(res.paginatedResults.results) }
)

export default router

