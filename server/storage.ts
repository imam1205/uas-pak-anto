import {
        type User,
        type Business,
        type InsertBusiness,
        type Facility,
        type InsertFacility,
        type Booking,
        type InsertBooking,
        type Review,
        type InsertReview,
} from "@shared/schema";

export interface IStorage {
        // User operations
        getUser(id: string): Promise<User | undefined>;
        getUserByUsername(username: string): Promise<User | undefined>;
        createUser(
                user: Omit<User, "id" | "createdAt" | "updatedAt">
        ): Promise<User>;
        updateUserRole(id: string, role: "customer" | "business"): Promise<User>;

        // Business operations
        createBusiness(business: InsertBusiness): Promise<Business>;
        getBusinessByUserId(userId: string): Promise<Business | undefined>;
        updateBusiness(
                id: number,
                updates: Partial<InsertBusiness>
        ): Promise<Business>;

        // Facility operations
        createFacility(facility: InsertFacility): Promise<Facility>;
        getFacilitiesByBusinessId(businessId: number): Promise<Facility[]>;
        getFacilityById(id: number): Promise<Facility | undefined>;
        updateFacility(
                id: number,
                updates: Partial<InsertFacility>
        ): Promise<Facility>;
        deleteFacility(id: number): Promise<void>;
        searchFacilities(filters: {
                location?: string;
                sportType?: string;
                minPrice?: number;
                maxPrice?: number;
                date?: string;
        }): Promise<
                (Facility & {
                        business: Business;
                        averageRating: number;
                        reviewCount: number;
                })[]
        >;

        // Booking operations
        createBooking(booking: InsertBooking): Promise<Booking>;
        getBookingsByUserId(
                userId: string
        ): Promise<(Booking & { facility: Facility; business: Business })[]>;
        getBookingsByFacilityId(
                facilityId: number
        ): Promise<(Booking & { user: User })[]>;
        getBookingsByBusinessId(
                businessId: number
        ): Promise<(Booking & { facility: Facility; user: User })[]>;
        updateBookingStatus(
                id: number,
                status: "pending" | "approved" | "rejected" | "completed" | "cancelled" | "cancellation_requested",
                paymentStatus?: "pending" | "paid" | "failed" | "refunded",
                cancellationReason?: string
        ): Promise<Booking>;
        getBookingById(id: number): Promise<Booking | undefined>;
        checkTimeSlotAvailability(
                facilityId: number,
                date: string,
                startTime: string,
                endTime: string
        ): Promise<boolean>;

        // Review operations
        createReview(review: InsertReview): Promise<Review>;
        getReviewsByFacilityId(
                facilityId: number
        ): Promise<(Review & { user: User })[]>;
        getFacilityRating(
                facilityId: number
        ): Promise<{ averageRating: number; reviewCount: number }>;
}

// In-memory storage implementation
export class MemoryStorage implements IStorage {
        private users: Map<string, User> = new Map();
        private businesses: Map<number, Business> = new Map();
        private facilities: Map<number, Facility> = new Map();
        private bookings: Map<number, Booking> = new Map();
        private reviews: Map<number, Review> = new Map();

        private userCounter = 1;
        private businessCounter = 1;
        private facilityCounter = 1;
        private bookingCounter = 1;
        private reviewCounter = 1;

        constructor() {
                this.initializeSampleData();
        }

        private initializeSampleData() {
                // Sample users
                const sampleUsers: User[] = [
                        {
                                id: "1",
                                username: "customer1",
                                email: "customer@example.com",
                                password: "password123",
                                firstName: "John",
                                lastName: "Doe",
                                role: "customer",
                                createdAt: new Date(),
                                updatedAt: new Date(),
                        },
                        {
                                id: "2",
                                username: "business1",
                                email: "business@example.com",
                                password: "password123",
                                firstName: "Jane",
                                lastName: "Smith",
                                role: "business",
                                createdAt: new Date(),
                                updatedAt: new Date(),
                        },
                ];

                sampleUsers.forEach((user) => this.users.set(user.id, user));

                // Sample business
                const sampleBusiness: Business = {
                        id: 1,
                        userId: "2",
                        businessName: "Arena Sport Center",
                        description: "Pusat olahraga terlengkap dengan fasilitas modern",
                        address: "Jl. Sudirman No. 123, Jakarta Pusat",
                        phone: "021-1234567",
                        website: "https://arenasport.com",
                        operatingHours: {
                                monday: { open: "06:00", close: "24:00" },
                                tuesday: { open: "06:00", close: "24:00" },
                                wednesday: { open: "06:00", close: "24:00" },
                                thursday: { open: "06:00", close: "24:00" },
                                friday: { open: "06:00", close: "24:00" },
                                saturday: { open: "06:00", close: "24:00" },
                                sunday: { open: "06:00", close: "24:00" },
                        },
                        createdAt: new Date(),
                        updatedAt: new Date(),
                };

                this.businesses.set(sampleBusiness.id, sampleBusiness);

                // Sample facilities
                const sampleFacilities: Facility[] = [
                        {
                                id: 1,
                                businessId: 1,
                                name: "Lapangan Futsal A",
                                description: "Lapangan futsal sintetis dengan pencahayaan LED",
                                sportType: "futsal",
                                capacity: 12,
                                pricePerHour: "150000",
                                facilities: ["parking", "bathroom", "canteen", "wifi"],
                                images: [
                                        "https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3",
                                        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3",
                                ],
                                isActive: true,
                                operatingHours: {
                                        monday: { open: "06:00", close: "24:00" },
                                        tuesday: { open: "06:00", close: "24:00" },
                                        wednesday: { open: "06:00", close: "24:00" },
                                        thursday: { open: "06:00", close: "24:00" },
                                        friday: { open: "06:00", close: "24:00" },
                                        saturday: { open: "06:00", close: "24:00" },
                                        sunday: { open: "06:00", close: "24:00" },
                                },
                                averageRating: 4,
                                createdAt: new Date(),
                                updatedAt: new Date(),
                        },
                        {
                                id: 2,
                                businessId: 1,
                                name: "Lapangan Badminton 1",
                                description: "Lapangan badminton dengan standar BWF",
                                sportType: "badminton",
                                capacity: 4,
                                pricePerHour: "80000",
                                facilities: ["parking", "bathroom", "ac", "shower"],
                                images: [
                                        "https://images.unsplash.com/photo-1544717340-6e54dcfaff12?ixlib=rb-4.0.3",
                                ],
                                isActive: true,
                                operatingHours: {
                                        monday: { open: "06:00", close: "24:00" },
                                        tuesday: { open: "06:00", close: "24:00" },
                                        wednesday: { open: "06:00", close: "24:00" },
                                        thursday: { open: "06:00", close: "24:00" },
                                        friday: { open: "06:00", close: "24:00" },
                                        saturday: { open: "06:00", close: "24:00" },
                                        sunday: { open: "06:00", close: "24:00" },
                                },
                                averageRating: 3.6,
                                createdAt: new Date(),
                                updatedAt: new Date(),
                        },
                ];

                sampleFacilities.forEach((facility) =>
                        this.facilities.set(facility.id, facility)
                );

                this.userCounter = 3;
                this.businessCounter = 2;
                this.facilityCounter = 3;
        }

        // User operations
        async getUser(id: string): Promise<User | undefined> {
                return this.users.get(id);
        }

        async getUserByUsername(username: string): Promise<User | undefined> {
                for (const user of Array.from(this.users.values())) {
                        if (user.username === username) {
                                return user;
                        }
                }
                return undefined;
        }

        async createUser(
                userData: Omit<User, "id" | "createdAt" | "updatedAt">
        ): Promise<User> {
                const user: User = {
                        ...userData,
                        id: this.userCounter.toString(),
                        createdAt: new Date(),
                        updatedAt: new Date(),
                };
                this.users.set(user.id, user);
                this.userCounter++;
                return user;
        }

        async updateUserRole(
                id: string,
                role: "customer" | "business"
        ): Promise<User> {
                const user = this.users.get(id);
                if (!user) throw new Error("User not found");

                user.role = role;
                user.updatedAt = new Date();
                this.users.set(id, user);
                return user;
        }

        // Business operations
        async createBusiness(businessData: InsertBusiness): Promise<Business> {
                const business: Business = {
                        ...businessData,
                        id: this.businessCounter,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                };
                this.businesses.set(business.id, business);
                this.businessCounter++;
                return business;
        }

        async getBusinessByUserId(userId: string): Promise<Business | undefined> {
                for (const business of Array.from(this.businesses.values())) {
                        if (business.userId === userId) {
                                return business;
                        }
                }
                return undefined;
        }

        async updateBusiness(
                id: number,
                updates: Partial<InsertBusiness>
        ): Promise<Business> {
                const business = this.businesses.get(id);
                if (!business) throw new Error("Business not found");

                Object.assign(business, updates, { updatedAt: new Date() });
                this.businesses.set(id, business);
                return business;
        }

        // Facility operations
        async createFacility(facilityData: InsertFacility): Promise<Facility> {
                const facility: Facility = {
                        ...facilityData,
                        id: this.facilityCounter,
                        isActive: true,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                };
                this.facilities.set(facility.id, facility);
                this.facilityCounter++;
                return facility;
        }

        async getFacilitiesByBusinessId(businessId: number): Promise<Facility[]> {
                const facilities = [];
                for (const facility of Array.from(this.facilities.values())) {
                        if (facility.businessId === businessId) {
                                facilities.push(facility);
                        }
                }
                return facilities;
        }

        async getFacilityById(id: number): Promise<Facility | undefined> {
                return this.facilities.get(id);
        }

        async updateFacility(
                id: number,
                updates: Partial<InsertFacility>
        ): Promise<Facility> {
                const facility = this.facilities.get(id);
                if (!facility) throw new Error("Facility not found");

                Object.assign(facility, updates, { updatedAt: new Date() });
                this.facilities.set(id, facility);
                return facility;
        }

        async deleteFacility(id: number): Promise<void> {
                this.facilities.delete(id);
        }

        async searchFacilities(filters: {
                location?: string;
                sportType?: string;
                minPrice?: number;
                maxPrice?: number;
                date?: string;
        }): Promise<
                (Facility & {
                        business: Business;
                        averageRating: number;
                        reviewCount: number;
                })[]
        > {
                const results = [];

                for (const facility of Array.from(this.facilities.values())) {
                        if (!facility.isActive) continue;

                        const business = this.businesses.get(facility.businessId);
                        if (!business) continue;

                        // Apply filters
                        if (
                                filters.location &&
                                !business.address
                                        .toLowerCase()
                                        .includes(filters.location.toLowerCase())
                        ) {
                                continue;
                        }

                        if (
                                filters.sportType &&
                                filters.sportType !== "" &&
                                facility.sportType !== filters.sportType
                        ) {
                                continue;
                        }

                        const price = parseFloat(facility.pricePerHour);
                        if (filters.minPrice && price < filters.minPrice) continue;
                        if (filters.maxPrice && price > filters.maxPrice) continue;

                        // Calculate rating
                        const facilityReviews = Array.from(this.reviews.values()).filter(
                                (r) => r.facilityId === facility.id
                        );
                        const averageRating =
                                facilityReviews.length > 0
                                        ? facilityReviews.reduce((sum, r) => sum + r.rating, 0) /
                                          facilityReviews.length
                                        : 0;

                        results.push({
                                ...facility,
                                business,
                                averageRating,
                                reviewCount: facilityReviews.length,
                        });
                }

                return results;
        }

        // Booking operations
        async createBooking(bookingData: InsertBooking): Promise<Booking> {
                const booking: Booking = {
                        ...bookingData,
                        id: this.bookingCounter,
                        totalPrice: bookingData.totalPrice.toString(),
                        status: "pending",
                        paymentStatus: "pending",
                        createdAt: new Date(),
                        updatedAt: new Date(),
                };
                this.bookings.set(booking.id, booking);
                this.bookingCounter++;
                return booking;
        }

        async getBookingsByUserId(
                userId: string
        ): Promise<(Booking & { facility: Facility; business: Business })[]> {
                const results = [];

                for (const booking of Array.from(this.bookings.values())) {
                        if (booking.userId === userId) {
                                const facility = this.facilities.get(booking.facilityId);
                                const business = facility
                                        ? this.businesses.get(facility.businessId)
                                        : undefined;

                                if (facility && business) {
                                        results.push({
                                                ...booking,
                                                facility,
                                                business,
                                        });
                                }
                        }
                }

                return results.sort(
                        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
                );
        }

        async getBookingsByFacilityId(
                facilityId: number
        ): Promise<(Booking & { user: User })[]> {
                const results = [];

                for (const booking of Array.from(this.bookings.values())) {
                        if (booking.facilityId === facilityId) {
                                const user = this.users.get(booking.userId);
                                if (user) {
                                        results.push({
                                                ...booking,
                                                user,
                                        });
                                }
                        }
                }

                return results.sort(
                        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
                );
        }

        async getBookingsByBusinessId(
                businessId: number
        ): Promise<(Booking & { facility: Facility; user: User })[]> {
                const results = [];

                for (const booking of Array.from(this.bookings.values())) {
                        const facility = this.facilities.get(booking.facilityId);
                        if (facility && facility.businessId === businessId) {
                                const user = this.users.get(booking.userId);
                                if (user) {
                                        results.push({
                                                ...booking,
                                                facility,
                                                user,
                                        });
                                }
                        }
                }

                return results.sort(
                        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
                );
        }

        async updateBookingStatus(
                id: number,
                status: "pending" | "approved" | "rejected" | "completed" | "cancelled" | "cancellation_requested",
                paymentStatus?: "pending" | "paid" | "failed" | "refunded",
                cancellationReason?: string
        ): Promise<Booking> {
                const booking = this.bookings.get(id);
                if (!booking) throw new Error("Booking not found");

                booking.status = status;
                if (paymentStatus) booking.paymentStatus = paymentStatus;
                if (cancellationReason) (booking as any).cancellationReason = cancellationReason;
                if (status === "cancellation_requested") (booking as any).cancellationRequestedAt = new Date();
                booking.updatedAt = new Date();

                this.bookings.set(id, booking);
                return booking;
        }

        async getBookingById(id: number): Promise<Booking | undefined> {
                return this.bookings.get(id);
        }

        async checkTimeSlotAvailability(
                facilityId: number,
                date: string,
                startTime: string,
                endTime: string
        ): Promise<boolean> {
                const bookingDate = new Date(date);

                for (const booking of Array.from(this.bookings.values())) {
                        if (
                                booking.facilityId === facilityId &&
                                booking.status === "approved" &&
                                booking.bookingDate.toDateString() ===
                                        bookingDate.toDateString()
                        ) {
                                // Check time overlap
                                const existingStart = booking.startTime;
                                const existingEnd = booking.endTime;

                                if (
                                        (startTime >= existingStart && startTime < existingEnd) ||
                                        (endTime > existingStart && endTime <= existingEnd) ||
                                        (startTime <= existingStart && endTime >= existingEnd)
                                ) {
                                        return false;
                                }
                        }
                }

                return true;
        }

        // Review operations
        async createReview(reviewData: InsertReview): Promise<Review> {
                const review: Review = {
                        ...reviewData,
                        id: this.reviewCounter,
                        createdAt: new Date(),
                };
                this.reviews.set(review.id, review);
                this.reviewCounter++;
                return review;
        }

        async getReviewsByFacilityId(
                facilityId: number
        ): Promise<(Review & { user: User })[]> {
                const results = [];

                for (const review of Array.from(this.reviews.values())) {
                        if (review.facilityId === facilityId) {
                                const user = this.users.get(review.userId);
                                if (user) {
                                        results.push({
                                                ...review,
                                                user,
                                        });
                                }
                        }
                }

                return results.sort(
                        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
                );
        }

        async getFacilityRating(
                facilityId: number
        ): Promise<{ averageRating: number; reviewCount: number }> {
                const facilityReviews = Array.from(this.reviews.values()).filter(
                        (r) => r.facilityId === facilityId
                );

                if (facilityReviews.length === 0) {
                        return { averageRating: 0, reviewCount: 0 };
                }

                const averageRating =
                        facilityReviews.reduce((sum, r) => sum + r.rating, 0) /
                        facilityReviews.length;

                return {
                        averageRating: Math.round(averageRating * 10) / 10,
                        reviewCount: facilityReviews.length,
                };
        }
}

export const storage = new MemoryStorage();
