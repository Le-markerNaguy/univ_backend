// controllers/superAdmin.controller.ts
import { Request, Response } from 'express';
import { prisma } from "../../lib/prisma";
import bcrypt from 'bcrypt';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("La variable d'environnement JWT_SECRET est manquante");
}

// --------------------
// Créer une université
// --------------------
export const creerUniversite = async (req: Request, res: Response) => {
  const { nom } = req.body;

  if (!nom) {
    return res.status(400).json({ message: 'Le nom de l’université est requis' });
  }

  try {
    const universite = await prisma.universite.create({
      data: { nom },
    });

    return res.status(201).json(universite);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erreur lors de la création de l’université', error: err });
  }
};

// --------------------
// Créer un admin
// --------------------
export const creerAdmin = async (req: Request, res: Response) => {
  const { nom, email, universiteId ,motDePasse } = req.body;

  if (!nom || !email || !universiteId || !motDePasse) {
    return res.status(400).json({ message: 'Nom, email, université et mot de passe sont requis' });
  }

  try {
    const hashedPassword = await bcrypt.hash(motDePasse, 10);

    const admin = await prisma.utilisateur.create({
      data: {
        nom,
        email,
        motDePasse: hashedPassword,
        universiteId,
        role: 'ADMIN', // 👈 important si tu veux gérer les rôles
      },
    });

    return res.status(201).json({ message: 'Admin créé avec succès', admin });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erreur lors de la création de l’admin', error: err });
  }
};

// ----------------------
// Créer un Super Admin   
// ----------------------
export const postSuperAdmin = async (req: Request, res: Response) => {
  const { nom, email, motDePasse } = req.body;

  if (!nom || !email || !motDePasse) {
    return res.status(400).json({ message: 'Nom, email et mot de passe sont requis' });
  }

  try {
    const hashedPassword = await bcrypt.hash(motDePasse, 10);
    const superAdmin = await prisma.utilisateur.create({
      data: {
        nom,
        email,
        motDePasse: hashedPassword,
        role: 'SUPER_ADMIN',
      },
    });

    return res.status(201).json({ message: 'Super Admin créé avec succès', superAdmin });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erreur lors de la création du Super Admin', error: err });
  }
}

// ----------------------
// afficher les universités
// ----------------------
export const afficherUniversites = async (req: Request, res: Response) => {
  try {
    const universites = await prisma.universite.findMany();
    return res.status(200).json(universites);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erreur lors de la récupération des universités', error: err });
  }
};

// ----------------------
// afficher les admins  
// ----------------------
export const afficherAdmins = async (req: Request, res: Response) => {
  try {
    const admins = await prisma.utilisateur.findMany({
      where: { role: 'ADMIN' },
      include: { universite: true }, // Inclure les informations de l'université
    });
    return res.status(200).json(admins);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erreur lors de la récupération des admins', error: err });
  }
};