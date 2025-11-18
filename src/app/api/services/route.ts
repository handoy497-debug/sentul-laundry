import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const services = await db.service.findMany({
      include: {
        prices: {
          where: {
            effectiveDate: {
              lte: new Date()
            }
          },
          orderBy: {
            effectiveDate: 'desc'
          },
          take: 1
        }
      }
    })

    return NextResponse.json(services)
  } catch (error) {
    console.error('Error fetching services:', error)
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 })
  }
}