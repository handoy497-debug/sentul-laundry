import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      serviceId,
      estimatedWeight,
      paymentMethod,
      discountId
    } = body

    // Validation
    if (!customerName || !customerEmail || !customerPhone || !customerAddress || !serviceId || !estimatedWeight || !paymentMethod) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    // Generate invoice number
    const invoiceNumber = `INV${Date.now()}${Math.floor(Math.random() * 1000)}`

    // Create or find customer
    let customer = await db.customer.findFirst({
      where: { email: customerEmail }
    })

    if (!customer) {
      customer = await db.customer.create({
        data: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
          address: customerAddress
        }
      })
    }

    // Get current price for the service
    const currentPrice = await db.price.findFirst({
      where: {
        serviceId: serviceId,
        effectiveDate: {
          lte: new Date()
        }
      },
      orderBy: {
        effectiveDate: 'desc'
      }
    })

    if (!currentPrice) {
      return NextResponse.json({ error: 'No price found for this service' }, { status: 400 })
    }

    // Calculate total cost
    const weight = parseFloat(estimatedWeight)
    let totalCost = weight * currentPrice.pricePerKg

    // Apply discount if provided
    let appliedDiscount = null
    if (discountId) {
      const discount = await db.discount.findFirst({
        where: {
          id: discountId,
          isActive: true,
          startDate: {
            lte: new Date()
          },
          endDate: {
            gte: new Date()
          }
        }
      })

      if (discount) {
        const discountAmount = totalCost * (discount.discountPercent / 100)
        totalCost = totalCost - discountAmount
        appliedDiscount = {
          id: discount.id,
          title: discount.title,
          discountPercent: discount.discountPercent,
          discountAmount: discountAmount
        }
      }
    }

    // Validate weight
    if (isNaN(weight) || weight <= 0) {
      return NextResponse.json({ error: 'Invalid weight value' }, { status: 400 })
    }

    // Create order
    const order = await db.order.create({
      data: {
        customerId: customer.id,
        serviceId: serviceId,
        weight: parseFloat(estimatedWeight),
        totalCost: totalCost,
        invoiceNumber: invoiceNumber,
        status: 'Pending'
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

    // Create payment record
    await db.payment.create({
      data: {
        orderId: order.id,
        paymentMethod: paymentMethod,
        amount: totalCost,
        status: paymentMethod === 'Cash' || paymentMethod === 'COD' ? 'Unpaid' : 'Unpaid'
      }
    })

    // Return order with discount info
    return NextResponse.json({
      ...order,
      appliedDiscount
    })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json({ 
      error: 'Failed to create order',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}