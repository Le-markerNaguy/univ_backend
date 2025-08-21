/**
 * Générer un code unique avec un préfixe
 */
export const generateCode = (prefix: string): string => {
  const random = Math.floor(100000 + Math.random() * 900000)
  return `${prefix}${random}`
}
