import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.routes'
import faculteRoutes from './routes/faculte.routes'
import filiereRoutes from './routes/filiere.routes'
import niveauRoutes from './routes/niveau.routes'
import moduleRoutes from './routes/module.routes'
import etudiantRoutes from './routes/etudiant.route'
import superAdminRoutes from './routes/superadmin.route'
import professeur from './routes/professeur.route'

import cookieParser from 'cookie-parser'


dotenv.config()

const app = express()

app.use(cors(
  {
    origin: ['http://localhost:3000', 'http://localhost:3001','https://univ-frontend.vercel.app/'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
  }
))
app.use(express.json())
app.use(cookieParser())

app.use(express.urlencoded({ extended: true }))
app.use('/api/auth', authRoutes)
app.use('/api/facultes', faculteRoutes)
app.use('/api/filieres', filiereRoutes)
app.use('/api/niveaux', niveauRoutes)
app.use('/api/modules', moduleRoutes)
app.use('/api/etudiants', etudiantRoutes)
app.use('/api/super-admin', superAdminRoutes)
app.use('/api/professeurs', professeur)

app.get('/', (req, res) => {
  res.send('API Université prête 🚀')
})

const PORT = process.env.PORT || 4000

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`)
})
