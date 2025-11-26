import { db, users, type User } from "@/lib/db";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

const DEFAULT_USER_EMAIL = "user@local.app";
const DEFAULT_USER_NAME = "Local User";

/**
 * Get or create the local user
 * Since this is a single-user local-first app, we auto-create one user
 */
export async function getOrCreateLocalUser(): Promise<User> {
  // Try to find existing user
  const existingUsers = await db.select().from(users).limit(1);

  if (existingUsers.length > 0) {
    return existingUsers[0];
  }

  // Create default local user
  const newUser: typeof users.$inferInsert = {
    id: uuidv4(),
    email: DEFAULT_USER_EMAIL,
    name: DEFAULT_USER_NAME,
  };

  await db.insert(users).values(newUser);

  // Return the created user
  const [createdUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, newUser.id));

  return createdUser;
}

/**
 * Get user by ID
 */
export async function getUserById(id: string): Promise<User | null> {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user || null;
}

/**
 * Update user profile
 */
export async function updateUser(
  id: string,
  data: Partial<Pick<User, "name" | "email">>
): Promise<User | null> {
  await db.update(users).set(data).where(eq(users.id, id));
  return getUserById(id);
}
