import { Request, Response } from 'express'
import { prisma } from "../../lib/prisma"
import { generateCode } from '../utils/code'

/**
 * Créer une UE
 */
export const creerUE = async (req: Request, res: Response) => {
  try {
    const { intitule, semestreId } = req.body
    const semestreIdNum = Number(semestreId)

    if (!intitule || !semestreIdNum) {
      return res.status(400).json({ message: "Intitulé et semestre requis" })
    }

    const ueExist = await prisma.uE.findFirst({
      where: { intitule, semestreId: semestreIdNum },
    })

    if (ueExist) {
      return res.status(400).json({
        message: "Une UE avec cet intitulé existe déjà dans ce semestre",
      })
    }

    const code = generateCode("UE")

    const ue = await prisma.uE.create({
      data: {
        code,
        intitule,
        semestre: { connect: { id: semestreIdNum } },
      },
    })

    res.status(201).json(ue)
  } catch (error: any) {
    console.error("[creerUE] ERREUR:", error)
    res.status(500).json({ error: error.message || "Erreur lors de la création de l'UE" })
  }
}

/**
 * Afficher toutes les UEs
 */
export const afficherUEs = async (_: Request, res: Response) => {
  try {
    const ues = await prisma.uE.findMany()
    res.status(200).json(ues)
  } catch (error: any) {
    console.error("[afficherUEs] ERREUR:", error)
    res.status(500).json({ error: error.message || "Erreur lors de la récupération des UEs" })
  }
}

/**
 * Supprimer une UE
 */
export const supprimerUE = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const ueId = Number(id)

    if (isNaN(ueId)) {
      return res.status(400).json({ message: "ID d'UE requis" })
    }

    const ue = await prisma.uE.findUnique({
      where: { id: ueId },
    })

    if (!ue) {
      return res.status(404).json({ message: "UE non trouvée" })
    }

    await prisma.uE.delete({
      where: { id: ueId },
    })

    res.status(200).json({ message: "UE supprimée avec succès" })
  } catch (error: any) {
    console.error("[supprimerUE] ERREUR:", error)
    res.status(500).json({ error: error.message || "Erreur lors de la suppression de l'UE" })
  }
}
