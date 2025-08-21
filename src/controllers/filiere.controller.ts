import { Request, Response } from 'express'
import { prisma } from '../prisma/client'

// ➤ Créer une filière
export const creerFiliere = async (req: Request, res: Response) => {
  try {
    const { nom, faculteId } = req.body

    const filiere = await prisma.filiere.create({
      data: { nom, faculteId },
    })

    res.status(201).json({ message: 'Filière créée', filiere })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Erreur lors de la création de la filière' })
  }
}

// ➤ Lire toutes les filières
export const getFilieres = async (_req: Request, res: Response) => {
  const filieres = await prisma.filiere.findMany({ include: { niveaux: true } })
  res.json(filieres)
}

// ➤ Modifier une filière
export const updateFiliere = async (req: Request, res: Response) => {
  const { id } = req.params
  const { nom } = req.body

  const filiere = await prisma.filiere.update({
    where: { id: parseInt(id) },
    data: { nom },
  })

  res.json({ message: 'Filière mise à jour', filiere })
}

// ➤ Supprimer une filière
export const deleteFiliere = async (req: Request, res: Response) => {
  const { id } = req.params

  await prisma.filiere.delete({ where: { id: parseInt(id) } })

  res.json({ message: 'Filière supprimée' })
}
