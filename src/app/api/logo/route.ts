import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const admin = await db.admin.findFirst({
      select: {
        logo: true
      }
    })

    return NextResponse.json({ 
      logo: admin?.logo || null 
    })
  } catch (error) {
    console.error('Error fetching logo:', error)
    return NextResponse.json({ 
      logo: null 
    })
  }
}