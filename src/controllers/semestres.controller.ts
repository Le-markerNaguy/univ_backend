import { Request, Response } from 'express'
import { prisma } from "../../lib/prisma"

/**
 * Vérifie et calcule la note d’un semestre
 */
export const verifierEtCalculerNoteSemestre = async (etudiantId: string, semestreId: number) => {
  const ues = await prisma.uE.findMany({
    where: { semestreId }
  })
  const ueIds = ues.map(ue => ue.id)

  const moduleIds = (
    await prisma.module.findMany({ where: { ueId: { in: ueIds } } })
  ).map(m => m.id)

  const notesUE = await prisma.note.findMany({
    where: {
      etudiantId,
      moduleId: { in: moduleIds }
    }
  })

  if (notesUE.length !== moduleIds.length) {
    return // toutes les notes ne sont pas encore disponibles
  }

  const moyenne = notesUE.reduce((acc, n) => acc + n.valeur, 0) / notesUE.length

  await prisma.semestreNote.upsert({
    where: {
      etudiantId_semestreId: { etudiantId, semestreId }
    },
    update: { note: moyenne },
    create: { etudiantId, semestreId, note: moyenne }
  })
}

/**
 * Vérifie et calcule la note d’une UE
 */
const verifierEtCalculerNoteUE = async (etudiantId: string, ueId: number) => {
  const modules = await prisma.module.findMany({ where: { ueId } })
  const moduleIds = modules.map(m => m.id)

  const notes = await prisma.note.findMany({
    where: {
      etudiantId,
      moduleId: { in: moduleIds }
    }
  })

  if (notes.length !== moduleIds.length) {
    return
  }

  const moyenne = notes.reduce((acc, note) => acc + note.valeur, 0) / notes.length

  // Ici tu pourrais stocker la moyenne d’UE dans une table dédiée si besoin

  const ue = await prisma.uE.findUnique({ where: { id: ueId } })
  if (ue?.semestreId) {
    await verifierEtCalculerNoteSemestre(etudiantId, ue.semestreId)
  }
}

/**
 * Créer un semestre
 */
export const creerSemestre = async (req: Request, res: Response) => {
  try {
    const { nom, niveauId } = req.body
    const niveauIdNum = Number(niveauId)

    if (!nom || !niveauIdNum) {
      return res.status(400).json({ message: "Nom et niveau requis" })
    }

    const semestreExist = await prisma.semestre.findFirst({
      where: { nom, niveauId: niveauIdNum },
    })

    if (semestreExist) {
      return res.status(400).json({
        message: "Un semestre avec ce nom existe déjà dans ce niveau",
      })
    }

    const semestre = await prisma.semestre.create({
      data: {
        nom,
        niveau: { connect: { id: niveauIdNum } },
      },
    })

    res.status(201).json(semestre)
  } catch (error: any) {
    console.error("[creerSemestre] ERREUR:", error)
    res.status(500).json({ error: error.message || "Erreur lors de la création du semestre" })
  }
}

/**
 * Afficher les semestres
 */
export const afficherSemestres = async (_: Request, res: Response) => {
  try {
    const semestres = await prisma.semestre.findMany()
    res.status(200).json(semestres)
  } catch (error: any) {
    console.error("[afficherSemestres] ERREUR:", error)
    res.status(500).json({ error: error.message || "Erreur lors de la récupération des semestres" })
  }
}

/**
 * Supprimer un semestre
 */
export const supprimerSemestre = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const semestreId = Number(id)

    if (!semestreId) {
      return res.status(400).json({ message: "ID de semestre requis" })
    }

    const semestre = await prisma.semestre.findUnique({
      where: { id: semestreId },
    })

    if (!semestre) {
      return res.status(404).json({ message: "Semestre non trouvé" })
    }

    await prisma.semestre.delete({
      where: { id: semestreId },
    })

    res.status(200).json({ message: "Semestre supprimé avec succès" })
  } catch (error: any) {
    console.error("[supprimerSemestre] ERREUR:", error)
    res.status(500).json({ error: error.message || "Erreur lors de la suppression du semestre" })
  }
}
