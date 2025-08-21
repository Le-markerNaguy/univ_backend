import { Router } from "express";
import { afficherSemestres, creerSemestre, supprimerSemestre } from "../controllers/semestres.controller";
import { authenticate, authorizeRoles } from "../middlewares/auth.middleware";

const router = Router()


router.post("/semestres", authenticate , authorizeRoles('SUPER_ADMIN','ADMIN'), creerSemestre);
router.get("/semestres", authenticate, authorizeRoles('SUPER_ADMIN','ADMIN'), afficherSemestres);
router.delete("/semestres/:id", authenticate, authorizeRoles('SUPER_ADMIN','ADMIN'), supprimerSemestre);
