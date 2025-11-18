import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const admin = await db.admin.findFirst({
      select: {
        id: true,
        email: true,
        qrisImage: true,
        bankAccount: true,
        logo: true,
        phone: true,
        contactEmail: true,
        address: true
      }
    })

    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 })
    }

    return NextResponse.json(admin)
  } catch (error) {
    console.error('Error fetching admin settings:', error)
    return NextResponse.json({ error: 'Failed to fetch admin settings' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { qrisImage, bankAccount, logo, phone, contactEmail, address } = body

    const admin = await db.admin.findFirst()
    
    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 })
    }

    const updatedAdmin = await db.admin.update({
      where: { id: admin.id },
      data: {
        qrisImage,
        bankAccount,
        logo,
        phone,
        contactEmail,
        address
      },
      select: {
        id: true,
        email: true,
        qrisImage: true,
        bankAccount: true,
        logo: true,
        phone: true,
        contactEmail: true,
        address: true
      }
    })

    return NextResponse.json(updatedAdmin)
  } catch (error) {
    console.error('Error updating admin settings:', error)
    return NextResponse.json({ error: 'Failed to update admin settings' }, { status: 500 })
  }
}