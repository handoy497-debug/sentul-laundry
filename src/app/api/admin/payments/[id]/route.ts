import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { status, notes } = body

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 })
    }

    // Validate status
    const validStatuses = ['Paid', 'Unpaid', 'Pending Confirmation']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Update payment
    const updatedPayment = await db.payment.update({
      where: { id },
      data: {
        status,
        notes: notes || null,
        paymentDate: status === 'Paid' ? new Date() : null,
        updatedAt: new Date()
      },
      include: {
        order: {
          include: {
            customer: {
              select: {
                name: true,
                phone: true
              }
            },
            service: {
              select: {
                serviceName: true
              }
            }
          }
        }
      }
    })

    // Transform the data to include paymentProof
    const transformedPayment = {
      ...updatedPayment,
      paymentProof: updatedPayment.paymentProof
    }

    return NextResponse.json(transformedPayment)
  } catch (error) {
    console.error('Error updating payment:', error)
    return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 })
  }
}