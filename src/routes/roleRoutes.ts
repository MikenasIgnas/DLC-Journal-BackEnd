import { Router }       from 'express'
import { createRole }   from '../controllers/roleControllers/createRole'
import { disableRole }  from '../controllers/roleControllers/disableRole'
import { enableRole }   from '../controllers/roleControllers/enableRole'
import { getAllRoles }  from '../controllers/roleControllers/getAllRoles'
import { getRole }      from '../controllers/roleControllers/getRole'

const router = Router()

router.post("/create", createRole)
router.post("/disable", disableRole)
router.post("/enable", enableRole)
router.get("/getAll", getAllRoles)
router.get("/getRole", getRole)

export default router
