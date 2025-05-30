import { useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import BookingModal from "@/components/BookingModal";
import ReviewModal from "@/components/ReviewModal";
import { FacilityWithDetails } from "@/lib/types";
import {
  MapPin,
  Users,
  Clock,
  Star,
  Calendar,
  Phone,
  Globe,
  Check,
  ArrowLeft,
  MessageSquare,
} from "lucide-react";
import { useLocation } from "wouter";

export default function FacilityDetails() {
  const params = useParams();
  const [, navigate] = useLocation();
  const facilityId = parseInt(params.id as string);
  
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Fetch facility details
  const { data: facility, isLoading } = useQuery({
    queryKey: ["/api/facilities", facilityId],
    enabled: !!facilityId,
  });

  // Fetch reviews
  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ["/api/reviews/facility", facilityId],
    enabled: !!facilityId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sport-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!facility) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Lapangan tidak ditemukan</h1>
          <p className="text-gray-600 mb-4">Lapangan yang Anda cari tidak tersedia.</p>
          <Button onClick={() => navigate("/")} className="bg-sport-blue hover:bg-blue-700">
            Kembali ke Beranda
          </Button>
        </div>
      </div>
    );
  }

  const defaultImages = [
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400",
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400",
  ];

  const facilityImages = facility.images?.length > 0 ? facility.images : defaultImages;
  const facilityData: FacilityWithDetails = {
    ...facility,
    business: facility.business || { businessName: "Unknown", address: "Unknown", phone: "" },
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card className="overflow-hidden">
              <div className="relative">
                <img
                  src={facilityImages[selectedImageIndex]}
                  alt={facility.name}
                  className="w-full h-96 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = defaultImages[0];
                  }}
                />
                {facilityImages.length > 1 && (
                  <div className="absolute bottom-4 left-4 flex space-x-2">
                    {facilityImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`w-16 h-12 rounded-lg overflow-hidden border-2 ${
                          selectedImageIndex === index ? "border-white" : "border-transparent"
                        }`}
                      >
                        <img
                          src={facilityImages[index]}
                          alt={`View ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = defaultImages[0];
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {/* Facility Info */}
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{facility.name}</h1>
                    <div className="flex items-center space-x-4 text-gray-600">
                      <Badge variant="secondary" className="text-sm">
                        {facility.sportType}
                      </Badge>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        <span className="text-sm">Kapasitas {facility.capacity} orang</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center mb-2">
                      <Star className="h-5 w-5 text-yellow-400 fill-current mr-1" />
                      <span className="text-xl font-bold">
                        {facility.averageRating > 0 ? facility.averageRating.toFixed(1) : "N/A"}
                      </span>
                      <span className="text-gray-500 ml-1">
                        ({facility.reviewCount || 0} ulasan)
                      </span>
                    </div>
                    <p className="text-3xl font-bold text-sport-blue">
                      Rp {parseFloat(facility.pricePerHour).toLocaleString()}
                      <span className="text-lg text-gray-500 font-normal">/jam</span>
                    </p>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Deskripsi</h3>
                    <p className="text-gray-600">
                      {facility.description || "Lapangan olahraga berkualitas tinggi dengan fasilitas lengkap dan nyaman untuk aktivitas olahraga Anda."}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-sm">{facility.business?.address || "Alamat tidak tersedia"}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-sm">Buka 06:00 - 24:00</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {facility.business?.phone && (
                        <div className="flex items-center">
                          <Phone className="h-5 w-5 text-gray-400 mr-3" />
                          <span className="text-sm">{facility.business.phone}</span>
                        </div>
                      )}
                      {facility.business?.website && (
                        <div className="flex items-center">
                          <Globe className="h-5 w-5 text-gray-400 mr-3" />
                          <a 
                            href={facility.business.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-sport-blue hover:underline"
                          >
                            Website
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {facility.facilities && facility.facilities.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Fasilitas Tersedia</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {facility.facilities.map((fac: string, index: number) => (
                          <div key={index} className="flex items-center">
                            <Check className="h-4 w-4 text-sport-green mr-2" />
                            <span className="text-sm capitalize">{fac.replace('_', ' ')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Reviews Section */}
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold">Ulasan & Rating</h3>
                  <Button
                    onClick={() => setReviewModalOpen(true)}
                    variant="outline"
                    size="sm"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Tulis Ulasan
                  </Button>
                </div>

                {reviewsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="flex space-x-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-full"></div>
                            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Belum ada ulasan</h4>
                    <p className="text-gray-500 mb-4">Jadilah yang pertama memberikan ulasan untuk lapangan ini.</p>
                    <Button
                      onClick={() => setReviewModalOpen(true)}
                      className="bg-sport-blue hover:bg-blue-700"
                    >
                      Tulis Ulasan Pertama
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {reviews.map((review: any) => (
                      <div key={review.id} className="flex space-x-4">
                        <Avatar>
                          <AvatarImage src={review.user?.profileImageUrl} />
                          <AvatarFallback>
                            {review.user?.firstName?.charAt(0) || review.user?.email?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h5 className="font-medium">
                              {review.user?.firstName || "Anonymous"} {review.user?.lastName || ""}
                            </h5>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString("id-ID")}
                            </span>
                          </div>
                          {review.comment && (
                            <p className="text-gray-600">{review.comment}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Booking Sidebar */}
          <div>
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <p className="text-3xl font-bold text-sport-blue mb-2">
                    Rp {parseFloat(facility.pricePerHour).toLocaleString()}
                    <span className="text-lg text-gray-500 font-normal">/jam</span>
                  </p>
                  <div className="flex items-center justify-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                    <span className="font-medium">
                      {facility.averageRating > 0 ? facility.averageRating.toFixed(1) : "N/A"}
                    </span>
                    <span className="text-gray-500 ml-1">
                      ({facility.reviewCount || 0} ulasan)
                    </span>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Jenis Olahraga</span>
                    <Badge variant="secondary">{facility.sportType}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Kapasitas</span>
                    <span className="text-sm font-medium">{facility.capacity} orang</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Jam Operasional</span>
                    <span className="text-sm font-medium">06:00 - 24:00</span>
                  </div>
                </div>

                <Separator className="my-4" />

                <Button
                  onClick={() => setBookingModalOpen(true)}
                  className="w-full bg-sport-blue hover:bg-blue-700 text-white py-3"
                  size="lg"
                >
                  <Calendar className="h-5 w-5 mr-2" />
                  Book Sekarang
                </Button>

                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500">
                    Pembatalan gratis hingga 2 jam sebelum waktu booking
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        facility={facilityData}
        open={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
      />

      {/* Review Modal */}
      <ReviewModal
        open={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        facilityId={facility.id}
        facilityName={facility.name}
      />
    </div>
  );
}
