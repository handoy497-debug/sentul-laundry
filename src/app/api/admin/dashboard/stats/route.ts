import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const thisMonth = new Date()
    thisMonth.setDate(1)
    thisMonth.setHours(0, 0, 0, 0)

    // Total orders today
    const totalOrdersToday = await db.order.count({
      where: {
        orderDate: {
          gte: today
        }
      }
    })

    // Total customers
    const totalCustomers = await db.customer.count()

    // Monthly revenue
    const monthlyRevenue = await db.payment.aggregate({
      where: {
        status: 'Paid',
        paymentDate: {
          gte: thisMonth
        }
      },
      _sum: {
        amount: true
      }
    })

    // Completed orders
    const completedOrders = await db.order.count({
      where: {
        status: 'Completed'
      }
    })

    return NextResponse.json({
      totalOrdersToday,
      totalCustomers,
      monthlyRevenue: monthlyRevenue._sum.amount || 0,
      completedOrders
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 })
  }
}