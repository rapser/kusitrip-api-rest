import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Loads the KusiTrip catalog (destinations, activities and reviews taken from
 * civitatis.com/es — Peru and South America) plus two demo users.
 * Idempotent: every row is upserted, so it can be re-run safely.
 */

interface CategorySeed {
  id: string;
  name: string;
  icon: string;
  sortOrder: number;
}

interface DestinationSeed {
  id: string;
  name: string;
  country: string;
  continent: string;
  imageUrl: string;
  activityCount: number;
  travelerCount: number;
  reviewCount: number;
  rating: number;
  description: string;
  sortOrder: number;
}

interface ActivitySeed {
  id: string;
  slug: string;
  destinationId: string;
  categoryId: string;
  title: string;
  summary: string;
  description: string;
  price: number;
  originalPrice: number | null;
  currency: string;
  rating: number;
  reviewCount: number;
  travelerCount: number;
  durationMinutes: number;
  language: string;
  freeCancellationDays: number;
  meetingPoint: string;
  includes: string[];
  imageUrls: string[];
  isFeatured: boolean;
  sourceUrl: string;
}

interface ReviewSeed {
  id: string;
  activityId: string;
  authorName: string;
  city?: string;
  rating: number;
  comment: string;
  travelType?: string;
  publishedAt: string;
}

const DEMO_USERS = [
  {
    name: 'Miguel',
    surname: 'Tomairo',
    email: 'usuario@kusitrip.com',
    password: 'kusitrip123',
  },
  {
    name: 'Ana',
    surname: 'García',
    email: 'ana@kusitrip.com',
    password: 'ana12345',
  },
];

/** Set SEED_DEMO_USERS=false to load only the catalog (e.g. in production). */
const seedDemoUsers = process.env.SEED_DEMO_USERS !== 'false';

const prisma = new PrismaClient();

function load<T>(file: string): T {
  return JSON.parse(readFileSync(join(__dirname, 'data', file), 'utf-8')) as T;
}

async function main() {
  const categories = load<CategorySeed[]>('categories.json');
  const destinations = load<DestinationSeed[]>('destinations.json');
  const activities = load<ActivitySeed[]>('activities.json');
  const reviews = load<ReviewSeed[]>('reviews.json');

  for (const category of categories) {
    await prisma.category.upsert({
      where: { id: category.id },
      update: category,
      create: category,
    });
  }

  for (const destination of destinations) {
    await prisma.destination.upsert({
      where: { id: destination.id },
      update: destination,
      create: destination,
    });
  }

  for (const activity of activities) {
    await prisma.activity.upsert({
      where: { id: activity.id },
      update: activity,
      create: activity,
    });
  }

  for (const review of reviews) {
    const data = { ...review, publishedAt: new Date(review.publishedAt) };
    await prisma.review.upsert({
      where: { id: review.id },
      update: data,
      create: data,
    });
  }

  const demoUsers = seedDemoUsers ? DEMO_USERS : [];
  for (const user of demoUsers) {
    const passwordHash = await bcrypt.hash(user.password, 10);
    await prisma.user.upsert({
      where: { email: user.email },
      update: { name: user.name, surname: user.surname, passwordHash },
      create: {
        name: user.name,
        surname: user.surname,
        email: user.email,
        passwordHash,
      },
    });
  }

  console.log(
    `Seeded ${categories.length} categories, ${destinations.length} destinations, ` +
      `${activities.length} activities, ${reviews.length} reviews, ${demoUsers.length} users`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
