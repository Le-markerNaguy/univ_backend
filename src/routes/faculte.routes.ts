import express from 'express'
import {
  creerFaculte,
  getFacultes,
  updateFaculte,
  deleteFaculte,
} from '../controllers/faculte.controller'
import { authenticate, authorizeRoles } from "../middlewares/auth.middleware";

const router = express.Router()

router.post('/', authenticate ,authorizeRoles('SUPER_ADMIN','ADMIN'), creerFaculte)
router.get('/', authenticate , authorizeRoles('SUPER_ADMIN','ADMIN'), getFacultes)
router.patch('/:id', authenticate , authorizeRoles('SUPER_ADMIN','ADMIN'), updateFaculte)
router.delete('/:id', authenticate , authorizeRoles('SUPER_ADMIN','ADMIN'), deleteFaculte)

export default router
