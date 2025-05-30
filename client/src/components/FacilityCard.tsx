import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Users, MapPin } from "lucide-react";
import { FacilityWithDetails } from "@/lib/types";

interface FacilityCardProps {
  facility: FacilityWithDetails;
  onBook: (facility: FacilityWithDetails) => void;
  onView: (facility: FacilityWithDetails) => void;
}

export default function FacilityCard({ facility, onBook, onView }: FacilityCardProps) {
  const defaultImage = "https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400";
  const facilityImage = facility.images?.length > 0 ? facility.images[0] : defaultImage;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
      <div onClick={() => onView(facility)}>
        <img
          src={facilityImage}
          alt={facility.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.src = defaultImage;
          }}
        />
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg line-clamp-1">{facility.name}</h3>
          <div className="flex items-center shrink-0 ml-2">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="ml-1 text-sm font-medium">
              {facility.averageRating > 0 ? facility.averageRating.toFixed(1) : "N/A"}
            </span>
          </div>
        </div>
        
        <div className="flex items-center text-gray-600 text-sm mb-2">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="line-clamp-1">{facility.business.address}</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-600 mb-3">
          <Badge variant="secondary" className="mr-2">
            {facility.sportType}
          </Badge>
          <Users className="h-4 w-4 mr-1" />
          <span>{facility.capacity} orang</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-sport-blue">
              Rp {parseFloat(facility.pricePerHour).toLocaleString()}
            </span>
            <span className="text-sm text-gray-500">/jam</span>
          </div>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onBook(facility);
            }}
            className="bg-sport-blue hover:bg-blue-700 text-white"
            size="sm"
          >
            Book Sekarang
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
