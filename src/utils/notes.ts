import { prisma } from '../prisma/client'

/**
 * Vérifie et calcule la note d’un semestre
 */
export const verifierEtCalculerNoteSemestre = async (etudiantId: string, semestreId: number) => {
  const ues = await prisma.uE.findMany({ where: { semestreId } })
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
export const verifierEtCalculerNoteUE = async (etudiantId: string, ueId: number) => {
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

  // Ici on pourrait stocker la moyenne d’UE dans une table dédiée si besoin

  const ue = await prisma.uE.findUnique({ where: { id: ueId } })
  if (ue?.semestreId) {
    await verifierEtCalculerNoteSemestre(etudiantId, ue.semestreId)
  }
}
