import { Router }       from 'express'

import {
  verifyAdmin,
  verifyToken,
}                       from '../middleware/middle'
import createUser       from '../controllers/usersControllers/createUser'
import changeUserStatus from '../controllers/usersControllers/changeUserStatus'
import getUserById      from '../controllers/usersControllers/getById'
import getAllUsers      from '../controllers/usersControllers/getAllUsers'
import getAllUsersCount from '../controllers/usersControllers/getAllUsersCount'
import deleteUser       from '../controllers/usersControllers/deleteUser'
import editUser         from '../controllers/usersControllers/editUser'

const router = Router()

router.get("/delete", verifyToken, deleteUser)
router.get("/getAll", verifyToken, getAllUsers)
router.get("/getAll/count", verifyToken, getAllUsersCount)
router.get("/getbyid", verifyToken, getUserById)
router.post("/changeStatus", verifyToken, verifyAdmin, changeUserStatus)
router.post("/create", verifyToken, verifyAdmin, createUser)
router.post("/edit", verifyToken, verifyAdmin, editUser)

export default router
