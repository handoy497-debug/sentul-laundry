import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const admin = await db.admin.findFirst({
      select: {
        phone: true,
        contactEmail: true,
        address: true
      }
    })

    return NextResponse.json({ 
      phone: admin?.phone || null,
      contactEmail: admin?.contactEmail || null,
      address: admin?.address || null
    })
  } catch (error) {
    console.error('Error fetching contact info:', error)
    return NextResponse.json({ 
      phone: null,
      contactEmail: null,
      address: null
    })
  }
}