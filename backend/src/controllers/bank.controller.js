import prisma from '../config/database.js'

function maskCardNumber(number) {
  const digits = number.replace(/\D/g, '')
  if (digits.length < 8) return number
  return `${digits.slice(0, 4)} •••• •••• ${digits.slice(-4)}`
}

// ── List cards ──────────────────────────────────────────────
export async function listCards(req, res) {
  try {
    const cards = await prisma.bankAccount.findMany({
      where: { userId: req.userId },
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'desc' }],
    })

    res.json({ cards })
  } catch (err) {
    console.error('List cards error:', err)
    res.status(500).json({ error: 'Failed to list cards' })
  }
}

// ── Add card ────────────────────────────────────────────────
export async function addCard(req, res) {
  try {
    const { bankName, cardNumber, expDate } = req.body

    if (!bankName || !cardNumber || !expDate) {
      return res.status(400).json({ error: 'bankName, cardNumber, and expDate are required' })
    }

    const maskedCardNumber = maskCardNumber(cardNumber)

    // If first card, auto-set as primary
    const existingCount = await prisma.bankAccount.count({
      where: { userId: req.userId },
    })
    const isPrimary = existingCount === 0

    const card = await prisma.bankAccount.create({
      data: {
        userId: req.userId,
        bankName,
        maskedCardNumber,
        expDate,
        isPrimary,
      },
    })

    res.status(201).json(card)
  } catch (err) {
    console.error('Add card error:', err)
    res.status(500).json({ error: 'Failed to add card' })
  }
}

// ── Set primary card ────────────────────────────────────────
export async function setPrimaryCard(req, res) {
  try {
    const { id } = req.params

    const card = await prisma.bankAccount.findFirst({
      where: { id, userId: req.userId },
    })
    if (!card) {
      return res.status(404).json({ error: 'Card not found' })
    }

    // Unset all primary, then set this one
    await prisma.bankAccount.updateMany({
      where: { userId: req.userId, isPrimary: true },
      data: { isPrimary: false },
    })

    await prisma.bankAccount.update({
      where: { id },
      data: { isPrimary: true },
    })

    res.json({ message: 'Primary card updated' })
  } catch (err) {
    console.error('Set primary error:', err)
    res.status(500).json({ error: 'Failed to set primary card' })
  }
}

// ── Delete card ─────────────────────────────────────────────
export async function deleteCard(req, res) {
  try {
    const { id } = req.params

    const card = await prisma.bankAccount.findFirst({
      where: { id, userId: req.userId },
    })
    if (!card) {
      return res.status(404).json({ error: 'Card not found' })
    }

    await prisma.bankAccount.delete({ where: { id } })

    // If deleted card was primary, set another as primary
    if (card.isPrimary) {
      const nextCard = await prisma.bankAccount.findFirst({
        where: { userId: req.userId },
        orderBy: { createdAt: 'desc' },
      })
      if (nextCard) {
        await prisma.bankAccount.update({
          where: { id: nextCard.id },
          data: { isPrimary: true },
        })
      }
    }

    res.json({ message: 'Card deleted' })
  } catch (err) {
    console.error('Delete card error:', err)
    res.status(500).json({ error: 'Failed to delete card' })
  }
}
