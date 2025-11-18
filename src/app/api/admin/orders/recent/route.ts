import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const recentOrders = await db.order.findMany({
      take: 5,
      orderBy: {
        orderDate: 'desc'
      },
      include: {
        customer: {
          select: {
            name: true
          }
        },
        service: {
          select: {
            serviceName: true
          }
        }
      }
    })

    const formattedOrders = recentOrders.map(order => ({
      id: order.id,
      invoiceNumber: order.invoiceNumber,
      customerName: order.customer.name,
      serviceName: order.service.serviceName,
      totalCost: order.totalCost,
      status: order.status,
      orderDate: order.orderDate.toISOString()
    }))

    return NextResponse.json(formattedOrders)
  } catch (error) {
    console.error('Error fetching recent orders:', error)
    return NextResponse.json({ error: 'Failed to fetch recent orders' }, { status: 500 })
  }
}