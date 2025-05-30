import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FacilityWithDetails, TimeSlot, BookingData } from "@/lib/types";
import { MapPin, Users, Clock, Check, X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface BookingModalProps {
  facility: FacilityWithDetails | null;
  open: boolean;
  onClose: () => void;
}

export default function BookingModal({ facility, open, onClose }: BookingModalProps) {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [duration, setDuration] = useState("1");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const timeSlots: TimeSlot[] = [
    { time: "06:00", available: true },
    { time: "07:00", available: true },
    { time: "08:00", available: true },
    { time: "09:00", available: false },
    { time: "10:00", available: true },
    { time: "11:00", available: true },
    { time: "12:00", available: true },
    { time: "13:00", available: true },
    { time: "14:00", available: true },
    { time: "15:00", available: true },
    { time: "16:00", available: true },
    { time: "17:00", available: true },
    { time: "18:00", available: true },
    { time: "19:00", available: true },
    { time: "20:00", available: true },
    { time: "21:00", available: true },
    { time: "22:00", available: true },
    { time: "23:00", available: true },
  ];

  const createBookingMutation = useMutation({
    mutationFn: (bookingData: any) => apiRequest("POST", "/api/bookings", bookingData),
    onSuccess: () => {
      toast({
        title: "Booking berhasil!",
        description: "Pemesanan Anda telah berhasil dibuat.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings/my"] });
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Booking gagal",
        description: error.message || "Terjadi kesalahan saat membuat booking",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setSelectedDate("");
    setSelectedTimeSlot("");
    setDuration("1");
    setCustomerName("");
    setCustomerPhone("");
    setNotes("");
  };

  const calculateEndTime = (startTime: string, durationHours: number) => {
    const [hours, minutes] = startTime.split(":").map(Number);
    const endHours = hours + durationHours;
    return `${endHours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  };

  const calculateTotalPrice = () => {
    if (!facility || !duration) return 0;
    return parseFloat(facility.pricePerHour) * parseInt(duration);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!facility || !selectedDate || !selectedTimeSlot || !customerName || !customerPhone) {
      toast({
        title: "Form tidak lengkap",
        description: "Mohon lengkapi semua field yang diperlukan",
        variant: "destructive",
      });
      return;
    }

    const bookingData = {
      facilityId: facility.id,
      bookingDate: new Date(`${selectedDate}T${selectedTimeSlot}:00`),
      startTime: selectedTimeSlot,
      endTime: calculateEndTime(selectedTimeSlot, parseInt(duration)),
      duration: parseInt(duration),
      totalPrice: calculateTotalPrice(),
      customerName,
      customerPhone,
      notes,
    };

    createBookingMutation.mutate(bookingData);
  };

  if (!facility) return null;

  const defaultImage = "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400";
  const facilityImage = facility.images?.length > 0 ? facility.images[0] : defaultImage;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Booking Lapangan</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Facility Info */}
          <div>
            <img
              src={facilityImage}
              alt={facility.name}
              className="w-full h-48 object-cover rounded-lg mb-4"
              onError={(e) => {
                e.currentTarget.src = defaultImage;
              }}
            />
            <h3 className="text-xl font-semibold mb-2">{facility.name}</h3>
            <p className="text-gray-600 mb-4">{facility.description}</p>

            <div className="space-y-3">
              <div className="flex items-center">
                <MapPin className="text-gray-400 w-5 h-5 mr-2" />
                <span className="text-sm">{facility.business.address}</span>
              </div>
              <div className="flex items-center">
                <Users className="text-gray-400 w-5 h-5 mr-2" />
                <span className="text-sm">Kapasitas: {facility.capacity} orang</span>
              </div>
              <div className="flex items-center">
                <Clock className="text-gray-400 w-5 h-5 mr-2" />
                <span className="text-sm">Jam Operasional: 06:00 - 24:00</span>
              </div>
            </div>

            {facility.facilities && facility.facilities.length > 0 && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Fasilitas Tersedia:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {facility.facilities.map((fac, index) => (
                    <div key={index} className="flex items-center">
                      <Check className="text-sport-green mr-2 h-4 w-4" />
                      {fac}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Booking Form */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Date Selection */}
              <div>
                <Label htmlFor="date" className="text-sm font-medium">Pilih Tanggal *</Label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              {/* Time Slots */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Pilih Waktu *</Label>
                <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.time}
                      type="button"
                      onClick={() => slot.available && setSelectedTimeSlot(slot.time)}
                      disabled={!slot.available}
                      className={`p-2 text-sm border rounded-lg text-center transition-colors ${
                        selectedTimeSlot === slot.time
                          ? "border-sport-blue bg-blue-50 text-sport-blue"
                          : slot.available
                          ? "border-gray-300 hover:border-sport-blue hover:bg-blue-50"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      <div className="font-medium">{slot.time}</div>
                      <div className="text-xs">
                        {selectedTimeSlot === slot.time ? "Dipilih" : slot.available ? "Tersedia" : "Booked"}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div>
                <Label htmlFor="duration" className="text-sm font-medium">Durasi *</Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Jam</SelectItem>
                    <SelectItem value="2">2 Jam</SelectItem>
                    <SelectItem value="3">3 Jam</SelectItem>
                    <SelectItem value="4">4 Jam</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Customer Info */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="customerName" className="text-sm font-medium">Nama Pemesan *</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="customerPhone" className="text-sm font-medium">No. Telepon *</Label>
                  <Input
                    id="customerPhone"
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="notes" className="text-sm font-medium">Catatan</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>

              {/* Booking Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">Ringkasan Pesanan</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Lapangan</span>
                    <span>{facility.name}</span>
                  </div>
                  {selectedDate && selectedTimeSlot && (
                    <div className="flex justify-between">
                      <span>Tanggal & Waktu</span>
                      <span>
                        {new Date(selectedDate).toLocaleDateString("id-ID")} {selectedTimeSlot}-
                        {calculateEndTime(selectedTimeSlot, parseInt(duration))}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Durasi</span>
                    <span>{duration} Jam</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-sport-blue">
                      Rp {calculateTotalPrice().toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-sport-blue hover:bg-blue-700"
                  disabled={createBookingMutation.isPending}
                >
                  {createBookingMutation.isPending ? "Memproses..." : "Lanjut ke Pembayaran"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
