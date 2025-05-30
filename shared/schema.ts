import { z } from "zod";

// User interfaces
export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role: "customer" | "business";
  createdAt: Date;
  updatedAt: Date;
}

export interface Business {
  id: number;
  userId: string;
  businessName: string;
  description?: string;
  address: string;
  phone?: string;
  website?: string;
  operatingHours?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface Facility {
  id: number;
  businessId: number;
  name: string;
  description?: string;
  sportType: string;
  capacity: number;
  pricePerHour: string;
  facilities?: string[];
  images?: string[];
  isActive: boolean;
  operatingHours?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface Booking {
  id: number;
  userId: string;
  facilityId: number;
  bookingDate: Date;
  startTime: string;
  endTime: string;
  duration: number;
  totalPrice: string;
  customerName: string;
  customerPhone: string;
  status: string;
  paymentStatus: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  id: number;
  userId: string;
  facilityId: number;
  bookingId?: number;
  rating: number;
  comment?: string;
  createdAt: Date;
}

// Validation schemas
export const insertBusinessSchema = z.object({
  userId: z.string(),
  businessName: z.string().min(1),
  description: z.string().optional(),
  address: z.string().min(1),
  phone: z.string().optional(),
  website: z.string().optional(),
  operatingHours: z.any().optional(),
});

export const insertFacilitySchema = z.object({
  businessId: z.number(),
  name: z.string().min(1),
  description: z.string().optional(),
  sportType: z.string().min(1),
  capacity: z.number().min(1),
  pricePerHour: z.string(),
  facilities: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  operatingHours: z.any().optional(),
});

export const insertBookingSchema = z.object({
  userId: z.string(),
  facilityId: z.number(),
  bookingDate: z.date(),
  startTime: z.string(),
  endTime: z.string(),
  duration: z.number(),
  totalPrice: z.number(),
  customerName: z.string().min(1),
  customerPhone: z.string().min(1),
  notes: z.string().optional(),
});

export const insertReviewSchema = z.object({
  userId: z.string(),
  facilityId: z.number(),
  bookingId: z.number().optional(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

export type InsertBusiness = z.infer<typeof insertBusinessSchema>;
export type InsertFacility = z.infer<typeof insertFacilitySchema>;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type InsertReview = z.infer<typeof insertReviewSchema>;
