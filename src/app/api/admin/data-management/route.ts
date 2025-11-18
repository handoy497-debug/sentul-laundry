import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dataType = searchParams.get('type') // 'orders', 'customers', 'payments'
    const olderThan = searchParams.get('olderThan') // days
    const status = searchParams.get('status') // filter by status
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    console.log('Delete request:', { dataType, olderThan, status, dateFrom, dateTo })

    if (!dataType) {
      return NextResponse.json({ error: 'Data type is required' }, { status: 400 })
    }

    let deleteResult = { count: 0 }

    // Build date filter
    const dateFilter: any = {}
    if (olderThan) {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - parseInt(olderThan))
      dateFilter.orderDate = {
        lt: cutoffDate
      }
    } else if (dateFrom && dateTo) {
      dateFilter.orderDate = {
        gte: new Date(dateFrom),
        lte: new Date(dateTo)
      }
    }

    // Add status filter if provided
    if (status) {
      dateFilter.status = status
    }

    switch (dataType) {
      case 'all':
        // Delete ALL data - this is a critical operation
        console.log('🚨 CRITICAL OPERATION: Deleting ALL data from the system')
        
        try {
          // Delete in correct order to respect foreign key constraints
          const results = []
          
          // 1. Delete all payments first
          const paymentsResult = await db.payment.deleteMany({})
          results.push({ type: 'payments', count: paymentsResult.count })
          
          // 2. Delete all orders
          const ordersResult = await db.order.deleteMany({})
          results.push({ type: 'orders', count: ordersResult.count })
          
          // 3. Delete all prices
          const pricesResult = await db.price.deleteMany({})
          results.push({ type: 'prices', count: pricesResult.count })
          
          // 4. Delete all services
          const servicesResult = await db.service.deleteMany({})
          results.push({ type: 'services', count: servicesResult.count })
          
          // 5. Delete all customers
          const customersResult = await db.customer.deleteMany({})
          results.push({ type: 'customers', count: customersResult.count })
          
          const totalDeleted = results.reduce((sum, result) => sum + result.count, 0)
          
          console.log('✅ Successfully deleted ALL data:', results)
          
          return NextResponse.json({
            success: true,
            deletedCount: totalDeleted,
            dataType: 'all',
            message: 'Semua data telah dihapus permanen. Sistem dikembalikan ke kondisi kosong.',
            details: results
          })
          
        } catch (error) {
          console.error('❌ Error during mass deletion:', error)
          throw error
        }

      case 'orders':
        // First delete related payments
        if (Object.keys(dateFilter).length > 0) {
          const ordersToDelete = await db.order.findMany({
            where: dateFilter,
            select: { id: true }
          })
          
          const orderIds = ordersToDelete.map(order => order.id)
          
          if (orderIds.length > 0) {
            // Delete payments first
            await db.payment.deleteMany({
              where: {
                orderId: {
                  in: orderIds
                }
              }
            })
            
            // Then delete orders
            deleteResult = await db.order.deleteMany({
              where: dateFilter
            })
          }
        } else {
          return NextResponse.json({ error: 'Please specify date range or olderThan parameter' }, { status: 400 })
        }
        break

      case 'customers':
        // Only delete customers without orders
        const customersWithOrders = await db.customer.findMany({
          where: {
            orders: {
              some: {}
            }
          },
          select: { id: true }
        })
        
        const customerIdsWithOrders = customersWithOrders.map(c => c.id)
        
        const customerFilter: any = {}
        if (customerIdsWithOrders.length > 0) {
          customerFilter.id = {
            notIn: customerIdsWithOrders
          }
        }
        
        if (olderThan) {
          const cutoffDate = new Date()
          cutoffDate.setDate(cutoffDate.getDate() - parseInt(olderThan))
          customerFilter.createdAt = {
            lt: cutoffDate
          }
        }
        
        deleteResult = await db.customer.deleteMany({
          where: customerFilter
        })
        break

      case 'payments':
        const paymentFilter: any = {}
        
        if (olderThan) {
          const cutoffDate = new Date()
          cutoffDate.setDate(cutoffDate.getDate() - parseInt(olderThan))
          paymentFilter.createdAt = {
            lt: cutoffDate
          }
        }
        
        if (status) {
          paymentFilter.status = status
        }
        
        if (dateFrom && dateTo) {
          paymentFilter.createdAt = {
            gte: new Date(dateFrom),
            lte: new Date(dateTo)
          }
        }
        
        if (Object.keys(paymentFilter).length === 0) {
          return NextResponse.json({ error: 'Please specify date range, olderThan, or status parameter' }, { status: 400 })
        }
        
        deleteResult = await db.payment.deleteMany({
          where: paymentFilter
        })
        break

      default:
        return NextResponse.json({ error: 'Invalid data type' }, { status: 400 })
    }

    console.log(`Deleted ${deleteResult.count} records of type: ${dataType}`)

    return NextResponse.json({
      success: true,
      deletedCount: deleteResult.count,
      dataType,
      filters: { olderThan, status, dateFrom, dateTo }
    })

  } catch (error) {
    console.error('Error deleting data:', error)
    return NextResponse.json({ 
      error: 'Failed to delete data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get data counts for preview
    const ordersCount = await db.order.count()
    const customersCount = await db.customer.count()
    const paymentsCount = await db.payment.count()
    
    // Get old data counts
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
    
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

    const oldOrders30Days = await db.order.count({
      where: {
        orderDate: {
          lt: thirtyDaysAgo
        }
      }
    })
    
    const oldOrders90Days = await db.order.count({
      where: {
        orderDate: {
          lt: ninetyDaysAgo
        }
      }
    })
    
    const oldOrders1Year = await db.order.count({
      where: {
        orderDate: {
          lt: oneYearAgo
        }
      }
    })

    const completedOrders = await db.order.count({
      where: { status: 'Completed' }
    })

    const deliveredOrders = await db.order.count({
      where: { status: 'Delivered' }
    })

    const paidPayments = await db.payment.count({
      where: { status: 'Paid' }
    })

    return NextResponse.json({
      totalData: {
        orders: ordersCount,
        customers: customersCount,
        payments: paymentsCount
      },
      oldData: {
        ordersOlderThan30Days: oldOrders30Days,
        ordersOlderThan90Days: oldOrders90Days,
        ordersOlderThan1Year: oldOrders1Year
      },
      statusBreakdown: {
        completedOrders,
        deliveredOrders,
        paidPayments
      }
    })

  } catch (error) {
    console.error('Error getting data info:', error)
    return NextResponse.json({ error: 'Failed to get data info' }, { status: 500 })
  }
}