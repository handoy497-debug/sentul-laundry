import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const reportType = searchParams.get('type') || 'summary'

    console.log('Generating report:', { startDate, endDate, reportType })

    // Build date filter
    const dateFilter: any = {}
    if (startDate && endDate) {
      dateFilter.orderDate = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    } else if (startDate) {
      dateFilter.orderDate = {
        gte: new Date(startDate)
      }
    } else if (endDate) {
      dateFilter.orderDate = {
        lte: new Date(endDate)
      }
    }

    // Get orders with filters
    const orders = await db.order.findMany({
      where: dateFilter,
      include: {
        customer: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        },
        service: {
          select: {
            serviceName: true
          }
        },
        payments: {
          select: {
            paymentMethod: true,
            amount: true,
            status: true,
            paymentDate: true,
            paymentProof: true
          }
        }
      },
      orderBy: {
        orderDate: 'desc'
      }
    })

    console.log(`Found ${orders.length} orders`)

    // Calculate statistics
    const totalOrders = orders.length
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalCost || 0), 0)
    const paidOrders = orders.filter(order => 
      order.payments.some(payment => payment.status === 'Paid')
    ).length
    const pendingOrders = orders.filter(order => order.status === 'Pending').length
    const inProcessOrders = orders.filter(order => order.status === 'In Process').length
    const completedOrders = orders.filter(order => order.status === 'Completed').length

    // Revenue by payment method
    const revenueByPaymentMethod = orders.reduce((acc: any, order) => {
      order.payments.forEach(payment => {
        if (payment.status === 'Paid') {
          acc[payment.paymentMethod] = (acc[payment.paymentMethod] || 0) + payment.amount
        }
      })
      return acc
    }, {})

    // Orders by service
    const ordersByService = orders.reduce((acc: any, order) => {
      acc[order.service.serviceName] = (acc[order.service.serviceName] || 0) + 1
      return acc
    }, {})

    // Monthly revenue (last 12 months)
    const monthlyRevenue = []
    const now = new Date()
    for (let i = 11; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
      
      const monthOrders = orders.filter(order => {
        const orderDate = new Date(order.orderDate)
        return orderDate >= month && orderDate < nextMonth
      })
      
      const monthRevenue = monthOrders.reduce((sum, order) => {
        return sum + order.payments
          .filter(payment => payment.status === 'Paid')
          .reduce((paymentSum, payment) => paymentSum + payment.amount, 0)
      }, 0)
      
      monthlyRevenue.push({
        month: month.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }),
        revenue: monthRevenue,
        orders: monthOrders.length
      })
    }

    // Daily revenue (last 30 days)
    const dailyRevenue = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)
      
      const dayOrders = orders.filter(order => {
        const orderDate = new Date(order.orderDate)
        return orderDate >= date && orderDate < nextDate
      })
      
      const dayRevenue = dayOrders.reduce((sum, order) => {
        return sum + order.payments
          .filter(payment => payment.status === 'Paid')
          .reduce((paymentSum, payment) => paymentSum + payment.amount, 0)
      }, 0)
      
      dailyRevenue.push({
        date: date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        revenue: dayRevenue,
        orders: dayOrders.length
      })
    }

    const reportData = {
      summary: {
        totalOrders,
        totalRevenue,
        paidOrders,
        pendingOrders,
        inProcessOrders,
        completedOrders,
        averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        paymentSuccessRate: totalOrders > 0 ? (paidOrders / totalOrders) * 100 : 0
      },
      revenueByPaymentMethod,
      ordersByService,
      monthlyRevenue,
      dailyRevenue,
      orders: orders.map(order => ({
        invoiceNumber: order.invoiceNumber,
        customerName: order.customer.name,
        customerEmail: order.customer.email,
        customerPhone: order.customer.phone,
        serviceName: order.service.serviceName,
        weight: order.weight,
        totalCost: order.totalCost,
        status: order.status,
        orderDate: order.orderDate,
        paymentMethod: order.payments[0]?.paymentMethod || 'Unknown',
        paymentStatus: order.payments[0]?.status || 'Unpaid',
        paymentAmount: order.payments[0]?.amount || 0,
        paymentDate: order.payments[0]?.paymentDate,
        hasPaymentProof: !!order.payments[0]?.paymentProof
      }))
    }

    console.log('Report generated successfully')

    return NextResponse.json(reportData)
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}