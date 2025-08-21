import { Request, Response } from 'express'
import { prisma } from '../prisma/client'
import { verifierEtCalculerNoteUE } from '../utils/notes'

/**
 * Ajouter une note à un module
 */
export const ajouterNoteModule = async (req: Request, res: Response) => {
  try {
    const { etudiantId, moduleId, note } = req.body
    const moduleIdNum = Number(moduleId)

    if (!etudiantId || !moduleIdNum || note === undefined) {
      return res.status(400).json({ message: "Étudiant, module et note requis" })
    }

    const moduleNote = await prisma.note.upsert({
      where: {
        etudiantId_moduleId: {
          etudiantId,
          moduleId: moduleIdNum,
        },
      },
      update: { valeur: note },
      create: {
        etudiantId,
        moduleId: moduleIdNum,
        valeur: note,
      },
    })

    const module = await prisma.module.findUnique({
      where: { id: moduleIdNum },
    })

    if (module?.ueId) {
      await verifierEtCalculerNoteUE(etudiantId, module.ueId)
    }

    res.status(200).json({ message: "Note enregistrée", moduleNote })
  } catch (error: any) {
    console.error("[ajouterNoteModule] ERREUR:", error)
    res.status(500).json({ error: error.message || "Erreur lors de l'enregistrement de la note" })
  }
}

/**
 * Afficher tous les modules
 */
export const afficherModules = async (_: Request, res: Response) => {
  try {
    const modules = await prisma.module.findMany({
      include: {
        niveau: true,
        ue: true,
        professeurs: true,
      },
    })
    res.status(200).json(modules)
  } catch (error: any) {
    console.error("[afficherModules] ERREUR:", error)
    res.status(500).json({ error: error.message || "Erreur lors de la récupération des modules" })
  }
}

/**
 * Créer un module
 */
export const createModule = async (req: Request, res: Response) => {
  try {
    const { nom, niveauId, credit, ueId } = req.body

    if (!nom || !niveauId || !credit || !ueId) {
      return res.status(400).json({ message: "Nom, niveau, crédit et UE sont requis" })
    }

    const module = await prisma.module.create({
      data: { nom, niveauId: Number(niveauId), credit: Number(credit), ueId: Number(ueId) },
    })

    res.status(201).json({ message: "Module créé avec succès", module })
  } catch (error: any) {
    console.error("[createModule] ERREUR:", error)
    res.status(500).json({ error: error.message || "Erreur lors de la création du module" })
  }
}

/**
 * Récupérer un module par ID
 */
export const getModuleById = async (req: Request, res: Response) => {
  try {
    const moduleId = Number(req.params.id)

    if (isNaN(moduleId)) {
      return res.status(400).json({ message: "ID invalide" })
    }

    const module = await prisma.module.findUnique({
      where: { id: moduleId },
      include: { niveau: true, ue: true, professeurs: true },
    })

    if (!module) {
      return res.status(404).json({ message: "Module non trouvé" })
    }

    res.status(200).json(module)
  } catch (error: any) {
    console.error("[getModuleById] ERREUR:", error)
    res.status(500).json({ error: error.message || "Erreur lors de la récupération du module" })
  }
}

/**
 * Mettre à jour un module
 */
export const updateModule = async (req: Request, res: Response) => {
  try {
    const moduleId = Number(req.params.id)
    const { nom, niveauId, credit, ueId } = req.body

    if (isNaN(moduleId)) {
      return res.status(400).json({ message: "ID invalide" })
    }

    const updatedModule = await prisma.module.update({
      where: { id: moduleId },
      data: {
        ...(nom && { nom }),
        ...(niveauId && { niveauId: Number(niveauId) }),
        ...(credit && { credit: Number(credit) }),
        ...(ueId && { ueId: Number(ueId) }),
      },
    })

    res.status(200).json({ message: "Module mis à jour avec succès", module: updatedModule })
  } catch (error: any) {
    console.error("[updateModule] ERREUR:", error)
    res.status(500).json({ error: error.message || "Erreur lors de la mise à jour du module" })
  }
}

/**
 * Supprimer un module
 */
export const deleteModule = async (req: Request, res: Response) => {
  try {
    const moduleId = Number(req.params.id)

    if (isNaN(moduleId)) {
      return res.status(400).json({ message: "ID invalide" })
    }

    await prisma.module.delete({ where: { id: moduleId } })

    res.status(200).json({ message: "Module supprimé avec succès" })
  } catch (error: any) {
    console.error("[deleteModule] ERREUR:", error)
    res.status(500).json({ error: error.message || "Erreur lors de la suppression du module" })
  }
}
