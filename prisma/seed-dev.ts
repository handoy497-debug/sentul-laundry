import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create admin user with plain text password (DEV ONLY!)
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@laundrypro.com' },
    update: {},
    create: {
      email: 'admin@laundrypro.com',
      password: 'admin123', // Plain text for dev
      bankAccount: '1234567890 - Bank LaundryPro',
      qrisImage: 'https://via.placeholder.com/200x200/00897B/FFFFFF?text=QRIS'
    }
  })

  console.log('Created admin:', admin)
  console.log('Login with: admin@laundrypro.com / admin123')

  // Create test discount
  let discount = await prisma.discount.findFirst({
    where: { promoCode: 'HARIINI' }
  })

  if (!discount) {
    discount = await prisma.discount.create({
      data: {
        title: 'Diskon Hari Ini',
        description: 'Diskon spesial untuk hari ini saja!',
        discountPercent: 20,
        promoCode: 'HARIINI',
        startDate: new Date(),
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        isActive: true
      }
    })
  }

  console.log('Created discount:', discount)
  console.log('Promo code: HARIINI (20% discount)')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })