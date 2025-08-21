import express from 'express'
import {
  creerNiveau,
  getNiveaux,
  updateNiveau,
  deleteNiveau,
  getEtudiantsParNiveau,
} from '../controllers/niveau.controller'
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware'


const router = express.Router()

router.post('/', authenticate , authorizeRoles('SUPER_ADMIN','ADMIN') , creerNiveau)
router.get('/', authenticate , authorizeRoles('SUPER_ADMIN','ADMIN'), getNiveaux)
router.put('/:id', authenticate , authorizeRoles('SUPER_ADMIN','ADMIN'), updateNiveau)
router.delete('/:id', authenticate , authorizeRoles('SUPER_ADMIN','ADMIN'), deleteNiveau)
router.get('/etudiants/:niveauId', authenticate, authorizeRoles('professeur'),  getEtudiantsParNiveau)

export default router
