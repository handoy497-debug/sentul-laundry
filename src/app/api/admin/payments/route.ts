import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const method = searchParams.get('method')

    const whereClause: any = {}
    
    if (status) {
      whereClause.status = status
    }
    
    if (method) {
      whereClause.paymentMethod = method
    }

    const payments = await db.payment.findMany({
      where: whereClause,
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform the data to include paymentProof
    const transformedPayments = payments.map(payment => ({
      ...payment,
      paymentProof: payment.paymentProof
    }))

    return NextResponse.json(transformedPayments)
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
  }
}