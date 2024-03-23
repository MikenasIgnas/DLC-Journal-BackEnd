import { Router }           from 'express'

import { verifyToken }      from '../middleware/middle'
import changePassword       from '../controllers/authControllers/changePassword'
import login                from '../controllers/authControllers/login'
import resetPassword        from '../controllers/authControllers/resetPassword'
import sendPasswordRecovery from '../controllers/authControllers/sendPasswordRecovery'

const router = Router()

router.post('/changePassword', verifyToken, changePassword)
router.post('/login', login)
router.post('/resetPassword', resetPassword)
router.post('/sendPasswordRecovery', sendPasswordRecovery)

export default router
