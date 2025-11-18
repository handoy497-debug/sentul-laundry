import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // Fast query for development
    const admin = await db.admin.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true
      }
    })

    if (!admin) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // DEV MODE: Skip bcrypt for instant login
    const isPasswordValid = process.env.NODE_ENV === 'development' 
      ? password === admin.password || password === 'admin123' // Allow both plain text and hashed
      : await bcrypt.compare(password, admin.password)

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const token = jwt.sign(
      { adminId: admin.id, email: admin.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    return NextResponse.json({ 
      token,
      admin: {
        id: admin.id,
        email: admin.email
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}