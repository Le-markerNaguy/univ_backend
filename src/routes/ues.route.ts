import express from 'express' 
import { afficherUEs, creerUE, supprimerUE } from "../controllers/ues.controller";
import { authenticate, authorizeRoles } from "../middlewares/auth.middleware";

const router = express.Router()

router.post("/ues",authenticate, authorizeRoles('SUPER_ADMIN','ADMIN'), creerUE);
router.get("/ues", authenticate, authorizeRoles('SUPER_ADMIN','ADMIN'), afficherUEs);
router.delete("/ues/:id", authenticate, authorizeRoles('SUPER_ADMIN','ADMIN'), supprimerUE);
