import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertBusinessSchema, insertFacilitySchema, insertBookingSchema, insertReviewSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Update user role
  app.patch('/api/auth/user/role', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { role } = req.body;
      
      if (!["customer", "business"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }

      const user = await storage.upsertUser({
        id: userId,
        email: req.user.claims.email,
        firstName: req.user.claims.first_name,
        lastName: req.user.claims.last_name,
        profileImageUrl: req.user.claims.profile_image_url,
        role,
      });

      res.json(user);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  // Business routes
  app.post('/api/business', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const businessData = insertBusinessSchema.parse({ ...req.body, userId });
      
      const business = await storage.createBusiness(businessData);
      
      // Update user role to business
      await storage.upsertUser({
        id: userId,
        email: req.user.claims.email,
        firstName: req.user.claims.first_name,
        lastName: req.user.claims.last_name,
        profileImageUrl: req.user.claims.profile_image_url,
        role: "business",
      });

      res.json(business);
    } catch (error) {
      console.error("Error creating business:", error);
      res.status(500).json({ message: "Failed to create business" });
    }
  });

  app.get('/api/business/my', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const business = await storage.getBusinessByUserId(userId);
      res.json(business);
    } catch (error) {
      console.error("Error fetching business:", error);
      res.status(500).json({ message: "Failed to fetch business" });
    }
  });

  app.patch('/api/business/:id', isAuthenticated, async (req: any, res) => {
    try {
      const businessId = parseInt(req.params.id);
      const updates = req.body;
      
      const business = await storage.updateBusiness(businessId, updates);
      res.json(business);
    } catch (error) {
      console.error("Error updating business:", error);
      res.status(500).json({ message: "Failed to update business" });
    }
  });

  // Facility routes
  app.post('/api/facilities', isAuthenticated, async (req: any, res) => {
    try {
      const facilityData = insertFacilitySchema.parse(req.body);
      const facility = await storage.createFacility(facilityData);
      res.json(facility);
    } catch (error) {
      console.error("Error creating facility:", error);
      res.status(500).json({ message: "Failed to create facility" });
    }
  });

  app.get('/api/facilities/search', async (req, res) => {
    try {
      const { location, sportType, minPrice, maxPrice, date } = req.query;
      
      const filters: any = {};
      if (location) filters.location = location as string;
      if (sportType) filters.sportType = sportType as string;
      if (minPrice) filters.minPrice = parseFloat(minPrice as string);
      if (maxPrice) filters.maxPrice = parseFloat(maxPrice as string);
      if (date) filters.date = date as string;

      const facilities = await storage.searchFacilities(filters);
      res.json(facilities);
    } catch (error) {
      console.error("Error searching facilities:", error);
      res.status(500).json({ message: "Failed to search facilities" });
    }
  });

  app.get('/api/facilities/business/:businessId', isAuthenticated, async (req, res) => {
    try {
      const businessId = parseInt(req.params.businessId);
      const facilities = await storage.getFacilitiesByBusinessId(businessId);
      res.json(facilities);
    } catch (error) {
      console.error("Error fetching facilities:", error);
      res.status(500).json({ message: "Failed to fetch facilities" });
    }
  });

  app.get('/api/facilities/:id', async (req, res) => {
    try {
      const facilityId = parseInt(req.params.id);
      const facility = await storage.getFacilityById(facilityId);
      
      if (!facility) {
        return res.status(404).json({ message: "Facility not found" });
      }

      const rating = await storage.getFacilityRating(facilityId);
      res.json({ ...facility, ...rating });
    } catch (error) {
      console.error("Error fetching facility:", error);
      res.status(500).json({ message: "Failed to fetch facility" });
    }
  });

  app.patch('/api/facilities/:id', isAuthenticated, async (req, res) => {
    try {
      const facilityId = parseInt(req.params.id);
      const updates = req.body;
      
      const facility = await storage.updateFacility(facilityId, updates);
      res.json(facility);
    } catch (error) {
      console.error("Error updating facility:", error);
      res.status(500).json({ message: "Failed to update facility" });
    }
  });

  app.delete('/api/facilities/:id', isAuthenticated, async (req, res) => {
    try {
      const facilityId = parseInt(req.params.id);
      await storage.deleteFacility(facilityId);
      res.json({ message: "Facility deleted successfully" });
    } catch (error) {
      console.error("Error deleting facility:", error);
      res.status(500).json({ message: "Failed to delete facility" });
    }
  });

  // Booking routes
  app.post('/api/bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bookingData = insertBookingSchema.parse({ ...req.body, userId });
      
      // Check availability
      const isAvailable = await storage.checkTimeSlotAvailability(
        bookingData.facilityId,
        bookingData.bookingDate.toISOString().split('T')[0],
        bookingData.startTime,
        bookingData.endTime
      );

      if (!isAvailable) {
        return res.status(400).json({ message: "Time slot is not available" });
      }

      const booking = await storage.createBooking(bookingData);
      res.json(booking);
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  app.get('/api/bookings/my', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bookings = await storage.getBookingsByUserId(userId);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.get('/api/bookings/business/:businessId', isAuthenticated, async (req, res) => {
    try {
      const businessId = parseInt(req.params.businessId);
      const bookings = await storage.getBookingsByBusinessId(businessId);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching business bookings:", error);
      res.status(500).json({ message: "Failed to fetch business bookings" });
    }
  });

  app.patch('/api/bookings/:id/status', isAuthenticated, async (req, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      const { status, paymentStatus } = req.body;
      
      const booking = await storage.updateBookingStatus(bookingId, status, paymentStatus);
      res.json(booking);
    } catch (error) {
      console.error("Error updating booking status:", error);
      res.status(500).json({ message: "Failed to update booking status" });
    }
  });

  app.get('/api/bookings/availability/:facilityId', async (req, res) => {
    try {
      const facilityId = parseInt(req.params.facilityId);
      const { date, startTime, endTime } = req.query;
      
      const isAvailable = await storage.checkTimeSlotAvailability(
        facilityId,
        date as string,
        startTime as string,
        endTime as string
      );

      res.json({ available: isAvailable });
    } catch (error) {
      console.error("Error checking availability:", error);
      res.status(500).json({ message: "Failed to check availability" });
    }
  });

  // Review routes
  app.post('/api/reviews', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reviewData = insertReviewSchema.parse({ ...req.body, userId });
      
      const review = await storage.createReview(reviewData);
      res.json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  app.get('/api/reviews/facility/:facilityId', async (req, res) => {
    try {
      const facilityId = parseInt(req.params.facilityId);
      const reviews = await storage.getReviewsByFacilityId(facilityId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
