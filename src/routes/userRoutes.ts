import { Router }       from 'express'

import {
  verifyAdmin,
  verifyToken,
}                       from '../middleware/middle'
import changeUserStatus from '../controllers/usersControllers/changeUserStatus'
import createUser       from '../controllers/usersControllers/createUser'
import deleteUser       from '../controllers/usersControllers/deleteUser'
import editUser         from '../controllers/usersControllers/editUser'
import getUsers         from '../controllers/usersControllers/getUsers'
import getUsersCount    from '../controllers/usersControllers/getUsersCount'

const router = Router()

router.delete('/', verifyToken, verifyAdmin, deleteUser)
router.get('/', verifyToken, getUsers)
router.post('/', verifyToken, verifyAdmin, createUser)
router.put('/', verifyToken, editUser)
router.get('/count', verifyToken, getUsersCount)
router.post('/changeStatus', verifyToken, verifyAdmin, changeUserStatus)

export default router
