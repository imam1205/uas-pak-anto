import express from 'express';
import { storage } from './storage';

export interface AuthSession {
  userId?: string;
  isAuthenticated: boolean;
}

declare global {
  namespace Express {
    interface Request {
      session: AuthSession;
    }
  }
}

// Simple session middleware
export function setupSimpleAuth(app: express.Express) {
  // Initialize session for each request
  app.use((req, res, next) => {
    if (!req.session) {
      req.session = { isAuthenticated: false };
    }
    next();
  });
}

// Middleware to check if user is authenticated
export function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!req.session?.isAuthenticated || !req.session?.userId) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
}

// Login function
export async function login(username: string, password: string): Promise<{ success: boolean; user?: any; message?: string }> {
  try {
    const user = await storage.getUserByUsername(username);
    
    if (!user) {
      return { success: false, message: 'User not found' };
    }
    
    // Simple password check (in production, use proper hashing)
    if (user.password !== password) {
      return { success: false, message: 'Invalid password' };
    }
    
    return { 
      success: true, 
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    };
  } catch (error) {
    return { success: false, message: 'Login failed' };
  }
}

// Register function
export async function register(userData: {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role: "customer" | "business";
}): Promise<{ success: boolean; user?: any; message?: string }> {
  try {
    // Check if user already exists
    const existingUser = await storage.getUserByUsername(userData.username);
    if (existingUser) {
      return { success: false, message: 'Username already exists' };
    }
    
    const user = await storage.createUser(userData);
    
    return { 
      success: true, 
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    };
  } catch (error) {
    return { success: false, message: 'Registration failed' };
  }
}