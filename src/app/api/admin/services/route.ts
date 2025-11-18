import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const services = await db.service.findMany({
      include: {
        prices: {
          orderBy: {
            effectiveDate: 'desc'
          }
        },
        _count: {
          select: {
            orders: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(services)
  } catch (error) {
    console.error('Error fetching services:', error)
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { serviceName, description, basePricePerKg, estimatedTime } = body

    if (!serviceName || !basePricePerKg) {
      return NextResponse.json({ error: 'Service name and base price are required' }, { status: 400 })
    }

    const service = await db.service.create({
      data: {
        serviceName,
        description,
        basePricePerKg: parseFloat(basePricePerKg),
        estimatedTime
      }
    })

    // Create initial price
    await db.price.create({
      data: {
        serviceId: service.id,
        effectiveDate: new Date(),
        pricePerKg: parseFloat(basePricePerKg),
        notes: 'Harga awal'
      }
    })

    return NextResponse.json(service)
  } catch (error) {
    console.error('Error creating service:', error)
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 })
  }
}