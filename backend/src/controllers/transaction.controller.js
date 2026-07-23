import prisma from '../config/database.js'

export async function listTransactions(req, res) {
  try {
    const { type, page = 1, limit = 20 } = req.query
    const skip = (Number(page) - 1) * Number(limit)

    const where = {
      userId: req.userId,
      ...(type && type !== 'all' && { type }),
    }

    const [data, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.transaction.count({ where }),
    ])

    const serialized = data.map(t => ({ ...t, amount: Number(t.amount) }))
    res.json({ data: serialized, total, page: Number(page), limit: Number(limit) })
  } catch (err) {
    console.error('List transactions error:', err)
    res.status(500).json({ error: 'Failed to list transactions' })
  }
}

export async function createTransaction(req, res) {
  try {
    const { type, amount, description, quarter } = req.body

    if (!type || amount === undefined) {
      return res.status(400).json({ error: 'Type and amount are required' })
    }

    if (!['deposit', 'withdraw'].includes(type)) {
      return res.status(400).json({ error: 'Type must be deposit or withdraw' })
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId: req.userId,
        type,
        amount: BigInt(amount),
        description: description || null,
        quarter: quarter || null,
      },
    })

    res.status(201).json({
      ...transaction,
      amount: Number(transaction.amount),
    })
  } catch (err) {
    console.error('Create transaction error:', err)
    res.status(500).json({ error: 'Failed to create transaction' })
  }
}

export async function deleteTransaction(req, res) {
  try {
    const { id } = req.params

    const transaction = await prisma.transaction.findFirst({
      where: { id, userId: req.userId },
    })

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' })
    }

    await prisma.transaction.delete({ where: { id } })
    res.json({ message: 'Deleted' })
  } catch (err) {
    console.error('Delete transaction error:', err)
    res.status(500).json({ error: 'Failed to delete transaction' })
  }
}
