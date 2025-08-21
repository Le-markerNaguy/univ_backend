import e, { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import { prisma } from "../../lib/prisma"
import { sendCodeByEmail } from '../utils/email'

/**
 * Générer un code unique
 */
const generateCode = (prefix: string): string => {
  const random = Math.floor(100000 + Math.random() * 900000)
  return `${prefix}${random}`
}
/**
 * Créer un professeur
 */
export const creerProfesseur = async (req: Request, res: Response) => {
  try {
    const { nom, email, motDePasse, universiteId, modulesIds } = req.body

    const exist = await prisma.utilisateur.findUnique({ where: { email } })
    if (exist) return res.status(400).json({ message: 'Email déjà utilisé' })

    const hashedPassword = await bcrypt.hash(motDePasse, 10)
    const code = generateCode('PROF')

    const professeur = await prisma.utilisateur.create({
      data: {
        nom,
        email,
        code,
        motDePasse: hashedPassword,
        role: 'PROFESSEUR',
        universiteId,
        modules: {
          connect: modulesIds?.map((id: number) => ({ id }))
        }
      },
      include: {
        modules: {
          include: { niveau: true }
        }
      }
    })

    await sendCodeByEmail(email, nom, code, 'PROFESSEUR')

    return res.status(201).json({
      message: 'Professeur créé avec succès',
      professeur: {
        id: professeur.id,
        nom: professeur.nom,
        email: professeur.email,
        code: professeur.code,
        modules: professeur.modules.map(m => ({
          id: m.id,
          nom: m.nom,
          niveau: { id: m.niveau.id, nom: m.niveau.nom }
        }))
      }
    })
  } catch (error) {
    console.error('[creerProfesseur]', error)
    return res.status(500).json({ message: 'Erreur serveur' })
  }
}

/**
 * Afficher les professeurs
 */
export const afficherProfesseurs = async (_: Request, res: Response) => {
  try {
    const professeurs = await prisma.utilisateur.findMany({
      where: { role: 'PROFESSEUR' },
      include: { niveau: true, universite: true }
    })
    res.status(200).json(professeurs)
  } catch (error: any) {
    console.error("[afficherProfesseurs] ERREUR:", error)
    res.status(500).json({ error: error.message || "Erreur lors de la récupération des professeurs" })
  }
}

/**
 * Mettre à jour les modules d’un professeur
 */
export const mettreAJourModulesProfesseur = async (req: Request, res: Response) => {
  const { professeurId, modulesIds } = req.body;

  try {
    const professeur = await prisma.utilisateur.findUnique({
      where: { id: professeurId },
      include: { modules: true }
    });

    if (!professeur || professeur.role !== 'PROFESSEUR') {
      return res.status(404).json({ error: 'Professeur introuvable' });
    }

    await prisma.utilisateur.update({
      where: { id: professeurId },
      data: {
        modules: {
          set: modulesIds.map((id: number) => ({ id }))
        }
      }
    });

    return res.status(200).json({
      message: 'Modules du professeur mis à jour avec succès',
      professeur: {
        id: professeur.id,
        nom: professeur.nom,
        email: professeur.email,
        modules: modulesIds.map((id: number) => ({ id }))
      }
    });
  } catch (error) {
    console.error('[mettreAJourModulesProfesseur]', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
/**
 * Supprimer un professeur sans supprimer les modules
 * (on garde les modules mais on enlève le lien avec le prof)
 */
export const supprimerProfesseur = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const professeurId = String(id) // UUID

    if (!professeurId) {
      return res.status(400).json({ message: "ID de professeur requis" })
    }

    const professeur = await prisma.utilisateur.findUnique({
      where: { id: professeurId },
      include: { modules: true },
    })

    if (!professeur || professeur.role !== "PROFESSEUR") {
      return res.status(404).json({ message: "Professeur non trouvé" })
    }

    // Étape 1 : détacher le professeur de tous ses modules
    await prisma.utilisateur.update({
      where: { id: professeurId },
      data: { modules: { set: [] } }, // supprime les liens dans ProfesseurModule
    })

    // Étape 2 : supprimer le professeur
    await prisma.utilisateur.delete({
      where: { id: professeurId },
    })

    res.status(200).json({
      message: "Professeur supprimé avec succès (modules conservés)",
    })
  } catch (error: any) {
    console.error("[supprimerProfesseur] ERREUR:", error)
    res.status(500).json({
      error: error.message || "Erreur lors de la suppression du professeur",
    })
  }
}

/**
 * Mettre à jour profil professeur
 */
export const mettreAJourProfilProfesseur = async (req: Request, res: Response) => {
  const { id } = req.params
  const { nom, email, modulesIds } = req.body

  try {
    const professeur = await prisma.utilisateur.findUnique({
      where: { id: String(id) },
      include: { modules: true }
    })

    if (!professeur || professeur.role !== 'PROFESSEUR') {
      return res.status(404).json({ error: 'Professeur introuvable' })
    }

    const updatedProfesseur = await prisma.utilisateur.update({
      where: { id: String(id) },
      data: {
        nom,
        email,
        modules: {
          set: modulesIds.map((moduleId: string) => ({ id: moduleId }))
        }
      }
    })

    return res.status(200).json({
      message: 'Profil professeur mis à jour avec succès',
      professeur: {
        id: updatedProfesseur.id,
        nom: updatedProfesseur.nom,
        email: updatedProfesseur.email,
        modules: updatedProfesseur.modules.map(m => ({ id: m.id, nom: m.nom }))
      }
    })
  } catch (error) {
    console.error('[mettreAJourProfilProfesseur]', error)
    return res.status(500).json({ error: 'Erreur serveur' })
  }
}

/**
 * Voir le profil profes
 */


/**
 * Voir le profil d'un professeur
 */
export const voirProfilProfesseur = async (req: Request, res: Response) => {
  try {
    const { professeurId } = req.params;

    const professeur = await prisma.utilisateur.findUnique({
      where: { id: professeurId },
      include: {
        universite: true,
        modules: {
          include: {
            niveau: {
              include: {
                filiere: {
                  include: {
                    faculte: true,
                  },
                },
              },
            },
            ue: true,
          },
        },
      },
    });

    if (!professeur || professeur.role !== "PROFESSEUR") {
      return res.status(404).json({ message: "Professeur introuvable" });
    }

    res.status(200).json({
      id: professeur.id,
      nom: professeur.nom,
      email: professeur.email,
      code: professeur.code,
      universite: professeur.universite?.nom || null,
      modules: professeur.modules.map((m) => ({
        id: m.id,
        nom: m.nom,
        credit: m.credit,
        ue: { id: m.ue.id, code: m.ue.code, intitule: m.ue.intitule },
        niveau: {
          id: m.niveau.id,
          nom: m.niveau.nom,
          filiere: m.niveau.filiere.nom,
          faculte: m.niveau.filiere.faculte.nom,
        },
      })),
      createdAt: professeur.createdAt,
    });
  } catch (error: any) {
    console.error("[voirProfilProfesseur] ERREUR:", error);
    res.status(500).json({ error: error.message || "Erreur serveur" });
  }
};


/**
 * Voir tous les professeurs d'une université
 */
export const listerProfesseursParUniversite = async (req: Request, res: Response) => {
  try {
    const { universiteId } = req.params;
    const universiteIdNum = Number(universiteId);

    if (isNaN(universiteIdNum)) {
      return res.status(400).json({ message: "universiteId invalide" });
    }

    const professeurs = await prisma.utilisateur.findMany({
      where: {
        universiteId: universiteIdNum,
        role: "PROFESSEUR",
      },
      include: {
        modules: {
          include: {
            niveau: {
              include: {
                filiere: {
                  include: {
                    faculte: true,
                  },
                },
              },
            },
            ue: true,
          },
        },
      },
    });

    res.status(200).json(
      professeurs.map((prof) => ({
        id: prof.id,
        nom: prof.nom,
        email: prof.email,
        code: prof.code,
        modules: prof.modules.map((m) => ({
          id: m.id,
          nom: m.nom,
          credit: m.credit,
          ue: { id: m.ue.id, code: m.ue.code, intitule: m.ue.intitule },
          niveau: {
            id: m.niveau.id,
            nom: m.niveau.nom,
            filiere: m.niveau.filiere.nom,
            faculte: m.niveau.filiere.faculte.nom,
          },
        })),
      }))
    );
  } catch (error: any) {
    console.error("[listerProfesseursParUniversite] ERREUR:", error);
    res.status(500).json({ error: error.message || "Erreur serveur" });
  }
};
