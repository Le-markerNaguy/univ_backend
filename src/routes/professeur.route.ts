import express from 'express'
import {
 
  afficherProfesseurs,
  listerProfesseursParUniversite,
  voirProfilProfesseur,
  supprimerProfesseur,
  creerProfesseur,
  mettreAJourProfilProfesseur

} from '../controllers/professeur.controller'
import {
  ajouterNoteModule,
} from '../controllers/module.controller'
import {  authenticate, authorizeRoles } from '../middlewares/auth.middleware'

export const router = express.Router()
router.post('/notes', authenticate, authorizeRoles('professeur','ADMIN'), ajouterNoteModule)
router.post("/", authenticate, authorizeRoles('SUPER_ADMIN','ADMIN'), creerProfesseur);
router.get("/:professeurId/profil", voirProfilProfesseur);
router.get("/", authenticate, authorizeRoles('SUPER_ADMIN','ADMIN'), afficherProfesseurs);
router.get("/universites/:universiteId/professeurs", listerProfesseursParUniversite);
router.delete("/:id", authenticate, authorizeRoles('SUPER_ADMIN','ADMIN'), supprimerProfesseur);

router.patch("/:id", authenticate, authorizeRoles('SUPER_ADMIN','ADMIN'), mettreAJourProfilProfesseur);


export default router
