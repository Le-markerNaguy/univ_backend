import nodemailer from 'nodemailer'

export const sendCodeByEmail = async (
  destinataire: string,
  nom: string,
  code: string,
  role: "ETUDIANT" | "PROFESSEUR"
) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_FROM, // ton adresse Gmail
      pass: process.env.EMAIL_PASS, // mot de passe ou App Password
    },
  })

  const subject =
    role === "ETUDIANT"
      ? "Bienvenue sur la plateforme universitaire - Étudiant 🎓"
      : "Bienvenue sur la plateforme universitaire - Professeur 👨‍🏫"

  const message = {
    from: `"Université" <${process.env.EMAIL_FROM}>`,
    to: destinataire,
    subject,
    html: `
      <p>Bonjour <strong>${nom}</strong>,</p>
      <p>Votre compte <strong>${role.toLowerCase()}</strong> a été créé avec succès.</p>
      <p>Voici votre code de connexion :</p>
      <h2>${code}</h2>
      <p>Conservez ce code précieusement, il vous servira pour vous connecter.</p>
      <p>Cordialement,<br>Administration Universitaire</p>
    `,
  }

  await transporter.sendMail(message)
}
