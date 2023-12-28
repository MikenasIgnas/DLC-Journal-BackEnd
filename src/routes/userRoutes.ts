import { Router }       from 'express'

import {
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
router.post("/changeStatus", verifyToken, changeUserStatus)
router.post("/create", verifyToken, createUser)
router.post("/edit", verifyToken, editUser)

export default router
