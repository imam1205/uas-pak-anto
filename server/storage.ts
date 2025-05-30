import {
  users,
  businesses,
  facilities,
  bookings,
  reviews,
  type User,
  type UpsertUser,
  type Business,
  type InsertBusiness,
  type Facility,
  type InsertFacility,
  type Booking,
  type InsertBooking,
  type Review,
  type InsertReview,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, desc, asc, sql, ilike, or } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Business operations
  createBusiness(business: InsertBusiness): Promise<Business>;
  getBusinessByUserId(userId: string): Promise<Business | undefined>;
  updateBusiness(id: number, updates: Partial<InsertBusiness>): Promise<Business>;

  // Facility operations
  createFacility(facility: InsertFacility): Promise<Facility>;
  getFacilitiesByBusinessId(businessId: number): Promise<Facility[]>;
  getFacilityById(id: number): Promise<Facility | undefined>;
  updateFacility(id: number, updates: Partial<InsertFacility>): Promise<Facility>;
  deleteFacility(id: number): Promise<void>;
  searchFacilities(filters: {
    location?: string;
    sportType?: string;
    minPrice?: number;
    maxPrice?: number;
    date?: string;
  }): Promise<(Facility & { business: Business; averageRating: number; reviewCount: number })[]>;

  // Booking operations
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBookingsByUserId(userId: string): Promise<(Booking & { facility: Facility; business: Business })[]>;
  getBookingsByFacilityId(facilityId: number): Promise<(Booking & { user: User })[]>;
  getBookingsByBusinessId(businessId: number): Promise<(Booking & { facility: Facility; user: User })[]>;
  updateBookingStatus(id: number, status: string, paymentStatus?: string): Promise<Booking>;
  getBookingById(id: number): Promise<Booking | undefined>;
  checkTimeSlotAvailability(facilityId: number, date: string, startTime: string, endTime: string): Promise<boolean>;

  // Review operations
  createReview(review: InsertReview): Promise<Review>;
  getReviewsByFacilityId(facilityId: number): Promise<(Review & { user: User })[]>;
  getFacilityRating(facilityId: number): Promise<{ averageRating: number; reviewCount: number }>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Business operations
  async createBusiness(business: InsertBusiness): Promise<Business> {
    const [newBusiness] = await db.insert(businesses).values(business).returning();
    return newBusiness;
  }

  async getBusinessByUserId(userId: string): Promise<Business | undefined> {
    const [business] = await db.select().from(businesses).where(eq(businesses.userId, userId));
    return business;
  }

  async updateBusiness(id: number, updates: Partial<InsertBusiness>): Promise<Business> {
    const [business] = await db
      .update(businesses)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(businesses.id, id))
      .returning();
    return business;
  }

  // Facility operations
  async createFacility(facility: InsertFacility): Promise<Facility> {
    const [newFacility] = await db.insert(facilities).values(facility).returning();
    return newFacility;
  }

  async getFacilitiesByBusinessId(businessId: number): Promise<Facility[]> {
    return await db.select().from(facilities).where(eq(facilities.businessId, businessId));
  }

  async getFacilityById(id: number): Promise<Facility | undefined> {
    const [facility] = await db.select().from(facilities).where(eq(facilities.id, id));
    return facility;
  }

  async updateFacility(id: number, updates: Partial<InsertFacility>): Promise<Facility> {
    const [facility] = await db
      .update(facilities)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(facilities.id, id))
      .returning();
    return facility;
  }

  async deleteFacility(id: number): Promise<void> {
    await db.delete(facilities).where(eq(facilities.id, id));
  }

  async searchFacilities(filters: {
    location?: string;
    sportType?: string;
    minPrice?: number;
    maxPrice?: number;
    date?: string;
  }): Promise<(Facility & { business: Business; averageRating: number; reviewCount: number })[]> {
    let query = db
      .select({
        id: facilities.id,
        businessId: facilities.businessId,
        name: facilities.name,
        description: facilities.description,
        sportType: facilities.sportType,
        capacity: facilities.capacity,
        pricePerHour: facilities.pricePerHour,
        facilities: facilities.facilities,
        images: facilities.images,
        isActive: facilities.isActive,
        operatingHours: facilities.operatingHours,
        createdAt: facilities.createdAt,
        updatedAt: facilities.updatedAt,
        business: businesses,
        averageRating: sql<number>`COALESCE(AVG(${reviews.rating}), 0)`,
        reviewCount: sql<number>`COUNT(${reviews.id})`,
      })
      .from(facilities)
      .leftJoin(businesses, eq(facilities.businessId, businesses.id))
      .leftJoin(reviews, eq(facilities.id, reviews.facilityId))
      .where(eq(facilities.isActive, true))
      .groupBy(facilities.id, businesses.id);

    const conditions = [eq(facilities.isActive, true)];

    if (filters.location) {
      conditions.push(ilike(businesses.address, `%${filters.location}%`));
    }

    if (filters.sportType && filters.sportType !== "Semua Olahraga") {
      conditions.push(eq(facilities.sportType, filters.sportType));
    }

    if (filters.minPrice) {
      conditions.push(gte(facilities.pricePerHour, filters.minPrice.toString()));
    }

    if (filters.maxPrice) {
      conditions.push(lte(facilities.pricePerHour, filters.maxPrice.toString()));
    }

    if (conditions.length > 1) {
      query = query.where(and(...conditions));
    }

    return await query;
  }

  // Booking operations
  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [newBooking] = await db.insert(bookings).values(booking).returning();
    return newBooking;
  }

  async getBookingsByUserId(userId: string): Promise<(Booking & { facility: Facility; business: Business })[]> {
    return await db
      .select({
        id: bookings.id,
        userId: bookings.userId,
        facilityId: bookings.facilityId,
        bookingDate: bookings.bookingDate,
        startTime: bookings.startTime,
        endTime: bookings.endTime,
        duration: bookings.duration,
        totalPrice: bookings.totalPrice,
        customerName: bookings.customerName,
        customerPhone: bookings.customerPhone,
        status: bookings.status,
        paymentStatus: bookings.paymentStatus,
        notes: bookings.notes,
        createdAt: bookings.createdAt,
        updatedAt: bookings.updatedAt,
        facility: facilities,
        business: businesses,
      })
      .from(bookings)
      .leftJoin(facilities, eq(bookings.facilityId, facilities.id))
      .leftJoin(businesses, eq(facilities.businessId, businesses.id))
      .where(eq(bookings.userId, userId))
      .orderBy(desc(bookings.createdAt));
  }

  async getBookingsByFacilityId(facilityId: number): Promise<(Booking & { user: User })[]> {
    return await db
      .select({
        id: bookings.id,
        userId: bookings.userId,
        facilityId: bookings.facilityId,
        bookingDate: bookings.bookingDate,
        startTime: bookings.startTime,
        endTime: bookings.endTime,
        duration: bookings.duration,
        totalPrice: bookings.totalPrice,
        customerName: bookings.customerName,
        customerPhone: bookings.customerPhone,
        status: bookings.status,
        paymentStatus: bookings.paymentStatus,
        notes: bookings.notes,
        createdAt: bookings.createdAt,
        updatedAt: bookings.updatedAt,
        user: users,
      })
      .from(bookings)
      .leftJoin(users, eq(bookings.userId, users.id))
      .where(eq(bookings.facilityId, facilityId))
      .orderBy(desc(bookings.createdAt));
  }

  async getBookingsByBusinessId(businessId: number): Promise<(Booking & { facility: Facility; user: User })[]> {
    return await db
      .select({
        id: bookings.id,
        userId: bookings.userId,
        facilityId: bookings.facilityId,
        bookingDate: bookings.bookingDate,
        startTime: bookings.startTime,
        endTime: bookings.endTime,
        duration: bookings.duration,
        totalPrice: bookings.totalPrice,
        customerName: bookings.customerName,
        customerPhone: bookings.customerPhone,
        status: bookings.status,
        paymentStatus: bookings.paymentStatus,
        notes: bookings.notes,
        createdAt: bookings.createdAt,
        updatedAt: bookings.updatedAt,
        facility: facilities,
        user: users,
      })
      .from(bookings)
      .leftJoin(facilities, eq(bookings.facilityId, facilities.id))
      .leftJoin(users, eq(bookings.userId, users.id))
      .where(eq(facilities.businessId, businessId))
      .orderBy(desc(bookings.createdAt));
  }

  async updateBookingStatus(id: number, status: string, paymentStatus?: string): Promise<Booking> {
    const updates: any = { status, updatedAt: new Date() };
    if (paymentStatus) {
      updates.paymentStatus = paymentStatus;
    }

    const [booking] = await db
      .update(bookings)
      .set(updates)
      .where(eq(bookings.id, id))
      .returning();
    return booking;
  }

  async getBookingById(id: number): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking;
  }

  async checkTimeSlotAvailability(facilityId: number, date: string, startTime: string, endTime: string): Promise<boolean> {
    const existingBookings = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.facilityId, facilityId),
          eq(sql`DATE(${bookings.bookingDate})`, date),
          or(
            and(gte(bookings.startTime, startTime), lte(bookings.startTime, endTime)),
            and(gte(bookings.endTime, startTime), lte(bookings.endTime, endTime)),
            and(lte(bookings.startTime, startTime), gte(bookings.endTime, endTime))
          ),
          eq(bookings.status, "confirmed")
        )
      );

    return existingBookings.length === 0;
  }

  // Review operations
  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    return newReview;
  }

  async getReviewsByFacilityId(facilityId: number): Promise<(Review & { user: User })[]> {
    return await db
      .select({
        id: reviews.id,
        userId: reviews.userId,
        facilityId: reviews.facilityId,
        bookingId: reviews.bookingId,
        rating: reviews.rating,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
        user: users,
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.facilityId, facilityId))
      .orderBy(desc(reviews.createdAt));
  }

  async getFacilityRating(facilityId: number): Promise<{ averageRating: number; reviewCount: number }> {
    const [result] = await db
      .select({
        averageRating: sql<number>`COALESCE(AVG(${reviews.rating}), 0)`,
        reviewCount: sql<number>`COUNT(${reviews.id})`,
      })
      .from(reviews)
      .where(eq(reviews.facilityId, facilityId));

    return result || { averageRating: 0, reviewCount: 0 };
  }
}

export const storage = new DatabaseStorage();
