import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const discounts = await db.discount.findMany({
      where: {
        isActive: true,
        startDate: {
          lte: new Date()
        },
        endDate: {
          gte: new Date()
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(discounts)
  } catch (error) {
    console.error('Error fetching active discounts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch discounts' },
      { status: 500 }
    )
  }
}