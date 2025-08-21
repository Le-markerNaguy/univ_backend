import { Request, Response } from 'express'
import { prisma } from '../prisma/client'

// ➤ Créer un niveau
export const creerNiveau = async (req: Request, res: Response) => {
  try {
    const { nom, filiereId } = req.body

    const niveau = await prisma.niveau.create({
      data: { nom, filiereId },
    })

    res.status(201).json({ message: 'Niveau créé', niveau })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Erreur lors de la création du niveau' })
  }
}

// ➤ Lire tous les niveaux
export const getNiveaux = async (_req: Request, res: Response) => {
  const niveaux = await prisma.niveau.findMany() // Remove invalid include
  res.json(niveaux)
}

// ➤ Modifier un niveau
export const updateNiveau = async (req: Request, res: Response) => {
  const { id } = req.params
  const { nom } = req.body

  const niveau = await prisma.niveau.update({
    where: { id: parseInt(id) },
    data: { nom },
  })

  res.json({ message: 'Niveau mis à jour', niveau })
}

// ➤ Supprimer un niveau
export const deleteNiveau = async (req: Request, res: Response) => {
  const { id } = req.params

  await prisma.niveau.delete({ where: { id: parseInt(id) } })

  res.json({ message: 'Niveau supprimé' })
}

/**
 * Récupérer les étudiants d'un niveau
 */
export const getEtudiantsParNiveau = async (req: Request, res: Response) => {
  try {
    const { niveauId } = req.params;
    const niveauIdNum = Number(niveauId);

    if (isNaN(niveauIdNum)) {
      return res.status(400).json({ message: "niveauId invalide" });
    }

    const niveau = await prisma.niveau.findUnique({
      where: { id: niveauIdNum },
      include: {
        filiere: { include: { faculte: true } }, // infos hiérarchie
        etudiants: {
          where: { role: "ETUDIANT" }, // uniquement les étudiants
          select: {
            id: true,
            nom: true,
            email: true,
            code: true,
            createdAt: true,
          },
        },
      },
    });

    if (!niveau) {
      return res.status(404).json({ message: "Niveau introuvable" });
    }

    res.status(200).json({
      niveau: {
        id: niveau.id,
        nom: niveau.nom,
        filiere: niveau.filiere.nom,
        faculte: niveau.filiere.faculte.nom,
      },
      etudiants: niveau.etudiants,
    });
  } catch (error: any) {
    console.error("[getEtudiantsParNiveau] ERREUR:", error);
    res.status(500).json({
      error: error.message || "Erreur lors de la récupération des étudiants par niveau",
    });
  }
};