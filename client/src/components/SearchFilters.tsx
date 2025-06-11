import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchFilters as SearchFiltersType } from "@/lib/types";
import { MapPin, Calendar, Search } from "lucide-react";

interface SearchFiltersProps {
  filters: SearchFiltersType;
  onFiltersChange: (filters: SearchFiltersType) => void;
  onSearch: () => void;
}

export default function SearchFilters({ filters, onFiltersChange, onSearch }: SearchFiltersProps) {
  const [priceRange, setPriceRange] = useState([filters.minPrice || 0, filters.maxPrice || 500000]);

  const facilities = [
    { id: "parking", label: "Parkir" },
    { id: "bathroom", label: "Kamar Mandi" },
    { id: "canteen", label: "Kantin" },
    { id: "wifi", label: "WiFi" },
    { id: "ac", label: "AC" },
    { id: "shower", label: "Shower" },
  ];

  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange(values);
    onFiltersChange({
      ...filters,
      minPrice: values[0],
      maxPrice: values[1],
    });
  };

  const handleFacilityToggle = (facilityId: string, checked: boolean) => {
    const currentFacilities = filters.facilities || [];
    const newFacilities = checked
      ? [...currentFacilities, facilityId]
      : currentFacilities.filter(f => f !== facilityId);
    
    onFiltersChange({
      ...filters,
      facilities: newFacilities,
    });
  };

  return (
    <div className="space-y-6">
      {/* Main Search */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="location" className="text-sm font-medium text-gray-700 mb-2 block">
                Lokasi
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="location"
                  placeholder="Cari berdasarkan kota atau area..."
                  value={filters.location || ""}
                  onChange={(e) => onFiltersChange({ ...filters, location: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="date" className="text-sm font-medium text-gray-700 mb-2 block">
                Tanggal
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="date"
                  type="date"
                  value={filters.date || ""}
                  onChange={(e) => onFiltersChange({ ...filters, date: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="sport" className="text-sm font-medium text-gray-700 mb-2 block">
                Olahraga
              </Label>
              <Select
                value={filters.sportType || ""}
                onValueChange={(value) => onFiltersChange({ ...filters, sportType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Semua Olahraga" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Semua Olahraga</SelectItem>
                  <SelectItem value="futsal">Futsal</SelectItem>
                  <SelectItem value="badminton">Badminton</SelectItem>
                  <SelectItem value="basketball">Basket</SelectItem>
                  <SelectItem value="tennis">Tennis</SelectItem>
                  <SelectItem value="volleyball">Voli</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-6 flex justify-center">
            <Button
              onClick={onSearch}
              className="bg-sport-blue hover:bg-blue-700 text-white px-8 py-3"
            >
              <Search className="mr-2 h-4 w-4" />
              Cari Lapangan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sidebar Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter Pencarian</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Price Range */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Rentang Harga
            </Label>
            <div className="space-y-3">
              <Slider
                value={priceRange}
                onValueChange={handlePriceRangeChange}
                max={500000}
                min={0}
                step={10000}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>Rp {priceRange[0].toLocaleString()}</span>
                <span>Rp {priceRange[1].toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Distance */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Jarak (km)
            </Label>
            <Select
              value={filters.distance || ""}
              onValueChange={(value) => onFiltersChange({ ...filters, distance: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Semua Jarak" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Semua Jarak</SelectItem>
                <SelectItem value="1">1 km</SelectItem>
                <SelectItem value="5">5 km</SelectItem>
                <SelectItem value="10">10 km</SelectItem>
                <SelectItem value="20">20 km</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Rating */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Rating Minimum
            </Label>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <label key={rating} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="rating"
                    value={rating}
                    checked={filters.rating === rating}
                    onChange={() => onFiltersChange({ ...filters, rating })}
                    className="text-sport-blue"
                  />
                  <div className="flex items-center">
                    <div className="flex text-yellow-400 mr-2">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < rating ? "text-yellow-400" : "text-gray-300"}>
                          ⭐
                        </span>
                      ))}
                    </div>
                    <span className="text-sm">{rating}+ Bintang</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Facilities */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Fasilitas
            </Label>
            <div className="space-y-3">
              {facilities.map((facility) => (
                <div key={facility.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={facility.id}
                    checked={filters.facilities?.includes(facility.id) || false}
                    onCheckedChange={(checked) =>
                      handleFacilityToggle(facility.id, checked as boolean)
                    }
                  />
                  <Label htmlFor={facility.id} className="text-sm cursor-pointer">
                    {facility.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
