import { Router }    from 'express'

import {
  verifyAdmin,
  verifyToken,
}                    from '../middleware/middle'
import createPremise   from '../controllers/sitesControllers/createPremise'
import createRack      from '../controllers/sitesControllers/createRack'
import createSite      from '../controllers/sitesControllers/createSite'
import deletePremise   from '../controllers/sitesControllers/deletePremise'
import deleteRack      from '../controllers/sitesControllers/deleteRack'
import deleteSite      from '../controllers/sitesControllers/deleteSite'
import editPremise     from '../controllers/sitesControllers/editPremise'
import editRack        from '../controllers/sitesControllers/editRack'
import editSite        from '../controllers/sitesControllers/editSite'
import getFullSiteData from '../controllers/sitesControllers/getFullSiteData'
import getPremise      from '../controllers/sitesControllers/getPremise'
import getRack         from '../controllers/sitesControllers/getRack'
import getSite         from '../controllers/sitesControllers/getSite'


const router = Router()

router.post('/site', verifyToken, verifyAdmin, createSite)
router.put('/site', verifyToken, verifyAdmin, editSite)
router.delete('/site', verifyToken, verifyAdmin, deleteSite)
router.get('/site', verifyToken, getSite)
router.get('/fullSiteData', verifyToken, getFullSiteData)

router.post('/premise', verifyToken, verifyAdmin, createPremise)
router.put('/premise', verifyToken, verifyAdmin, editPremise)
router.delete('/premise', verifyToken, verifyAdmin, deletePremise)
router.get('/premise', verifyToken, getPremise)

router.post('/rack', verifyToken, verifyAdmin, createRack)
router.put('/rack', verifyToken, verifyAdmin, editRack)
router.delete('/rack', verifyToken, verifyAdmin, deleteRack)
router.get('/rack', verifyToken, getRack)


export default router
