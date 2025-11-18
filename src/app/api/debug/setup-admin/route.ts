import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST() {
  try {
    // Check if admin exists
    let admin = await db.admin.findFirst()
    
    if (!admin) {
      // Create admin with QRIS image
      admin = await db.admin.create({
        data: {
          email: 'admin@laundrypro.com',
          password: 'admin123', // In production, this should be hashed
          qrisImage: '/qris-code.png',
          bankAccount: '1234567890 - Bank Sentul-Laundry'
        }
      })
    } else {
      // Update existing admin with QRIS image
      admin = await db.admin.update({
        where: { id: admin.id },
        data: {
          qrisImage: '/qris-code.png',
          bankAccount: admin.bankAccount || '1234567890 - Bank LaundryPro'
        }
      })
    }

    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        qrisImage: admin.qrisImage,
        bankAccount: admin.bankAccount
      }
    })
  } catch (error) {
    console.error('Error setting up admin:', error)
    return NextResponse.json({ error: 'Failed to setup admin' }, { status: 500 })
  }
}