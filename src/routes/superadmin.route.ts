import express from 'express';
import { authorizeRoles , authenticate } from '../middlewares/auth.middleware';
import { creerUniversite, creerAdmin, postSuperAdmin , afficherUniversites , afficherAdmins} from '../controllers/superAdmin.controller';

const router = express.Router();

router.post('/', postSuperAdmin);

// Toutes les routes suivantes sont protégées par le rôle SUPER_ADMIN
router.post('/universites', authenticate , authorizeRoles('SUPER_ADMIN'), creerUniversite);
router.post('/admins', authenticate , authorizeRoles('SUPER_ADMIN'), creerAdmin);
router.get('/universites', authenticate , authorizeRoles('SUPER_ADMIN'), afficherUniversites);
router.get('/admins', authenticate , authorizeRoles('SUPER_ADMIN'), afficherAdmins);

export default router;
