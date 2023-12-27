import { Router }       from 'express'
import { createRole }   from '../controllers/roleControllers/createRole'
import { disableRole }  from '../controllers/roleControllers/disableRole'
import { enableRole }   from '../controllers/roleControllers/enableRole'
import { getAllRoles }  from '../controllers/roleControllers/getAllRoles'
import { getRole }      from '../controllers/roleControllers/getRole'

const router = Router()

router.post("/create", createRole) //done
router.post("/disable", disableRole)
router.post("/enable", enableRole)
router.get("/getAll", getAllRoles) //done
router.get("/getRole", getRole) //done

export default router
