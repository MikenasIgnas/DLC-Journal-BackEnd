import { Router }       from 'express'

import { verifyToken }  from '../middleware/middle'
import login            from '../controllers/authControllers/login'
import changePassword   from '../controllers/authControllers/changePassword'


const router = Router()

router.post("/changePassword", verifyToken, changePassword) //done
router.post("/login", login) //done

export default router
