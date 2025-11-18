import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const admin = await db.admin.findFirst({
      select: {
        id: true,
        email: true,
        qrisImage: true,
        bankAccount: true
      }
    })

    return NextResponse.json({
      admin,
      message: admin ? 'Admin found' : 'No admin found'
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}