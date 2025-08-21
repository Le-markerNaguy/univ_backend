import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "votre_clé_secrète";

export interface AuthRequest extends Request {
  user?: { id: string; role: string };
}

// Middleware pour authentification
export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  // Récupérer le token depuis le cookie
  let token = req.cookies?.["token"];

  // Si absent, essayer depuis le header Authorization
  if (!token && req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Token manquant ou invalide" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as { id: string; role?: string };

    // Toujours définir un rôle par défaut "user" si absent
    const role = (decoded.role ?? "user").toLowerCase();

    req.user = { id: decoded.id, role };
    next();
  } catch (error) {
    console.error("[authenticate] Erreur JWT:", error);
    return res.status(401).json({ message: "Token invalide ou expiré" });
  }
};

// Middleware pour autorisation par rôle
export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Utilisateur non authentifié" });
    }

    console.log("[DEBUG] rôle de l'utilisateur:", req.user.role);
    console.log("[DEBUG] rôles autorisés:", roles);

    // Comparer en minuscule pour éviter les problèmes de casse
    const allowedRoles = roles.map(r => r.toLowerCase());
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Accès refusé : rôle non autorisé" });
    }

    next();
  };
};
