import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const discount = await db.discount.findUnique({
      where: { id: params.id }
    })
    
    if (!discount) {
      return NextResponse.json(
        { error: 'Discount not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(discount)
  } catch (error) {
    console.error('Error fetching discount:', error)
    return NextResponse.json(
      { error: 'Failed to fetch discount' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const formData = await request.formData()
    
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const discountPercent = parseFloat(formData.get('discountPercent') as string)
    const promoCode = formData.get('promoCode') as string
    const startDate = new Date(formData.get('startDate') as string)
    const endDate = new Date(formData.get('endDate') as string)
    const isActive = formData.get('isActive') === 'true'
    const image = formData.get('image') as File
    const bannerImage = formData.get('bannerImage') as File

    // Validate required fields
    if (!title || !discountPercent || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if discount exists
    const existingDiscount = await db.discount.findUnique({
      where: { id: params.id }
    })
    
    if (!existingDiscount) {
      return NextResponse.json(
        { error: 'Discount not found' },
        { status: 404 }
      )
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'discounts')
    try {
      await mkdir(uploadsDir, { recursive: true })
    } catch (error) {
      // Directory might already exist
    }

    // Handle image upload
    let imagePath: string | null = existingDiscount.image
    if (image && image.size > 0) {
      const bytes = await image.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      const timestamp = Date.now()
      const filename = `${timestamp}-${image.name}`
      const filepath = path.join(uploadsDir, filename)
      
      await writeFile(filepath, buffer)
      imagePath = `/uploads/discounts/${filename}`
    }

    // Handle banner image upload
    let bannerImagePath: string | null = existingDiscount.bannerImage
    if (bannerImage && bannerImage.size > 0) {
      const bytes = await bannerImage.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      const timestamp = Date.now()
      const filename = `banner-${timestamp}-${bannerImage.name}`
      const filepath = path.join(uploadsDir, filename)
      
      await writeFile(filepath, buffer)
      bannerImagePath = `/uploads/discounts/${filename}`
    }

    // Update discount in database
    const discount = await db.discount.update({
      where: { id: params.id },
      data: {
        title,
        description: description || null,
        image: imagePath,
        bannerImage: bannerImagePath,
        discountPercent,
        promoCode: promoCode || null,
        startDate,
        endDate,
        isActive
      }
    })

    return NextResponse.json(discount)
  } catch (error) {
    console.error('Error updating discount:', error)
    return NextResponse.json(
      { error: 'Failed to update discount' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if discount exists
    const existingDiscount = await db.discount.findUnique({
      where: { id: params.id }
    })
    
    if (!existingDiscount) {
      return NextResponse.json(
        { error: 'Discount not found' },
        { status: 404 }
      )
    }

    // Delete discount
    await db.discount.delete({
      where: { id: params.id }
    })

    return NextResponse.json(
      { message: 'Discount deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting discount:', error)
    return NextResponse.json(
      { error: 'Failed to delete discount' },
      { status: 500 }
    )
  }
}