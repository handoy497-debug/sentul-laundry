import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin user with lower bcrypt rounds for faster login
  const hashedPassword = await bcrypt.hash('admin123', 5) // Reduced from 10 to 5
  
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@laundrypro.com' },
    update: {},
    create: {
      email: 'admin@laundrypro.com',
      password: hashedPassword,
      bankAccount: '1234567890 - Bank LaundryPro',
      qrisImage: 'https://via.placeholder.com/200x200/00897B/FFFFFF?text=QRIS'
    }
  })

  console.log('Created admin:', admin)

  // Create services
  const services = [
    {
      serviceName: 'Cuci Regular',
      description: 'Cuci biasa dengan setrika',
      basePricePerKg: 8000,
      estimatedTime: '2-3 hari'
    },
    {
      serviceName: 'Cuci Express',
      description: 'Cuci kilat dengan setrika',
      basePricePerKg: 12000,
      estimatedTime: '1 hari'
    },
    {
      serviceName: 'Cuci + Setrika',
      description: 'Cuci dan setrika rapi',
      basePricePerKg: 10000,
      estimatedTime: '2-3 hari'
    },
    {
      serviceName: 'Dry Clean',
      description: 'Dry cleaning untuk baju formal',
      basePricePerKg: 25000,
      estimatedTime: '3-4 hari'
    },
    {
      serviceName: 'Cuci Karpet',
      description: 'Cuci karpet dan permadani',
      basePricePerKg: 15000,
      estimatedTime: '4-5 hari'
    }
  ]

  for (const service of services) {
    const createdService = await prisma.service.create({
      data: service
    })

    // Create current price for each service
    await prisma.price.create({
      data: {
        serviceId: createdService.id,
        effectiveDate: new Date(),
        pricePerKg: service.basePricePerKg,
        notes: 'Harga awal'
      }
    })

    console.log('Created service:', createdService.serviceName)
  }

  console.log('Seed data created successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })