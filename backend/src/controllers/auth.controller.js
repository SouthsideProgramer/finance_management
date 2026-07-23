import bcrypt from 'bcrypt'
import prisma from '../config/database.js'
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  getRefreshTokenExpiry,
} from '../middleware/auth.js'

// ── Register ────────────────────────────────────────────────
export async function register(req, res) {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: { fullName: name, email, passwordHash },
    })

    const accessToken = generateAccessToken(user.id)
    const refreshToken = generateRefreshToken()

    // Save session
    await prisma.userSession.create({
      data: {
        userId: user.id,
        refreshTokenHash: hashToken(refreshToken),
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || null,
        expiresAt: getRefreshTokenExpiry(),
      },
    })

    res.status(201).json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.fullName,
        email: user.email,
        membershipTier: user.membershipTier,
      },
    })
  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ error: 'Registration failed' })
  }
}

// ── Login ───────────────────────────────────────────────────
export async function login(req, res) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const accessToken = generateAccessToken(user.id)
    const refreshToken = generateRefreshToken()

    await prisma.userSession.create({
      data: {
        userId: user.id,
        refreshTokenHash: hashToken(refreshToken),
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || null,
        expiresAt: getRefreshTokenExpiry(),
      },
    })

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.fullName,
        email: user.email,
        membershipTier: user.membershipTier,
      },
    })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Login failed' })
  }
}

// ── Refresh Token ───────────────────────────────────────────
export async function refreshToken(req, res) {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' })
    }

    const session = await prisma.userSession.findFirst({
      where: {
        refreshTokenHash: hashToken(refreshToken),
        isRevoked: false,
        expiresAt: { gt: new Date() },
      },
    })

    if (!session) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' })
    }

    // Rotate: revoke old, issue new
    const newRefreshToken = generateRefreshToken()
    await prisma.userSession.update({
      where: { id: session.id },
      data: { isRevoked: true },
    })

    await prisma.userSession.create({
      data: {
        userId: session.userId,
        refreshTokenHash: hashToken(newRefreshToken),
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || null,
        expiresAt: getRefreshTokenExpiry(),
      },
    })

    const accessToken = generateAccessToken(session.userId)
    res.json({ accessToken, refreshToken: newRefreshToken })
  } catch (err) {
    console.error('Refresh token error:', err)
    res.status(500).json({ error: 'Token refresh failed' })
  }
}

// ── Logout ──────────────────────────────────────────────────
export async function logout(req, res) {
  try {
    const { refreshToken } = req.body

    if (refreshToken) {
      // Revoke specific session
      await prisma.userSession.updateMany({
        where: { refreshTokenHash: hashToken(refreshToken) },
        data: { isRevoked: true },
      })
    }

    res.json({ message: 'Logged out' })
  } catch (err) {
    console.error('Logout error:', err)
    res.status(500).json({ error: 'Logout failed' })
  }
}

// ── Logout All Devices ──────────────────────────────────────
export async function logoutAll(req, res) {
  try {
    await prisma.userSession.updateMany({
      where: { userId: req.userId, isRevoked: false },
      data: { isRevoked: true },
    })

    res.json({ message: 'Logged out from all devices' })
  } catch (err) {
    console.error('Logout all error:', err)
    res.status(500).json({ error: 'Logout all failed' })
  }
}
