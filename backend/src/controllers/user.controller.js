import prisma from '../config/database.js'

// ── Get profile (includes primary card) ─────────────────────
export async function getProfile(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        membershipTier: true,
        isEmailVerified: true,
        is2faEnabled: true,
        theme: true,
        showBalanceDefault: true,
        createdAt: true,
      },
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Get primary card
    const primaryCard = await prisma.bankAccount.findFirst({
      where: { userId: req.userId, isPrimary: true },
    })

    res.json({
      ...user,
      name: user.fullName,
      membership: user.membershipTier,
      primaryCard: primaryCard || null,
    })
  } catch (err) {
    console.error('Get profile error:', err)
    res.status(500).json({ error: 'Failed to get profile' })
  }
}

// ── Update profile ──────────────────────────────────────────
export async function updateProfile(req, res) {
  try {
    const { name, avatarUrl, theme, showBalanceDefault } = req.body

    const data = {}
    if (name !== undefined) data.fullName = name
    if (avatarUrl !== undefined) data.avatarUrl = avatarUrl
    if (theme !== undefined) data.theme = theme
    if (showBalanceDefault !== undefined) data.showBalanceDefault = showBalanceDefault

    const user = await prisma.user.update({
      where: { id: req.userId },
      data,
      select: {
        id: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        theme: true,
        showBalanceDefault: true,
        membershipTier: true,
      },
    })

    res.json({
      ...user,
      name: user.fullName,
      membership: user.membershipTier,
    })
  } catch (err) {
    console.error('Update profile error:', err)
    res.status(500).json({ error: 'Failed to update profile' })
  }
}

// ── Change password ─────────────────────────────────────────
export async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'currentPassword and newPassword are required' })
    }

    const user = await prisma.user.findUnique({ where: { id: req.userId } })
    if (!user || !user.passwordHash) {
      return res.status(400).json({ error: 'No password set (OAuth2 account)' })
    }

    const bcrypt = await import('bcrypt')
    const valid = await bcrypt.default.compare(currentPassword, user.passwordHash)
    if (!valid) {
      return res.status(401).json({ error: 'Current password is incorrect' })
    }

    const passwordHash = await bcrypt.default.hash(newPassword, 12)
    await prisma.user.update({
      where: { id: req.userId },
      data: { passwordHash },
    })

    res.json({ message: 'Password updated' })
  } catch (err) {
    console.error('Change password error:', err)
    res.status(500).json({ error: 'Failed to change password' })
  }
}
