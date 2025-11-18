import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Payment proof upload initiated for order:', params.id)
    
    const { id } = params
    const formData = await request.formData()
    const file = formData.get('paymentProof') as File

    console.log('File received:', file?.name, file?.type, file?.size)

    if (!file) {
      console.log('No file uploaded')
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.log('Invalid file type:', file.type)
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 })
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    try {
      await mkdir(uploadsDir, { recursive: true })
      console.log('Uploads directory ensured:', uploadsDir)
    } catch (error) {
      console.log('Uploads directory already exists or error:', error)
    }

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const filename = `payment-proof-${id}-${timestamp}.${fileExtension}`
    const filepath = join(uploadsDir, filename)

    console.log('Saving file to:', filepath)

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    console.log('File saved successfully')

    // Update payment record
    const payment = await db.payment.findFirst({
      where: { orderId: id }
    })

    if (!payment) {
      console.log('Payment not found for order:', id)
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    console.log('Found payment:', payment.id)

    const updatedPayment = await db.payment.update({
      where: { id: payment.id },
      data: {
        paymentProof: `/uploads/${filename}`,
        status: 'Pending Confirmation',
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

    console.log('Payment updated successfully')

    return NextResponse.json({
      success: true,
      payment: {
        ...updatedPayment,
        paymentProof: updatedPayment.paymentProof
      }
    })
  } catch (error) {
    console.error('Error uploading payment proof:', error)
    return NextResponse.json({ 
      error: 'Failed to upload payment proof',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}