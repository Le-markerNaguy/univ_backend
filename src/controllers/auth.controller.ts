import { Request, Response } from "express";
import { prisma } from "../prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

const formatUser = (utilisateur: any) => ({
  id: utilisateur.id,
  nom: utilisateur.nom ?? "",
  email: utilisateur.email ?? "",
  code: utilisateur.code ?? "",
  role: utilisateur.role ?? "user",
});

export const login = async (req: Request, res: Response) => {
  const { code, motDePasse, email } = req.body;

  try {
    if (!code && !email) {
      return res
        .status(400)
        .json({ message: "Veuillez fournir un code ou un email" });
    }

    // Recherche de l'utilisateur
    const utilisateur = await prisma.utilisateur.findFirst({
      where: {
        OR: [code ? { code } : {}, email ? { email } : {}],
      },
    });

    if (!utilisateur) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    if (!motDePasse) {
      return res.status(400).json({ message: "Mot de passe requis" });
    }

    if (!utilisateur.motDePasse) {
      return res
        .status(500)
        .json({ message: "Mot de passe non défini pour cet utilisateur" });
    }

    // Vérification du mot de passe
    const isValid = await bcrypt.compare(motDePasse, utilisateur.motDePasse);

    if (!isValid) {
      return res.status(401).json({ message: "Mot de passe incorrect" });
    }
    console.log("[DEBUG] Rôle envoyé dans le JWT:", utilisateur.role)

    // Création du token JWT
    const token = jwt.sign(
      { id: utilisateur.id, role: utilisateur.role, code: utilisateur.code },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Définir le cookie HTTP-only
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
    });

    return res.status(200).json({
      message: "Connexion réussie",
      user: formatUser(utilisateur),
    });
  } catch (error) {
    console.error("[login]", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

export const me = async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: "Non authentifié" });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      code: string;
      role: string;
    };

    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        nom: true,
        email: true,
        code: true,
        role: true,
      },
    });

    if (!utilisateur) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    return res.json({ user: formatUser(utilisateur) });
  } catch (error) {
    console.error("[me]", error);
    return res.status(401).json({ message: "Token invalide ou expiré" });
  }
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  return res.json({ message: "Déconnecté avec succès" });
};
