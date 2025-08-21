import express from 'express'
import {
  afficherModules ,
  createModule,
  updateModule,
  deleteModule,
  ajouterNoteModule,
} from '../controllers/module.controller'
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware'
import { mettreAJourModulesProfesseur } from '../controllers/professeur.controller'

const router = express.Router()

router.post('/', authenticate , authorizeRoles('SUPER_ADMIN','ADMIN') , createModule)
router.get('/', authenticate , authorizeRoles('SUPER_ADMIN','ADMIN') , afficherModules)
router.put('/:id', authenticate , authorizeRoles('SUPER_ADMIN','ADMIN') , updateModule)
router.delete('/:id', authenticate , authorizeRoles('SUPER_ADMIN','ADMIN') , deleteModule)
router.post("/notes/modules",authenticate, authorizeRoles('SUPER_ADMIN','ADMIN'), ajouterNoteModule);
router.get("/modules", authenticate, authorizeRoles('SUPER_ADMIN','ADMIN'), afficherModules);
router.patch("/professeurs/:id/modules", authenticate, authorizeRoles('SUPER_ADMIN','ADMIN'), mettreAJourModulesProfesseur);

export default router
