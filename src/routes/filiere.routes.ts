import express from 'express'
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware'
import {
  creerFiliere,
  getFilieres,
  updateFiliere,
  deleteFiliere,
} from '../controllers/filiere.controller'


const router = express.Router()

router.post('/', authenticate, authorizeRoles('SUPER_ADMIN','ADMIN'), creerFiliere)
router.get('/', authenticate, authorizeRoles('SUPER_ADMIN','ADMIN'), getFilieres)
router.put('/:id', authenticate, authorizeRoles('SUPER_ADMIN','ADMIN'), updateFiliere)
router.delete('/:id', authenticate, authorizeRoles('SUPER_ADMIN','ADMIN'), deleteFiliere)

export default router
