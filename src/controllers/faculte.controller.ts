import { Request, Response } from 'express'
import { prisma } from "../../lib/prisma"
// ➤ Créer une faculté
export const creerFaculte = async (req: Request, res: Response) => {
  try {
    const { nom, universiteId } = req.body;

    if (!nom || !universiteId) {
      return res.status(400).json({ message: "Nom et université requis" });
    }

    // Vérifier si la faculté existe déjà dans cette université
    const faculteExistante = await prisma.faculte.findFirst({
      where: {
        nom: nom,
        universiteId: universiteId,
      },
    });

    if (faculteExistante) {
      return res
        .status(400)
        .json({ message: "Cette faculté existe déjà dans cette université" });
    }

    // Création si elle n'existe pas
    const faculte = await prisma.faculte.create({
      data: { nom, universiteId },
    });

    return res.status(201).json({ message: "Faculté créée", faculte });
  } catch (error) {
    console.error("[creerFaculte]", error);
    return res.status(500).json({ message: "Erreur lors de la création" });
  }
};


// ➤ Obtenir toutes les facultés
export const getFacultes = async (_req: Request, res: Response) => {
  const facultes = await prisma.faculte.findMany({
    include: { filieres: true },
  })
  res.json(facultes)
}

// ➤ Mettre à jour une faculté
export const updateFaculte = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nom } = req.body;

    if (!nom) {
      return res.status(400).json({ message: "Le nom est requis" });
    }

    // Récupérer la faculté pour avoir son universitéId
    const faculteExistante = await prisma.faculte.findUnique({
      where: { id: parseInt(id) },
    });

    if (!faculteExistante) {
      return res.status(404).json({ message: "Faculté introuvable" });
    }

    // Vérifier si une autre faculté de la même université a déjà ce nom
    const doublon = await prisma.faculte.findFirst({
      where: {
        nom: nom,
        universiteId: faculteExistante.universiteId,
        NOT: { id: faculteExistante.id },
      },
    });

    if (doublon) {
      return res
        .status(400)
        .json({ message: "Une faculté avec ce nom existe déjà dans cette université" });
    }

    // Mise à jour
    const faculte = await prisma.faculte.update({
      where: { id: faculteExistante.id },
      data: { nom },
    });

    return res.json({ message: "Faculté mise à jour", faculte });
  } catch (error) {
    console.error("[updateFaculte]", error);
    return res.status(500).json({ message: "Erreur lors de la mise à jour" });
  }
};


// ➤ Supprimer une faculté
export const deleteFaculte = async (req: Request, res: Response) => {
  const { id } = req.params

  await prisma.faculte.delete({ where: { id: parseInt(id) } })

  res.json({ message: 'Faculté supprimée' })
}
