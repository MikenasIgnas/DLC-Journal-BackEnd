import { Router }          from 'express'

import {
  verifyAdmin,
  verifyToken,
}                          from '../middleware/middle'
import { upload }          from '../utility/uploadPhoto'
import createVisit         from '../controllers/visitsControllers/createVisit'
import createVisitor       from '../controllers/visitsControllers/createVisitor'
import createVisitorIdType from '../controllers/visitsControllers/createVisitorIdType'
import createVisitStatus   from '../controllers/visitsControllers/createVisitStatus'
import deleteVisit         from '../controllers/visitsControllers/deleteVisit'
import deleteVisitor       from '../controllers/visitsControllers/deleteVisitor'
import deleteVisitorIdType from '../controllers/visitsControllers/deleteVisitorIdType'
import deleteVisitStatus   from '../controllers/visitsControllers/deleteVisitStatus'
import editVisit           from '../controllers/visitsControllers/editVisit'
import editVisitor         from '../controllers/visitsControllers/editVisitor'
import editVisitorIdType   from '../controllers/visitsControllers/editVisitorIdType'
import editVisitStatus     from '../controllers/visitsControllers/editVisitStatus'
import endVisit            from '../controllers/visitsControllers/endVisit'
import getVisit            from '../controllers/visitsControllers/getVisit'
import getVisitor          from '../controllers/visitsControllers/getVisitor'
import getVisitorIdType    from '../controllers/visitsControllers/getVisitorIdType'
import getVisitStatus      from '../controllers/visitsControllers/getVisitStatus'
import startVisit          from '../controllers/visitsControllers/startVisit'

const router = Router()

router.post('/visitStatus', verifyToken, verifyAdmin, createVisitStatus)
router.put('/visitStatus', verifyToken, verifyAdmin, editVisitStatus)
router.delete('/visitStatus', verifyToken, verifyAdmin, deleteVisitStatus)
router.get('/visitStatus', verifyToken, getVisitStatus)

router.post('/visitorIdType', verifyToken, verifyAdmin, createVisitorIdType)
router.put('/visitorIdType', verifyToken, verifyAdmin, editVisitorIdType)
router.delete('/visitorIdType', verifyToken, verifyAdmin, deleteVisitorIdType)
router.get('/visitorIdType', verifyToken, getVisitorIdType)

router.post('/visitor', verifyToken, createVisitor)
router.put('/visitor', verifyToken, editVisitor)
router.delete('/visitor', verifyToken, deleteVisitor)
router.get('/visitor', verifyToken, getVisitor)

router.post('/visit', verifyToken, upload.single('photo'), createVisit)
router.put('/visit', verifyToken, upload.single('photo'), editVisit)
router.delete('/visit', verifyToken, deleteVisit)
router.get('/visit', verifyToken, getVisit)
router.post('/start', verifyToken, startVisit)
router.post('/end', verifyToken, endVisit)

export default router
