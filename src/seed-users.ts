import bcrypt from 'bcryptjs';
import { connectDatabase } from './config/database';
import { User } from './models/User';

async function seedUsers() {
  await connectDatabase();

  const users = [
    {
      name: 'Alice Johnson',
      email: 'alice@example.com',
      password: 'password123',
      credits: 3,
    },
    {
      name: 'Bob Smith',
      email: 'bob@example.com',
      password: 'password123',
      credits: 0,
    },
  ];

  for (const userData of users) {
    const existingUser = await User.findOne({ email: userData.email });

    if (existingUser) {
      existingUser.name = userData.name;
      existingUser.passwordHash = await bcrypt.hash(userData.password, 10);
      existingUser.credits = userData.credits;
      await existingUser.save();
      console.log(`Updated user: ${userData.email}`);
      continue;
    }

    const passwordHash = await bcrypt.hash(userData.password, 10);
    const user = new User({
      name: userData.name,
      email: userData.email,
      passwordHash,
      credits: userData.credits,
    });

    await user.save();
    console.log(`Created user: ${userData.email}`);
  }

  console.log('Seed complete.');
}

seedUsers().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
