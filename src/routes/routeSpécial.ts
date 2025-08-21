import express from "express";
import { authenticate, authorizeRoles } from "../middlewares/auth.middleware";

// ==========================
// Controllers
// ==========================
import { login, me, logout } from "../controllers/auth.controller";

import {
  voirProfilEtudiant,
  voirNotesEtudiant,
  mettreAJourProfilEtudiant,
  creerEtudiant,
  supprimerEtudiant,
  afficherEtudiants,
} from "../controllers/etudiant.controller";

import {
  afficherProfesseurs,
  listerProfesseursParUniversite,
  voirProfilProfesseur,
  supprimerProfesseur,
  creerProfesseur,
  mettreAJourProfilProfesseur,
  mettreAJourModulesProfesseur,
} from "../controllers/professeur.controller";

import {
  creerFaculte,
  getFacultes,
  updateFaculte,
  deleteFaculte,
} from "../controllers/faculte.controller";

import {
  creerFiliere,
  getFilieres,
  updateFiliere,
  deleteFiliere,
} from "../controllers/filiere.controller";

import {
  afficherModules,
  createModule,
  updateModule,
  deleteModule,
  ajouterNoteModule,
} from "../controllers/module.controller";

import {
  creerNiveau,
  getNiveaux,
  updateNiveau,
  deleteNiveau,
  getEtudiantsParNiveau,
} from "../controllers/niveau.controller";

import {
  afficherSemestres,
  creerSemestre,
  supprimerSemestre,
} from "../controllers/semestres.controller";

import {
  creerUniversite,
  creerAdmin,
  postSuperAdmin,
  afficherUniversites,
  afficherAdmins,
} from "../controllers/superAdmin.controller";

import {
  afficherUEs,
  creerUE,
  supprimerUE,
} from "../controllers/ues.controller";

// ==========================
// Router principal
// ==========================
const router = express.Router();

/* ==========================
   🔑 AUTH
========================== */
router.post("/auth/login", login);
router.get("/auth/me", me);
router.post("/auth/logout", logout);

/* ==========================
   🎓 ETUDIANTS
========================== */
router.get("/etudiants/profil", authenticate, authorizeRoles("etudiant"), voirProfilEtudiant);
router.get("/etudiants/notes", authenticate, authorizeRoles("etudiant"), voirNotesEtudiant);
router.get("/etudiants", authenticate, authorizeRoles("SUPER_ADMIN","ADMIN"), afficherEtudiants);
router.post("/etudiants", authenticate, authorizeRoles("SUPER_ADMIN","ADMIN"), creerEtudiant);
router.patch("/etudiants/:id", authenticate, authorizeRoles("SUPER_ADMIN","ADMIN"), mettreAJourProfilEtudiant);
router.delete("/etudiants/:id", authenticate, authorizeRoles("SUPER_ADMIN","ADMIN"), supprimerEtudiant);

/* ==========================
   👨‍🏫 PROFESSEURS
========================== */
router.post("/professeurs/notes", authenticate, authorizeRoles("professeur","ADMIN"), ajouterNoteModule);
router.post("/professeurs", authenticate, authorizeRoles("SUPER_ADMIN","ADMIN"), creerProfesseur);
router.get("/professeurs/:professeurId/profil", voirProfilProfesseur);
router.get("/professeurs", authenticate, authorizeRoles("SUPER_ADMIN","ADMIN"), afficherProfesseurs);
router.get("/universites/:universiteId/professeurs", listerProfesseursParUniversite);
router.patch("/professeurs/:id", authenticate, authorizeRoles("SUPER_ADMIN","ADMIN"), mettreAJourProfilProfesseur);
router.patch("/professeurs/:id/modules", authenticate, authorizeRoles("SUPER_ADMIN","ADMIN"), mettreAJourModulesProfesseur);
router.delete("/professeurs/:id", authenticate, authorizeRoles("SUPER_ADMIN","ADMIN"), supprimerProfesseur);

/* ==========================
   🏫 FACULTÉS
========================== */
router.post("/facultes", authenticate, authorizeRoles("SUPER_ADMIN","ADMIN"), creerFaculte);
router.get("/facultes", authenticate, authorizeRoles("SUPER_ADMIN","ADMIN"), getFacultes);
router.patch("/facultes/:id", authenticate, authorizeRoles("SUPER_ADMIN","ADMIN"), updateFaculte);
router.delete("/facultes/:id", authenticate, authorizeRoles("SUPER_ADMIN","ADMIN"), deleteFaculte);

/* ==========================
   📚 FILIÈRES
========================== */
router.post("/filieres", authenticate, authorizeRoles("SUPER_ADMIN","ADMIN"), creerFiliere);
router.get("/filieres", authenticate, authorizeRoles("SUPER_ADMIN","ADMIN"), getFilieres);
router.put("/filieres/:id", authenticate, authorizeRoles("SUPER_ADMIN","ADMIN"), updateFiliere);
router.delete("/filieres/:id", authenticate, authorizeRoles("SUPER_ADMIN","ADMIN"), deleteFiliere);

/* ==========================
   📖 MODULES
========================== */
router.post("/modules", authenticate, authorizeRoles("SUPER_ADMIN","ADMIN"), createModule);
router.get("/modules", authenticate, authorizeRoles("SUPER_ADMIN","ADMIN"), afficherModules);
router.put("/modules/:id", authenticate, authorizeRoles("SUPER_ADMIN","ADMIN"), updateModule);
router.delete("/modules/:id", authenticate, authorizeRoles("SUPER_ADMIN","ADMIN"), deleteModule);
router.post("/modules/notes", authenticate, authorizeRoles("SUPER_ADMIN","ADMIN"), ajouterNoteModule);

/* ==========================
   📈 NIVEAUX
========================== */
router.post("/niveaux", authenticate, authorizeRoles("SUPER_ADMIN","ADMIN"), creerNiveau);
router.get("/niveaux", authenticate, authorizeRoles("SUPER_ADMIN","ADMIN"), getNiveaux);
router.put("/niveaux/:id", authenticate, authorizeRoles("SUPER_ADMIN","ADMIN"), updateNiveau);
router.delete("/niveaux/:id", authenticate, authorizeRoles("SUPER_ADMIN","ADMIN"), deleteNiveau);
router.get("/niveaux/:niveauId/etudiants", authenticate, authorizeRoles("professeur"), getEtudiantsParNiveau);

/* ==========================
   🗓 SEMESTRES
========================== */
router.post("/semestres", authenticate, authorizeRoles("SUPER_ADMIN","ADMIN"), creerSemestre);
router.get("/semestres", authenticate, authorizeRoles("SUPER_ADMIN","ADMIN"), afficherSemestres);
router.delete("/semestres/:id", authenticate, authorizeRoles("SUPER_ADMIN","ADMIN"), supprimerSemestre);

/* ==========================
   🛡 SUPER ADMIN
========================== */
router.post("/super-admin", postSuperAdmin);
router.post("/super-admin/universites", authenticate, authorizeRoles("SUPER_ADMIN"), creerUniversite);
router.post("/super-admin/admins", authenticate, authorizeRoles("SUPER_ADMIN"), creerAdmin);
router.get("/super-admin/universites", authenticate, authorizeRoles("SUPER_ADMIN"), afficherUniversites);
router.get("/super-admin/admins", authenticate, authorizeRoles("SUPER_ADMIN"), afficherAdmins);

/* ==========================
   📘 UNITÉS D’ENSEIGNEMENT
========================== */
router.post("/ues", authenticate, authorizeRoles("SUPER_ADMIN","ADMIN"), creerUE);
router.get("/ues", authenticate, authorizeRoles("SUPER_ADMIN","ADMIN"), afficherUEs);
router.delete("/ues/:id", authenticate, authorizeRoles("SUPER_ADMIN","ADMIN"), supprimerUE);

export default router;
