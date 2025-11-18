import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await request.json()

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 })
    }

    const order = await db.order.update({
      where: { id: params.id },
      data: { 
        status,
        // Update dates based on status
        ...(status === 'In Process' && { pickupDate: new Date() }),
        ...(status === 'Completed' && { deliveryDate: new Date() })
      },
      include: {
        customer: true,
        service: {
          select: {
            serviceName: true
          }
        },
        payments: true
      }
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error updating order status:', error)
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 })
  }
}