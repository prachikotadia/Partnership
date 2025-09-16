import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create demo users
  const hashedPassword = await bcrypt.hash('password123', 12);

  const person1 = await prisma.user.upsert({
    where: { email: 'person1@example.com' },
    update: {},
    create: {
      email: 'person1@example.com',
      name: 'Person1',
      password: hashedPassword,
      color: '#667eea',
      isActive: true,
    },
  });

  const person2 = await prisma.user.upsert({
    where: { email: 'person2@example.com' },
    update: {},
    create: {
      email: 'person2@example.com',
      name: 'Person2',
      password: hashedPassword,
      color: '#764ba2',
      isActive: true,
    },
  });

  // Connect them as partners
  await prisma.user.update({
    where: { id: person1.id },
    data: { partnerId: person2.id }
  });

  await prisma.user.update({
    where: { id: person2.id },
    data: { partnerId: person1.id }
  });

  // Create user preferences
  await prisma.userPreferences.upsert({
    where: { userId: person1.id },
    update: {},
    create: {
      userId: person1.id,
      theme: 'light',
      language: 'en',
      timezone: 'UTC',
      notifications: true,
      emailNotifications: true,
      pushNotifications: true,
    },
  });

  await prisma.userPreferences.upsert({
    where: { userId: person2.id },
    update: {},
    create: {
      userId: person2.id,
      theme: 'light',
      language: 'en',
      timezone: 'UTC',
      notifications: true,
      emailNotifications: true,
      pushNotifications: true,
    },
  });

  // Create sample tasks
  const tasks = [
    {
      title: 'Plan weekend getaway',
      description: 'Research destinations and book accommodation',
      priority: 'HIGH' as const,
      assignedTo: 'Person1',
      userId: person1.id,
    },
    {
      title: 'Buy groceries for the week',
      description: 'Get ingredients for meal prep',
      priority: 'MEDIUM' as const,
      assignedTo: 'Person2',
      userId: person1.id,
    },
    {
      title: 'Schedule dentist appointment',
      description: 'Book checkup for both of us',
      priority: 'LOW' as const,
      assignedTo: 'Person1',
      userId: person2.id,
    },
  ];

  for (const taskData of tasks) {
    const task = await prisma.task.create({
      data: taskData,
    });

    // Add some subtasks
    if (task.title === 'Plan weekend getaway') {
      await prisma.subtask.createMany({
        data: [
          {
            title: 'Research destinations',
            taskId: task.id,
            assignedTo: 'Person1',
          },
          {
            title: 'Check flight prices',
            taskId: task.id,
            assignedTo: 'Person2',
          },
          {
            title: 'Book accommodation',
            taskId: task.id,
            assignedTo: 'Person1',
          },
        ],
      });
    }
  }

  // Create sample notes
  const notes = [
    {
      title: 'Wedding Planning Ideas',
      content: 'We should start thinking about venues and guest list. Maybe a small intimate ceremony?',
      category: 'Planning',
      tags: ['wedding', 'planning', 'future'],
      isPinned: true,
      isShared: true,
      userId: person1.id,
    },
    {
      title: 'Recipe Collection',
      content: 'Pasta carbonara recipe:\n- 200g spaghetti\n- 100g pancetta\n- 2 eggs\n- 50g parmesan',
      category: 'Food',
      tags: ['recipe', 'cooking', 'italian'],
      isPinned: false,
      isShared: true,
      userId: person2.id,
    },
    {
      title: 'Travel Bucket List',
      content: 'Places we want to visit together:\n1. Japan (cherry blossom season)\n2. Iceland (northern lights)\n3. Italy (food tour)',
      category: 'Travel',
      tags: ['travel', 'bucket-list', 'dreams'],
      isPinned: true,
      isShared: true,
      userId: person1.id,
    },
  ];

  for (const noteData of notes) {
    await prisma.note.create({
      data: noteData,
    });
  }

  // Create sample check-ins
  const checkIns = [
    {
      mood: 'happy',
      emoji: '😊',
      note: 'Had a great day at work! Looking forward to the weekend.',
      energy: 8,
      gratitude: 'Grateful for my supportive partner',
      goals: ['Exercise', 'Read a book'],
      partnerMessage: 'Can\'t wait to see you tonight!',
      isShared: true,
      userId: person1.id,
    },
    {
      mood: 'excited',
      emoji: '🎉',
      note: 'Just finished a big project! Time to celebrate.',
      energy: 9,
      gratitude: 'Grateful for good health and opportunities',
      goals: ['Plan vacation', 'Learn new skill'],
      partnerMessage: 'You\'re amazing! So proud of you!',
      isShared: true,
      userId: person2.id,
    },
  ];

  for (const checkInData of checkIns) {
    await prisma.checkIn.create({
      data: checkInData,
    });
  }

  // Create sample streaks
  const streaks = [
    {
      type: 'daily-checkin',
      currentStreak: 5,
      longestStreak: 12,
      goal: 30,
      lastActivity: new Date(),
      userId: person1.id,
    },
    {
      type: 'exercise',
      currentStreak: 3,
      longestStreak: 7,
      goal: 21,
      lastActivity: new Date(),
      userId: person1.id,
    },
    {
      type: 'daily-checkin',
      currentStreak: 7,
      longestStreak: 15,
      goal: 30,
      lastActivity: new Date(),
      userId: person2.id,
    },
  ];

  for (const streakData of streaks) {
    await prisma.streak.create({
      data: streakData,
    });
  }

  // Create sample bucket list items
  const bucketListItems = [
    {
      title: 'Visit Japan during cherry blossom season',
      description: 'Experience the beauty of sakura and Japanese culture',
      category: 'Travel',
      priority: 'HIGH' as const,
      status: 'PLANNED' as const,
      cost: 5000,
      timeEstimate: '2 weeks',
      difficulty: 'medium',
      progress: 20,
      assignedTo: 'Person1',
      userId: person1.id,
    },
    {
      title: 'Learn to cook authentic Italian pasta',
      description: 'Take cooking classes in Italy',
      category: 'Learning',
      priority: 'MEDIUM' as const,
      status: 'IN_PROGRESS' as const,
      cost: 2000,
      timeEstimate: '1 week',
      difficulty: 'hard',
      progress: 60,
      assignedTo: 'Person2',
      userId: person2.id,
    },
    {
      title: 'Run a marathon together',
      description: 'Train and complete a full marathon as a couple',
      category: 'Fitness',
      priority: 'HIGH' as const,
      status: 'PLANNED' as const,
      cost: 500,
      timeEstimate: '6 months',
      difficulty: 'hard',
      progress: 10,
      assignedTo: 'Both',
      userId: person1.id,
    },
  ];

  for (const itemData of bucketListItems) {
    await prisma.bucketListItem.create({
      data: itemData,
    });
  }

  // Create sample schedule items
  const scheduleItems = [
    {
      title: 'Date Night',
      description: 'Dinner at our favorite restaurant',
      startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // 3 hours later
      isAllDay: false,
      location: 'The Romantic Bistro',
      mood: 'romantic',
      assignedTo: 'Both',
      userId: person1.id,
    },
    {
      title: 'Weekend Hiking Trip',
      description: 'Explore the mountain trails',
      startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      endDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // 6 days from now
      isAllDay: true,
      location: 'Mountain National Park',
      mood: 'adventurous',
      assignedTo: 'Both',
      userId: person2.id,
    },
  ];

  for (const itemData of scheduleItems) {
    await prisma.scheduleItem.create({
      data: itemData,
    });
  }

  // Create sample finance entries
  const financeEntries = [
    {
      title: 'Salary',
      description: 'Monthly salary',
      amount: 5000,
      currency: 'USD',
      category: 'Income',
      type: 'INCOME' as const,
      date: new Date(),
      assignedTo: 'Person1',
      userId: person1.id,
    },
    {
      title: 'Groceries',
      description: 'Weekly grocery shopping',
      amount: 150,
      currency: 'USD',
      category: 'Food',
      type: 'EXPENSE' as const,
      date: new Date(),
      assignedTo: 'Person2',
      userId: person1.id,
    },
    {
      title: 'Emergency Fund',
      description: 'Monthly savings contribution',
      amount: 500,
      currency: 'USD',
      category: 'Savings',
      type: 'SAVINGS' as const,
      date: new Date(),
      assignedTo: 'Both',
      userId: person2.id,
    },
  ];

  for (const entryData of financeEntries) {
    await prisma.financeEntry.create({
      data: entryData,
    });
  }

  // Create sample notifications
  const notifications = [
    {
      title: 'Welcome to Together!',
      message: 'Start your journey of collaboration and connection.',
      type: 'welcome',
      isRead: true,
      userId: person1.id,
    },
    {
      title: 'Partner Connected',
      message: 'Person2 has joined your partnership!',
      type: 'partner',
      isRead: true,
      userId: person1.id,
    },
    {
      title: 'New Task Assigned',
      message: 'You have a new task: Plan weekend getaway',
      type: 'task',
      isRead: false,
      userId: person1.id,
    },
  ];

  for (const notificationData of notifications) {
    await prisma.notification.create({
      data: notificationData,
    });
  }

  console.log('✅ Database seeded successfully!');
  console.log(`👤 Created users: ${person1.name} and ${person2.name}`);
  console.log('📝 Created sample data for all features');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
