// routes/etudiant.route.ts
import express from 'express'
import { voirProfilEtudiant, voirNotesEtudiant, mettreAJourProfilEtudiant, creerEtudiant, supprimerEtudiant } from '../controllers/etudiant.controller'
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware'
import { afficherEtudiants } from '../controllers/etudiant.controller'

const router = express.Router()

router.get('/profil', authenticate, authorizeRoles('etudiant'), voirProfilEtudiant)
router.get('/notes', authenticate, authorizeRoles('etudiant'), voirNotesEtudiant)
router.get("/", authenticate, authorizeRoles('SUPER_ADMIN','ADMIN'), afficherEtudiants);

router.patch("/:id", authenticate, authorizeRoles('SUPER_ADMIN','ADMIN'), mettreAJourProfilEtudiant);

router.post("/", authenticate, authorizeRoles('SUPER_ADMIN','ADMIN'), creerEtudiant);

router.delete("/:id", authenticate, authorizeRoles('SUPER_ADMIN','ADMIN'), supprimerEtudiant);

export default router
