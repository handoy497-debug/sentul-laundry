import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const number = searchParams.get('number')

    if (!number) {
      return NextResponse.json({ error: 'Tracking number is required' }, { status: 400 })
    }

    const order = await db.order.findFirst({
      where: {
        OR: [
          { invoiceNumber: number },
          { customer: { phone: number } }
        ]
      },
      include: {
        customer: true,
        service: {
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
        },
        payments: true
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error tracking order:', error)
    return NextResponse.json({ error: 'Failed to track order' }, { status: 500 })
  }
}