import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const customer = await db.customer.findUnique({
      where: { id: params.id },
      include: {
        orders: {
          include: {
            service: {
              select: {
                serviceName: true
              }
            },
            payments: true
          },
          orderBy: {
            orderDate: 'desc'
          }
        },
        _count: {
          select: {
            orders: true
          }
        }
      }
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    return NextResponse.json(customer)
  } catch (error) {
    console.error('Error fetching customer:', error)
    return NextResponse.json({ error: 'Failed to fetch customer' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, email, phone, address } = body

    // Check if email already exists for another customer
    const existingCustomer = await db.customer.findFirst({
      where: { 
        email,
        id: { not: params.id }
      }
    })

    if (existingCustomer) {
      return NextResponse.json({ error: 'Customer with this email already exists' }, { status: 400 })
    }

    const customer = await db.customer.update({
      where: { id: params.id },
      data: {
        name,
        email,
        phone,
        address
      },
      include: {
        _count: {
          select: {
            orders: true
          }
        }
      }
    })

    return NextResponse.json(customer)
  } catch (error) {
    console.error('Error updating customer:', error)
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if customer has orders
    const orderCount = await db.order.count({
      where: { customerId: params.id }
    })

    if (orderCount > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete customer with existing orders' 
      }, { status: 400 })
    }

    await db.customer.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Customer deleted successfully' })
  } catch (error) {
    console.error('Error deleting customer:', error)
    return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 })
  }
}