import { Router }               from 'express'

import {
  verifyAdmin,
  verifyToken,
}                               from '../middleware/middle'
import { upload }               from '../utility/uploadPhoto'
import createCompany            from '../controllers/companyControllers/createCompany'
import createCompanyEmplyee     from '../controllers/companyControllers/createCompanyEmplyee'
import createPermission         from '../controllers/companyControllers/createPermission'
import deleteCompany            from '../controllers/companyControllers/deleteCompany'
import deleteCompanyEmployee    from '../controllers/companyControllers/deleteCompanyEmployee'
import deleteDocument           from '../controllers/companyControllers/deleteCompanyDocument'
import deletePermission         from '../controllers/companyControllers/deletePermission'
import editCompany              from '../controllers/companyControllers/editCompany'
import editCompanyEmployee      from '../controllers/companyControllers/editCompanyEmployee'
import editPermission           from '../controllers/companyControllers/editPermission'
import getCompany               from '../controllers/companyControllers/getCompany'
import getCompanyCount          from '../controllers/companyControllers/getCompanyCount'
import getCompanyDocuments      from '../controllers/companyControllers/getCompanyDocuments'
import getCompanyEmployee       from '../controllers/companyControllers/getCompanyEmployee'
import getCompanyEmployeeCount  from '../controllers/companyControllers/getCompanyEmployeeCount'
import getDocumentFile          from '../controllers/companyControllers/getCompanyDocumentFile'
import getPermission            from '../controllers/companyControllers/getPermission'
import uploadDocument           from '../controllers/companyControllers/uploadCompanyDocument'



const router = Router()

router.post('/permission', verifyToken, verifyAdmin, createPermission)
router.put('/permission', verifyToken, verifyAdmin, editPermission)
router.delete('/permission', verifyToken, verifyAdmin, deletePermission)
router.get('/permission', verifyToken, getPermission)

router.post('/company', verifyToken, verifyAdmin, upload.single('photo'), createCompany)
router.put('/company', verifyToken, verifyAdmin, upload.single('photo'), editCompany)
router.delete('/company', verifyToken, verifyAdmin, deleteCompany)
router.get('/company', verifyToken, getCompany)
router.get('/company/count', verifyToken, getCompanyCount)


router.post('/document', verifyToken, verifyAdmin, upload.single('file'), uploadDocument)
router.get('/document', verifyToken, verifyAdmin, getCompanyDocuments)
router.get('/document/file', verifyToken, verifyAdmin, getDocumentFile)
router.delete('/document', verifyToken, verifyAdmin, deleteDocument)

router.post(
  '/companyEmployee',
  verifyToken,
  verifyAdmin,
  upload.single('photo'),
  createCompanyEmplyee
)
router.delete('/CompanyEmployee', verifyToken, verifyAdmin, deleteCompanyEmployee)
router.put('/CompanyEmployee', verifyToken, verifyAdmin,upload.single('photo'), editCompanyEmployee)
router.get('/CompanyEmployee', verifyToken, getCompanyEmployee)
router.get('/CompanyEmployee/count', verifyToken, getCompanyEmployeeCount)

export default router
