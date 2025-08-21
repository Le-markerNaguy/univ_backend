import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import { prisma } from '../prisma/client'
import { sendCodeByEmail } from '../utils/email'
import { generateCode } from '../utils/code'

/**
 * Créer un étudiant
 */
export const creerEtudiant = async (req: Request, res: Response) => {
  try {
    const { nom, email, motDePasse, niveauId, universiteId } = req.body

    const exist = await prisma.utilisateur.findUnique({ where: { email } })
    if (exist) return res.status(400).json({ message: 'Email déjà utilisé' })

    const hashedPassword = await bcrypt.hash(motDePasse, 10)
    const code = generateCode('ETU')

    const etudiant = await prisma.utilisateur.create({
      data: {
        nom,
        email,
        code,
        motDePasse: hashedPassword,
        role: 'ETUDIANT',
        niveauId,
        universiteId
      }
    })

    await sendCodeByEmail(email, nom, code, 'ETUDIANT')

    return res.status(201).json({
      message: 'Étudiant créé avec succès',
      etudiant: { id: etudiant.id, nom: etudiant.nom, email: etudiant.email, code: etudiant.code }
    })
  } catch (error) {
    console.error('[creerEtudiant]', error)
    return res.status(500).json({ message: 'Erreur serveur' })
  }
}

/**
 * Afficher tous les étudiants
 */
export const afficherEtudiants = async (_: Request, res: Response) => {
  try {
    const etudiants = await prisma.utilisateur.findMany({
      where: { role: 'ETUDIANT' },
      include: { niveau: true, universite: true }
    })
    res.status(200).json(etudiants)
  } catch (error: any) {
    console.error("[afficherEtudiants] ERREUR:", error)
    res.status(500).json({ error: error.message || "Erreur lors de la récupération des étudiants" })
  }
}
/**
 * Supprimer un étudiant
 */
export const supprimerEtudiant = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const etudiantId = id // ✅ UUID = string

    if (!etudiantId) {
      return res.status(400).json({ message: "ID d'étudiant requis" })
    }

    const etudiant = await prisma.utilisateur.findUnique({
      where: { id: etudiantId },
    })

    if (!etudiant || etudiant.role !== "ETUDIANT") {
      return res.status(404).json({ message: "Étudiant non trouvé" })
    }

    // ⚠️ Supprimer d’abord les notes de l’étudiant
    await prisma.note.deleteMany({
      where: { etudiantId: etudiantId },
    })

    // ⚠️ Supprimer aussi ses SemestreNotes (si utilisés)
    await prisma.semestreNote.deleteMany({
      where: { etudiantId: etudiantId },
    })

    // Ensuite supprimer l'étudiant
    await prisma.utilisateur.delete({
      where: { id: etudiantId },
    })

    res.status(200).json({ message: "Étudiant supprimé avec succès" })
  } catch (error: any) {
    console.error("[supprimerEtudiant] ERREUR:", error)
    res.status(500).json({
      error: error.message || "Erreur lors de la suppression de l'étudiant",
    })
  }
}

// ... (imports déjà présents au-dessus)

export const voirProfilEtudiant = async (req: Request, res: Response) => {
  const etudiantId = req.user?.id

  try {
    const etudiant = await prisma.utilisateur.findUnique({
      where: { id: etudiantId },
      include: { niveau: true }
    })

    if (!etudiant) return res.status(404).json({ error: 'Étudiant introuvable' })

    res.status(200).json({ profil: etudiant })
  } catch (error) {
    console.error('[voirProfilEtudiant] Erreur:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
}

// Voir les notes d'un étudiant
export const voirNotesEtudiant = async (req: Request, res: Response) => {
  const etudiantId = req.user?.id

  try {
    const modulesNotes = await prisma.note.findMany({
      where: { etudiantId },
      include: { module: true }
    })

    let totalCredits = 0
    let maxCredits = 0

    for (const note of modulesNotes) {
      maxCredits += note.module.credit || 0
      if (note.valeur >= 10) {
        totalCredits += note.module.credit || 0
      }
    }

    const creditsRestants = maxCredits - totalCredits

    res.status(200).json({
      modules: modulesNotes.map((n) => ({
        module: n.module.nom,
        note: n.valeur,
        credit: n.module.credit
      })),
      totalCredits,
      creditsRestants
    })
  } catch (error) {
    console.error('[voirNotesEtudiant] Erreur:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
}

// Mettre à jour le profil d'un étudiant
export const mettreAJourProfilEtudiant = async (req: Request, res: Response) => {
  const etudiantId = req.user?.id
  const { nom, email } = req.body

  try {
    const updatedEtudiant = await prisma.utilisateur.update({
      where: { id: etudiantId },
      data: { nom, email }
    })

    res.status(200).json({ message: 'Profil mis à jour', profil: updatedEtudiant })
  } catch (error) {
    console.error('[mettreAJourProfilEtudiant] Erreur:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
}
