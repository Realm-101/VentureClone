import bcrypt from 'bcrypt';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const db = drizzle(pool);

const SALT_ROUNDS = 10;

export interface AuthUser {
  id: string;
  username: string;
  email: string | null;
}

export class AuthService {
  /**
   * Register a new user
   */
  static async register(email: string, password: string, username?: string): Promise<AuthUser> {
    // Validate email
    if (!email || !email.includes('@')) {
      throw new Error('Valid email is required');
    }

    // Validate password
    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    // Check if user already exists
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.username, email))
      .limit(1);

    if (existing.length > 0) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const result = await db
      .insert(users)
      .values({
        username: email, // Use email as username for now
        password: hashedPassword,
      })
      .returning();

    const newUser = result[0];
    if (!newUser) {
      throw new Error('Failed to create user');
    }

    return {
      id: newUser.id,
      username: newUser.username,
      email: newUser.username, // Email is stored in username field
    };
  }

  /**
   * Login user
   */
  static async login(email: string, password: string): Promise<AuthUser> {
    // Find user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, email))
      .limit(1);

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new Error('Invalid email or password');
    }

    return {
      id: user.id,
      username: user.username,
      email: user.username,
    };
  }

  /**
   * Get user by ID
   */
  static async getUserById(id: string): Promise<AuthUser | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      username: user.username,
      email: user.username,
    };
  }
}
