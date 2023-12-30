import { Router }       from 'express'

import { verifyToken }  from '../middleware/middle'
import changePassword   from '../controllers/authControllers/changePassword'
import login            from '../controllers/authControllers/login'


const router = Router()

router.post('/changePassword', verifyToken, changePassword)
router.post('/login', login)

export default router
