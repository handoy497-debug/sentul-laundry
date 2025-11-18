import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { promoCode } = await request.json()

    if (!promoCode) {
      return NextResponse.json({ error: 'Promo code is required' }, { status: 400 })
    }

    // Find active discount with matching promo code
    const discount = await db.discount.findFirst({
      where: {
        promoCode: promoCode.toUpperCase(),
        isActive: true,
        startDate: {
          lte: new Date()
        },
        endDate: {
          gte: new Date()
        }
      }
    })

    if (!discount) {
      return NextResponse.json({ 
        error: 'Invalid promo code',
        valid: false 
      }, { status: 404 })
    }

    return NextResponse.json({
      valid: true,
      discount: {
        id: discount.id,
        title: discount.title,
        description: discount.description,
        discountPercent: discount.discountPercent,
        promoCode: discount.promoCode
      }
    })
  } catch (error) {
    console.error('Error validating promo code:', error)
    return NextResponse.json(
      { error: 'Failed to validate promo code' },
      { status: 500 }
    )
  }
}