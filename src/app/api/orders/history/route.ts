import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const phone = searchParams.get('phone')

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    }

    const orders = await db.order.findMany({
      where: {
        customer: {
          phone: phone
        }
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
      },
      orderBy: {
        orderDate: 'desc'
      }
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching order history:', error)
    return NextResponse.json({ error: 'Failed to fetch order history' }, { status: 500 })
  }
}