import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

async function main() {
  console.log('Seeding database...')

  // Create demo user and business
  const hashedPassword = await bcrypt.hash('mayava1122', 12)

  const user = await db.user.create({
    data: {
      name: 'Demo User',
      email: 'mayava891@gmail.com',
      password: hashedPassword,
      role: 'OWNER',
      business: {
        create: {
          name: 'Demo Salon',
          slug: 'demo-salon-' + Date.now().toString(36),
          phone: '+1 (555) 123-4567',
          email: 'hello@demosalOn.com',
          address: '123 Main Street',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          timezone: 'America/New_York',
          workingHours: {
            create: [
              { dayOfWeek: 1, startTime: '09:00', endTime: '18:00' },
              { dayOfWeek: 2, startTime: '09:00', endTime: '18:00' },
              { dayOfWeek: 3, startTime: '09:00', endTime: '18:00' },
              { dayOfWeek: 4, startTime: '09:00', endTime: '18:00' },
              { dayOfWeek: 5, startTime: '09:00', endTime: '18:00' },
              { dayOfWeek: 6, startTime: '10:00', endTime: '16:00' },
            ],
          },
          services: {
            create: [
              { name: 'Haircut', description: 'Professional haircut and styling', duration: 30, price: 35, color: '#3b82f6' },
              { name: 'Hair Color', description: 'Full color treatment', duration: 90, price: 120, color: '#8b5cf6' },
              { name: 'Beard Trim', description: 'Beard shaping and grooming', duration: 20, price: 20, color: '#10b981' },
              { name: 'Hair Wash', description: 'Shampoo and blow dry', duration: 25, price: 25, color: '#f59e0b' },
            ],
          },
          notificationSettings: {
            create: {},
          },
          aiSettings: {
            create: {},
          },
        },
      },
    },
    include: {
      business: {
        include: {
          services: true,
          workingHours: true,
        },
      },
    },
  })

  // Create demo customers
  const customers = await Promise.all([
    db.customer.create({
      data: {
        businessId: user.businessId!,
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah@example.com',
        phone: '+1 (555) 111-2222',
      },
    }),
    db.customer.create({
      data: {
        businessId: user.businessId!,
        firstName: 'Michael',
        lastName: 'Chen',
        email: 'michael@example.com',
        phone: '+1 (555) 333-4444',
      },
    }),
    db.customer.create({
      data: {
        businessId: user.businessId!,
        firstName: 'Emma',
        lastName: 'Williams',
        email: 'emma@example.com',
        phone: '+1 (555) 555-6666',
      },
    }),
  ])

  // Create demo appointments
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const nextWeek = new Date(today)
  nextWeek.setDate(nextWeek.getDate() + 7)

  await db.appointment.createMany({
    data: [
      {
        businessId: user.businessId!,
        customerId: customers[0].id,
        serviceId: user.business?.services[0].id || '',
        date: today,
        startTime: new Date(today.setHours(10, 0, 0, 0)),
        endTime: new Date(today.setHours(10, 30, 0, 0)),
        status: 'CONFIRMED',
      },
      {
        businessId: user.businessId!,
        customerId: customers[1].id,
        serviceId: user.business?.services[1].id || '',
        date: tomorrow,
        startTime: new Date(tomorrow.setHours(14, 0, 0, 0)),
        endTime: new Date(tomorrow.setHours(15, 30, 0, 0)),
        status: 'SCHEDULED',
      },
      {
        businessId: user.businessId!,
        customerId: customers[2].id,
        serviceId: user.business?.services[2].id || '',
        date: nextWeek,
        startTime: new Date(nextWeek.setHours(11, 0, 0, 0)),
        endTime: new Date(nextWeek.setHours(11, 20, 0, 0)),
        status: 'SCHEDULED',
      },
    ],
  })

  console.log('Seed completed!')
  console.log('Demo login: mayava891@gmail.com / mayava1122')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
