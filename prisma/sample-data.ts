import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createSampleData() {
  try {
    // Create sample customers
    const customers = await Promise.all([
      prisma.customer.create({
        data: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '08123456789',
          address: 'Jl. Sudirman No. 123, Jakarta'
        }
      }),
      prisma.customer.create({
        data: {
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '08234567890',
          address: 'Jl. Thamrin No. 456, Jakarta'
        }
      }),
      prisma.customer.create({
        data: {
          name: 'Bob Johnson',
          email: 'bob@example.com',
          phone: '08345678901',
          address: 'Jl. Gatot Subroto No. 789, Jakarta'
        }
      })
    ])

    // Get services
    const services = await prisma.service.findMany()
    
    // Create sample orders
    for (let i = 0; i < 10; i++) {
      const customer = customers[i % customers.length]
      const service = services[i % services.length]
      const weight = Math.floor(Math.random() * 5) + 1 // 1-5 kg
      const basePrice = service.basePricePerKg
      
      const order = await prisma.order.create({
        data: {
          customerId: customer.id,
          serviceId: service.id,
          weight: weight,
          totalCost: weight * basePrice,
          invoiceNumber: `INV${Date.now()}${i}`,
          status: ['Pending', 'In Process', 'Completed', 'Delivered'][i % 4],
          orderDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random date within last week
          ...(i % 3 === 0 && { pickupDate: new Date() }),
          ...(i % 4 === 0 && { deliveryDate: new Date() })
        }
      })

      // Create payment for each order
      const paymentMethods = ['Cash', 'Transfer', 'QRIS', 'COD']
      const paymentStatuses = ['Paid', 'Unpaid', 'Pending Confirmation']
      
      await prisma.payment.create({
        data: {
          orderId: order.id,
          paymentMethod: paymentMethods[i % paymentMethods.length],
          amount: weight * basePrice,
          status: paymentStatuses[i % paymentStatuses.length],
          ...(paymentStatuses[i % paymentStatuses.length] === 'Paid' && {
            paymentDate: new Date()
          })
        }
      })
    }

    console.log('Sample data created successfully!')
  } catch (error) {
    console.error('Error creating sample data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createSampleData()