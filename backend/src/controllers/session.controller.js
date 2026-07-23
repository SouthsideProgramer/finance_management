import prisma from '../config/database.js'

// ── List active sessions ────────────────────────────────────
export async function listSessions(req, res) {
  try {
    const sessions = await prisma.userSession.findMany({
      where: { userId: req.userId, isRevoked: false },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
        expiresAt: true,
      },
    })

    res.json({ sessions })
  } catch (err) {
    console.error('List sessions error:', err)
    res.status(500).json({ error: 'Failed to list sessions' })
  }
}

// ── Revoke a session ────────────────────────────────────────
export async function revokeSession(req, res) {
  try {
    const { id } = req.params

    const session = await prisma.userSession.findFirst({
      where: { id, userId: req.userId },
    })
    if (!session) {
      return res.status(404).json({ error: 'Session not found' })
    }

    await prisma.userSession.update({
      where: { id },
      data: { isRevoked: true },
    })

    res.json({ message: 'Session revoked' })
  } catch (err) {
    console.error('Revoke session error:', err)
    res.status(500).json({ error: 'Failed to revoke session' })
  }
}

// ── Revoke all other sessions ───────────────────────────────
export async function revokeAllSessions(req, res) {
  try {
    const result = await prisma.userSession.updateMany({
      where: {
        userId: req.userId,
        isRevoked: false,
      },
      data: { isRevoked: true },
    })

    res.json({ message: `Revoked ${result.count} sessions` })
  } catch (err) {
    console.error('Revoke all sessions error:', err)
    res.status(500).json({ error: 'Failed to revoke sessions' })
  }
}
