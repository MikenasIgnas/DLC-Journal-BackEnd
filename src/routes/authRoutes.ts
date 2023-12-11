import { Router }       from 'express'

import { verifyToken }  from '../middleware/middle'
import login            from '../controllers/authControllers/login'
import changePassword   from '../controllers/authControllers/changePassword'


const router = Router()

router.post("/changePassword", verifyToken, changePassword)
router.post("/login", login)

export default router
