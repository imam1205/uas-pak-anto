export interface SearchFilters {
  location?: string;
  sportType?: string;
  minPrice?: number;
  maxPrice?: number;
  date?: string;
  distance?: string;
  rating?: number;
  facilities?: string[];
}

export interface TimeSlot {
  time: string;
  available: boolean;
  selected?: boolean;
}

export interface BookingData {
  facilityId: number;
  bookingDate: Date;
  startTime: string;
  endTime: string;
  duration: number;
  totalPrice: number;
  customerName: string;
  customerPhone: string;
  notes?: string;
}

export interface FacilityWithDetails {
  id: number;
  businessId: number;
  name: string;
  description: string;
  sportType: string;
  capacity: number;
  pricePerHour: string;
  facilities: string[];
  images: string[];
  isActive: boolean;
  operatingHours: any;
  business: {
    businessName: string;
    address: string;
    phone: string;
  };
  averageRating: number;
  reviewCount: number;
}
