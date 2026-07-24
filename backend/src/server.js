import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import authRoutes from './routes/auth.routes.js'
import userRoutes from './routes/user.routes.js'
import transactionRoutes from './routes/transaction.routes.js'
import chatRoutes from './routes/chat.routes.js'
import bankRoutes from './routes/bank.routes.js'
import sessionRoutes from './routes/session.routes.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

const allowedOrigins = [
  "http://localhost:8443",
  "https://finance-management-three-self.vercel.app",
  "https://finance-management-git-main-southsideprogramers-projects.vercel.app",
];

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

app.use(express.json());

// ── Health ──────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ── Routes ──────────────────────────────────────────────────
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/transactions', transactionRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/bank-accounts', bankRoutes)
app.use('/api/sessions', sessionRoutes)

// ── 404 ─────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// ── Error handler ───────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
