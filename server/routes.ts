import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { login, register } from "./auth";

// Simple session storage in memory (for demo purposes)
const sessions = new Map<string, { userId: string; expires: Date }>();

function generateSessionId(): string {
        return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function isAuthenticated(req: any): {
        isAuthenticated: boolean;
        userId?: string;
} {
        const sessionId =
                req.headers.authorization?.replace("Bearer ", "") ||
                req.cookies?.sessionId;

        if (!sessionId) {
                return { isAuthenticated: false };
        }

        const session = sessions.get(sessionId);
        if (!session || session.expires < new Date()) {
                sessions.delete(sessionId);
                return { isAuthenticated: false };
        }

        return { isAuthenticated: true, userId: session.userId };
}

function requireAuth(req: any, res: any, next: any) {
        const auth = isAuthenticated(req);
        if (!auth.isAuthenticated) {
                return res.status(401).json({ message: "Authentication required" });
        }
        req.userId = auth.userId;
        next();
}

export async function registerRoutes(app: Express): Promise<Server> {
        // Auth routes
        app.post("/api/auth/login", async (req, res) => {
                try {
                        const { username, password } = req.body;

                        if (!username || !password) {
                                return res
                                        .status(400)
                                        .json({ message: "Username and password required" });
                        }

                        const result = await login(username, password);

                        if (!result.success) {
                                return res.status(401).json({ message: result.message });
                        }

                        // Create session
                        const sessionId = generateSessionId();
                        const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
                        sessions.set(sessionId, { userId: result.user!.id, expires });

                        res.cookie("sessionId", sessionId, {
                                httpOnly: true,
                                expires,
                                sameSite: "strict",
                        });

                        res.json({
                                success: true,
                                user: result.user,
                                sessionId,
                        });
                } catch (error) {
                        console.error("Login error:", error);
                        res.status(500).json({ message: "Login failed" });
                }
        });

        app.post("/api/auth/register", async (req, res) => {
                try {
                        const { username, email, password, firstName, lastName, role } =
                                req.body;

                        if (!username || !email || !password || !role) {
                                return res.status(400).json({
                                        message: "Username, email, password, and role are required",
                                });
                        }

                        if (!["customer", "business"].includes(role)) {
                                return res.status(400).json({
                                        message: 'Role must be either "customer" or "business"',
                                });
                        }

                        const result = await register({
                                username,
                                email,
                                password,
                                firstName,
                                lastName,
                                role,
                        });

                        if (!result.success) {
                                return res.status(400).json({ message: result.message });
                        }

                        // Create session for new user
                        const sessionId = generateSessionId();
                        const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
                        sessions.set(sessionId, { userId: result.user!.id, expires });

                        res.cookie("sessionId", sessionId, {
                                // httpOnly: true,
                                expires,
                                sameSite: "strict",
                        });

                        res.json({
                                success: true,
                                user: result.user,
                                sessionId,
                        });
                } catch (error) {
                        console.error("Registration error:", error);
                        res.status(500).json({ message: "Registration failed" });
                }
        });

        app.post("/api/auth/logout", (req, res) => {
                const sessionId = req.cookies?.sessionId;
                if (sessionId) {
                        sessions.delete(sessionId);
                        res.clearCookie("sessionId");
                }
                res.json({ success: true, message: "Logged out successfully" });
        });

        app.get("/api/auth/user", (req, res) => {
                const auth = isAuthenticated(req);
                if (!auth.isAuthenticated) {
                        return res.status(401).json({ message: "Not authenticated" });
                }

                storage
                        .getUser(auth.userId!)
                        .then((user) => {
                                if (!user) {
                                        return res.status(404).json({ message: "User not found" });
                                }

                                const { password, ...userWithoutPassword } = user;
                                res.json(userWithoutPassword);
                        })
                        .catch((error) => {
                                console.error("Get user error:", error);
                                res.status(500).json({ message: "Failed to get user" });
                        });
        });

        // Business routes
        app.post("/api/businesses", requireAuth, async (req, res) => {
                try {
                        const user = await storage.getUser(req.userId);
                        if (!user || user.role !== "business") {
                                return res
                                        .status(403)
                                        .json({ message: "Business role required" });
                        }

                        const business = await storage.createBusiness({
                                ...req.body,
                                userId: req.userId,
                        });

                        res.json(business);
                } catch (error) {
                        console.error("Create business error:", error);
                        res.status(500).json({ message: "Failed to create business" });
                }
        });

        app.get("/api/businesses/my", requireAuth, async (req, res) => {
                try {
                        const business = await storage.getBusinessByUserId(req.userId);
                        res.json(business);
                } catch (error) {
                        console.error("Get business error:", error);
                        res.status(500).json({ message: "Failed to get business" });
                }
        });

        // Facility routes
        app.get("/api/facilities/search", async (req, res) => {
                try {
                        const filters = {
                                location: req.query.location as string,
                                sportType: req.query.sportType as string,
                                minPrice: req.query.minPrice
                                        ? Number(req.query.minPrice)
                                        : undefined,
                                maxPrice: req.query.maxPrice
                                        ? Number(req.query.maxPrice)
                                        : undefined,
                                date: req.query.date as string,
                        };

                        const facilities = await storage.searchFacilities(filters);
                        res.json(facilities);
                } catch (error) {
                        console.error("Search facilities error:", error);
                        res.status(500).json({ message: "Failed to search facilities" });
                }
        });

        app.post("/api/facilities", requireAuth, async (req, res) => {
                try {
                        const user = await storage.getUser(req.userId);
                        if (!user || user.role !== "business") {
                                return res
                                        .status(403)
                                        .json({ message: "Business role required" });
                        }

                        const business = await storage.getBusinessByUserId(req.userId);
                        if (!business) {
                                return res
                                        .status(400)
                                        .json({ message: "Business profile required" });
                        }

                        const facility = await storage.createFacility({
                                ...req.body,
                                businessId: business.id,
                        });

                        res.json(facility);
                } catch (error) {
                        console.error("Create facility error:", error);
                        res.status(500).json({ message: "Failed to create facility" });
                }
        });

        app.delete("/api/facilities/:id", async (req, res) => {
                try {
                        const id = Number(req.params.id);
                        const facilities = await storage.deleteFacility(id);
                        res.json(facilities);
                } catch (error) {
                        console.error("Delete facilities error:", error);
                        res.status(500).json({ message: "Failed to delete facilities" });
                }
        });

        app.get("/api/facilities/business/:businessId", async (req, res) => {
                try {
                        const businessId = Number(req.params.businessId);
                        const facilities = await storage.getFacilitiesByBusinessId(
                                businessId
                        );
                        res.json(facilities);
                } catch (error) {
                        console.error("Get facilities error:", error);
                        res.status(500).json({ message: "Failed to get facilities" });
                }
        });

        app.get("/api/bookings/business/:businessId", async (req, res) => {
                try {
                        const businessId = Number(req.params.businessId);
                        const facilities = await storage.getBookingsByBusinessId(
                                businessId
                        );
                        res.json(facilities);
                } catch (error) {
                        console.error("Get facilities error:", error);
                        res.status(500).json({ message: "Failed to get facilities" });
                }
        });

        // Booking routes
        app.post("/api/bookings", requireAuth, async (req, res) => {
                try {
                        const booking = await storage.createBooking({
                                ...req.body,
                                userId: req.userId,
                        });

                        res.json(booking);
                } catch (error) {
                        console.error("Create booking error:", error);
                        res.status(500).json({ message: "Failed to create booking" });
                }
        });

        app.patch("/api/bookings/:bookingId/status", requireAuth, async (req, res) => {
                try {
                        const bookingId = Number(req.params.bookingId);
                        const { status, paymentStatus, cancellationReason } = req.body;
                        
                        const booking = await storage.updateBookingStatus(
                                bookingId,
                                status,
                                paymentStatus,
                                cancellationReason
                        );
                        res.json(booking);
                } catch (error) {
                        console.error("Update booking status error:", error);
                        res.status(500).json({ message: "Failed to update booking status" });
                }
        });

        // New endpoint for cancellation requests
        app.patch("/api/bookings/:bookingId/request-cancellation", requireAuth, async (req, res) => {
                try {
                        const bookingId = Number(req.params.bookingId);
                        const { cancellationReason } = req.body;
                        
                        const booking = await storage.updateBookingStatus(
                                bookingId,
                                "cancellation_requested",
                                undefined,
                                cancellationReason
                        );
                        res.json(booking);
                } catch (error) {
                        console.error("Request cancellation error:", error);
                        res.status(500).json({ message: "Failed to request cancellation" });
                }
        });

        app.get("/api/bookings/my", requireAuth, async (req, res) => {
                try {
                        const bookings = await storage.getBookingsByUserId(req.userId);
                        res.json(bookings);
                } catch (error) {
                        console.error("Get bookings error:", error);
                        res.status(500).json({ message: "Failed to get bookings" });
                }
        });

        // Review routes
        app.post("/api/reviews", requireAuth, async (req, res) => {
                try {
                        const review = await storage.createReview({
                                ...req.body,
                                userId: req.userId,
                        });

                        res.json(review);
                } catch (error) {
                        console.error("Create review error:", error);
                        res.status(500).json({ message: "Failed to create review" });
                }
        });

        app.get("/api/reviews/facility/:facilityId", async (req, res) => {
                try {
                        const facilityId = Number(req.params.facilityId);
                        const reviews = await storage.getReviewsByFacilityId(facilityId);
                        res.json(reviews);
                } catch (error) {
                        console.error("Get reviews error:", error);
                        res.status(500).json({ message: "Failed to get reviews" });
                }
        });

        const httpServer = createServer(app);
        return httpServer;
}
