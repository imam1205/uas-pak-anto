import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AddFacilityModalProps {
  open: boolean;
  onClose: () => void;
  businessId: number;
}

export default function AddFacilityModal({ open, onClose, businessId }: AddFacilityModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    sportType: "",
    capacity: "",
    pricePerHour: "",
    facilities: [] as string[],
    images: [] as string[],
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const availableFacilities = [
    { id: "parking", label: "Parkir" },
    { id: "bathroom", label: "Kamar Mandi" },
    { id: "canteen", label: "Kantin" },
    { id: "wifi", label: "WiFi" },
    { id: "ac", label: "AC" },
    { id: "shower", label: "Shower" },
    { id: "locker", label: "Loker" },
    { id: "sound_system", label: "Sound System" },
  ];

  const createFacilityMutation = useMutation({
    mutationFn: (facilityData: any) => apiRequest("POST", "/api/facilities", facilityData),
    onSuccess: () => {
      toast({
        title: "Lapangan berhasil ditambahkan!",
        description: "Lapangan baru telah berhasil dibuat.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/facilities/business", businessId] });
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Gagal menambahkan lapangan",
        description: error.message || "Terjadi kesalahan saat membuat lapangan",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      sportType: "",
      capacity: "",
      pricePerHour: "",
      facilities: [],
      images: [],
    });
  };

  const handleFacilityToggle = (facilityId: string, checked: boolean) => {
    const newFacilities = checked
      ? [...formData.facilities, facilityId]
      : formData.facilities.filter(f => f !== facilityId);
    
    setFormData({ ...formData, facilities: newFacilities });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.sportType || !formData.capacity || !formData.pricePerHour) {
      toast({
        title: "Form tidak lengkap",
        description: "Mohon lengkapi semua field yang diperlukan",
        variant: "destructive",
      });
      return;
    }

    const facilityData = {
      businessId,
      name: formData.name,
      description: formData.description,
      sportType: formData.sportType,
      capacity: parseInt(formData.capacity),
      pricePerHour: formData.pricePerHour,
      facilities: formData.facilities,
      images: formData.images,
      operatingHours: {
        monday: { open: "06:00", close: "24:00" },
        tuesday: { open: "06:00", close: "24:00" },
        wednesday: { open: "06:00", close: "24:00" },
        thursday: { open: "06:00", close: "24:00" },
        friday: { open: "06:00", close: "24:00" },
        saturday: { open: "06:00", close: "24:00" },
        sunday: { open: "06:00", close: "24:00" },
      },
    };

    createFacilityMutation.mutate(facilityData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Tambah Lapangan Baru</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium">Nama Lapangan *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Lapangan Futsal A"
                required
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-medium">Deskripsi</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Deskripsi lapangan..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sportType" className="text-sm font-medium">Jenis Olahraga *</Label>
                <Select
                  value={formData.sportType}
                  onValueChange={(value) => setFormData({ ...formData, sportType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih olahraga" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="futsal">Futsal</SelectItem>
                    <SelectItem value="badminton">Badminton</SelectItem>
                    <SelectItem value="basketball">Basketball</SelectItem>
                    <SelectItem value="tennis">Tennis</SelectItem>
                    <SelectItem value="volleyball">Volleyball</SelectItem>
                    <SelectItem value="table_tennis">Tenis Meja</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="capacity" className="text-sm font-medium">Kapasitas (orang) *</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  placeholder="10"
                  min="1"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="pricePerHour" className="text-sm font-medium">Harga per Jam (Rp) *</Label>
              <Input
                id="pricePerHour"
                type="number"
                value={formData.pricePerHour}
                onChange={(e) => setFormData({ ...formData, pricePerHour: e.target.value })}
                placeholder="150000"
                min="0"
                required
              />
            </div>
          </div>

          {/* Facilities */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Fasilitas</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {availableFacilities.map((facility) => (
                <div key={facility.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={facility.id}
                    checked={formData.facilities.includes(facility.id)}
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

          {/* Images */}
          <div>
            <Label htmlFor="images" className="text-sm font-medium">URL Gambar</Label>
            <Input
              id="images"
              value={formData.images.join(", ")}
              onChange={(e) => setFormData({ 
                ...formData, 
                images: e.target.value.split(", ").filter(url => url.trim()) 
              })}
              placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
            />
            <p className="text-xs text-gray-500 mt-1">
              Pisahkan beberapa URL dengan koma
            </p>
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
              disabled={createFacilityMutation.isPending}
            >
              {createFacilityMutation.isPending ? "Menyimpan..." : "Tambah Lapangan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
