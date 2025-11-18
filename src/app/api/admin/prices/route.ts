import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { serviceId, pricePerKg, effectiveDate, notes } = body

    if (!serviceId || !pricePerKg) {
      return NextResponse.json({ error: 'Service ID and price are required' }, { status: 400 })
    }

    const price = await db.price.create({
      data: {
        serviceId,
        pricePerKg: parseFloat(pricePerKg),
        effectiveDate: new Date(effectiveDate),
        notes
      },
      include: {
        service: {
          select: {
            serviceName: true
          }
        }
      }
    })

    return NextResponse.json(price)
  } catch (error) {
    console.error('Error creating price:', error)
    return NextResponse.json({ error: 'Failed to create price' }, { status: 500 })
  }
}