import { Router }           from 'express'

import { verifyToken }      from '../middleware/middle'
import changePassword       from '../controllers/authControllers/changePassword'
import confirmRecoveryCode  from '../controllers/authControllers/confirmRecoveryCode'
import login                from '../controllers/authControllers/login'
import resetPassword        from '../controllers/authControllers/resetPassword'
import sendRecoveryCode     from '../controllers/authControllers/sendRecoveryCode'

const router = Router()

router.post('/changePassword', verifyToken, changePassword)
router.post('/confirmRecoveryCode', verifyToken, confirmRecoveryCode)
router.post('/login', login)
router.post('/resetPassword', verifyToken, resetPassword)
router.post('/sendRecoveryCode', sendRecoveryCode)

export default router
