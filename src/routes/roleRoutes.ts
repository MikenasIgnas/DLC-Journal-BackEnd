import { Router }      from 'express'

import { createRole }  from '../controllers/roleControllers/createRole'
import { disableRole } from '../controllers/roleControllers/disableRole'
import { enableRole }  from '../controllers/roleControllers/enableRole'


const router = Router()

router.post("/create", createRole)
router.post("/disable", disableRole)
router.post("/enable", enableRole)

export default router
