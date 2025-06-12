import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import AddFacilityModal from "@/components/AddFacilityModal";
import {
        CalendarCheck,
        DollarSign,
        Star,
        Dumbbell,
        Plus,
        Calendar,
        List,
        BarChart3,
        Edit,
        Trash2,
        Eye,
        MoreVertical,
} from "lucide-react";
import {
        DropdownMenu,
        DropdownMenuContent,
        DropdownMenuItem,
        DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
        Dialog,
        DialogContent,
        DialogHeader,
        DialogTitle,
        DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
        Select,
        SelectContent,
        SelectItem,
        SelectTrigger,
        SelectValue,
} from "@/components/ui/select";
import { Booking, Business, Facility } from "@shared/schema";
import defaultImage from "@/assets/notfound.png";

export default function BusinessDashboard() {
        const { user } = useAuth();
        const { toast } = useToast();
        const queryClient = useQueryClient();
        const [addFacilityOpen, setAddFacilityOpen] = useState(false);
        const [editFacilityOpen, setEditFacilityOpen] = useState(false);
        const [selectedFacility, setSelectedFacility] = useState<Facility | null>(
                null
        );
        const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

        // Fetch business profile
        const { data: business, isLoading: businessLoading } = useQuery<Business>({
                queryKey: ["/api/businesses/my"],
                queryFn: async () => {
                        const req = await apiRequest("GET", "/api/businesses/my");
                        return req.json();
                },
                enabled: !!user && user.role === "business",
        });

        // Fetch facilities
        const { data: facilities = [], isLoading: facilitiesLoading } = useQuery<
                Facility[]
        >({
                queryKey: ["/api/facilities/business", business?.id],
                queryFn: async () => {
                        const req = await apiRequest(
                                "GET",
                                `/api/facilities/business/${business?.id}`
                        );
                        return req.json();
                },
                enabled: !!business?.id,
        });

        // Fetch bookings
        const { data: bookings = [], isLoading: bookingsLoading } = useQuery<
                Booking[]
        >({
                queryKey: ["/api/bookings/business", business?.id],
                queryFn: async () => {
                        const req = await apiRequest(
                                "GET",
                                `/api/bookings/business/${business?.id}`
                        );
                        return await req.json();
                },
                enabled: !!business?.id,
        });

        console.log(business);

        // Create business mutation
        const createBusinessMutation = useMutation({
                mutationFn: (businessData: any) =>
                        apiRequest("POST", "/api/businesses", businessData),
                onSuccess: () => {
                        toast({
                                title: "Profil bisnis berhasil dibuat!",
                                description: "Anda sekarang dapat menambahkan lapangan.",
                        });
                        queryClient.invalidateQueries({ queryKey: ["/api/businesses/my"] });
                },
                onError: (error: any) => {
                        toast({
                                title: "Gagal membuat profil bisnis",
                                description: error.message || "Terjadi kesalahan",
                                variant: "destructive",
                        });
                },
        });

        // Update facility mutation
        const updateFacilityMutation = useMutation({
                mutationFn: ({ id, data }: { id: number; data: any }) =>
                        apiRequest("PATCH", `/api/facilities/business/${id}`, data),
                onSuccess: () => {
                        toast({
                                title: "Lapangan berhasil diperbarui!",
                        });
                        queryClient.invalidateQueries({
                                queryKey: ["/api/facilities/business", business?.id],
                        });
                        setEditFacilityOpen(false);
                        setSelectedFacility(null);
                },
                onError: (error: any) => {
                        toast({
                                title: "Gagal memperbarui lapangan",
                                description: error.message,
                                variant: "destructive",
                        });
                },
        });

        // Delete facility mutation
        const deleteFacilityMutation = useMutation({
                mutationFn: (id: number) =>
                        apiRequest("DELETE", `/api/facilities/${id}`),
                onSuccess: () => {
                        toast({
                                title: "Lapangan berhasil dihapus!",
                        });
                        queryClient.invalidateQueries({
                                queryKey: ["/api/facilities/business", business?.id],
                        });
                        setDeleteConfirmOpen(false);
                        setSelectedFacility(null);
                },
                onError: (error: any) => {
                        toast({
                                title: "Gagal menghapus lapangan",
                                description: error.message,
                                variant: "destructive",
                        });
                },
        });

        // Update booking status mutation
        const updateBookingStatusMutation = useMutation({
                mutationFn: ({ bookingId, status, paymentStatus }: { 
                        bookingId: number; 
                        status: "pending" | "approved" | "rejected" | "completed" | "cancelled";
                        paymentStatus?: "pending" | "paid" | "failed" | "refunded";
                }) =>
                        apiRequest("PATCH", `/api/bookings/${bookingId}/status`, { status, paymentStatus }),
                onSuccess: () => {
                        toast({
                                title: "Status booking berhasil diperbarui!",
                        });
                        queryClient.invalidateQueries({
                                queryKey: ["/api/bookings/business", business?.id],
                        });
                },
                onError: (error: any) => {
                        toast({
                                title: "Gagal memperbarui status booking",
                                description: error.message,
                                variant: "destructive",
                        });
                },
        });

        // Handle business creation
        const [businessForm, setBusinessForm] = useState({
                businessName: "",
                description: "",
                address: "",
                phone: "",
                website: "",
        });

        const handleCreateBusiness = (e: React.FormEvent) => {
                e.preventDefault();
                if (!businessForm.businessName || !businessForm.address) {
                        toast({
                                title: "Form tidak lengkap",
                                description: "Nama bisnis dan alamat wajib diisi",
                                variant: "destructive",
                        });
                        return;
                }
                createBusinessMutation.mutate(businessForm);
        };

        // Handle facility edit
        const handleEditFacility = (facility: Facility) => {
                setSelectedFacility(facility);
                setEditFacilityOpen(true);
        };

        const handleUpdateFacility = (e: React.FormEvent) => {
                e.preventDefault();
                if (!selectedFacility) return;

                updateFacilityMutation.mutate({
                        id: selectedFacility.id,
                        data: selectedFacility,
                });
        };

        // Handle facility delete
        const handleDeleteFacility = (facility: Facility) => {
                setSelectedFacility(facility);
                setDeleteConfirmOpen(true);
        };

        const confirmDelete = async () => {
                if (selectedFacility) {
                        deleteFacilityMutation.mutate(selectedFacility.id);
                }
        };

        // Calculate stats
        const todayBookings = bookings.filter((booking: any) => {
                const today = new Date().toISOString().split("T")[0];
                const bookingDate = new Date(booking.bookingDate)
                        .toISOString()
                        .split("T")[0];
                return bookingDate === today;
        }).length;

        const monthlyRevenue = bookings
                .filter((booking) => {
                        const thisMonth = new Date().getMonth();
                        const bookingMonth = new Date(booking.bookingDate).getMonth();
                        return (
                                bookingMonth === thisMonth && booking.paymentStatus === "paid"
                        );
                })
                .reduce(
                        (total: number, booking: any) =>
                                total + parseFloat(booking.totalPrice),
                        0
                );

        const averageRating =
                facilities.length > 0
                        ? facilities.reduce(
                                        (sum: number, facility: Facility) =>
                                                sum + (facility.averageRating || 0),
                                        0
                          ) / facilities.length
                        : 0;

        const pendingBookings = bookings.filter((booking: any) => booking.status === "pending");
        const cancellationRequests = bookings.filter((booking: any) => booking.status === "cancellation_requested");
        const recentBookings = bookings.slice(0, 5);

        // Handle booking approval
        const handleBookingApproval = (bookingId: number, status: "approved" | "rejected") => {
                updateBookingStatusMutation.mutate({ bookingId, status });
        };

        // Handle cancellation request approval
        const handleCancellationApproval = (bookingId: number, status: "cancelled" | "approved") => {
                updateBookingStatusMutation.mutate({ bookingId, status });
        };

        if (businessLoading) {
                return (
                        <div className="min-h-screen flex items-center justify-center">
                                <div className="text-center">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sport-blue mx-auto mb-4"></div>
                                        <p className="text-gray-600">Loading...</p>
                                </div>
                        </div>
                );
        }

        // Show business creation form if no business profile exists
        if (!business) {
                return (
                        <div className="min-h-screen bg-gray-50 py-12">
                                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                                        <div className="text-center mb-8">
                                                <h1 className="text-3xl font-bold text-gray-900">
                                                        Selamat Datang!
                                                </h1>
                                                <p className="text-gray-600 mt-2">
                                                        Buat profil bisnis Anda untuk mulai mengelola
                                                        lapangan olahraga
                                                </p>
                                        </div>

                                        <Card>
                                                <CardHeader>
                                                        <CardTitle>Profil Bisnis</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                        <form
                                                                onSubmit={handleCreateBusiness}
                                                                className="space-y-4"
                                                        >
                                                                <div>
                                                                        <Label htmlFor="businessName">
                                                                                Nama Bisnis *
                                                                        </Label>
                                                                        <Input
                                                                                id="businessName"
                                                                                value={businessForm.businessName}
                                                                                onChange={(e) =>
                                                                                        setBusinessForm({
                                                                                                ...businessForm,
                                                                                                businessName: e.target.value,
                                                                                        })
                                                                                }
                                                                                placeholder="Contoh: Arena Sport Center"
                                                                                required
                                                                        />
                                                                </div>

                                                                <div>
                                                                        <Label htmlFor="description">
                                                                                Deskripsi
                                                                        </Label>
                                                                        <Textarea
                                                                                id="description"
                                                                                value={businessForm.description}
                                                                                onChange={(e) =>
                                                                                        setBusinessForm({
                                                                                                ...businessForm,
                                                                                                description: e.target.value,
                                                                                        })
                                                                                }
                                                                                placeholder="Deskripsi singkat tentang bisnis Anda"
                                                                        />
                                                                </div>

                                                                <div>
                                                                        <Label htmlFor="address">Alamat *</Label>
                                                                        <Textarea
                                                                                id="address"
                                                                                value={businessForm.address}
                                                                                onChange={(e) =>
                                                                                        setBusinessForm({
                                                                                                ...businessForm,
                                                                                                address: e.target.value,
                                                                                        })
                                                                                }
                                                                                placeholder="Alamat lengkap bisnis Anda"
                                                                                required
                                                                        />
                                                                </div>

                                                                <div>
                                                                        <Label htmlFor="phone">Nomor Telepon</Label>
                                                                        <Input
                                                                                id="phone"
                                                                                value={businessForm.phone}
                                                                                onChange={(e) =>
                                                                                        setBusinessForm({
                                                                                                ...businessForm,
                                                                                                phone: e.target.value,
                                                                                        })
                                                                                }
                                                                                placeholder="08123456789"
                                                                        />
                                                                </div>

                                                                <div>
                                                                        <Label htmlFor="website">Website</Label>
                                                                        <Input
                                                                                id="website"
                                                                                value={businessForm.website}
                                                                                onChange={(e) =>
                                                                                        setBusinessForm({
                                                                                                ...businessForm,
                                                                                                website: e.target.value,
                                                                                        })
                                                                                }
                                                                                placeholder="https://www.example.com"
                                                                        />
                                                                </div>

                                                                <Button
                                                                        type="submit"
                                                                        className="w-full bg-sport-blue hover:bg-blue-700"
                                                                        disabled={createBusinessMutation.isPending}
                                                                >
                                                                        {createBusinessMutation.isPending
                                                                                ? "Membuat..."
                                                                                : "Buat Profil Bisnis"}
                                                                </Button>
                                                        </form>
                                                </CardContent>
                                        </Card>
                                </div>
                        </div>
                );
        }

        return (
                <div className="bg-gray-50 min-h-screen">
                        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                                {/* Dashboard Header */}
                                <div className="mb-8">
                                        <h1 className="text-3xl font-bold text-gray-900">
                                                Dashboard Pemilik Usaha
                                        </h1>
                                        <p className="text-gray-600 mt-2">
                                                Kelola lapangan dan pemesanan Anda dengan mudah
                                        </p>
                                </div>

                                {/* Stats Overview */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                                        <Card>
                                                <CardContent className="p-6">
                                                        <div className="flex items-center">
                                                                <div className="p-3 bg-blue-100 rounded-lg">
                                                                        <CalendarCheck className="text-sport-blue h-6 w-6" />
                                                                </div>
                                                                <div className="ml-4">
                                                                        <p className="text-sm font-medium text-gray-500">
                                                                                Pemesanan Hari Ini
                                                                        </p>
                                                                        <p className="text-2xl font-bold text-gray-900">
                                                                                {todayBookings}
                                                                        </p>
                                                                </div>
                                                        </div>
                                                </CardContent>
                                        </Card>

                                        <Card>
                                                <CardContent className="p-6">
                                                        <div className="flex items-center">
                                                                <div className="p-3 bg-green-100 rounded-lg">
                                                                        <DollarSign className="text-sport-green h-6 w-6" />
                                                                </div>
                                                                <div className="ml-4">
                                                                        <p className="text-sm font-medium text-gray-500">
                                                                                Pendapatan Bulan Ini
                                                                        </p>
                                                                        <p className="text-2xl font-bold text-gray-900">
                                                                                Rp {monthlyRevenue.toLocaleString()}
                                                                        </p>
                                                                </div>
                                                        </div>
                                                </CardContent>
                                        </Card>

                                        <Card>
                                                <CardContent className="p-6">
                                                        <div className="flex items-center">
                                                                <div className="p-3 bg-yellow-100 rounded-lg">
                                                                        <Star className="text-sport-orange h-6 w-6" />
                                                                </div>
                                                                <div className="ml-4">
                                                                        <p className="text-sm font-medium text-gray-500">
                                                                                Rating Rata-rata
                                                                        </p>
                                                                        <p className="text-2xl font-bold text-gray-900">
                                                                                {averageRating > 0
                                                                                        ? averageRating.toFixed(1)
                                                                                        : "N/A"}
                                                                        </p>
                                                                </div>
                                                        </div>
                                                </CardContent>
                                        </Card>

                                        <Card>
                                                <CardContent className="p-6">
                                                        <div className="flex items-center">
                                                                <div className="p-3 bg-purple-100 rounded-lg">
                                                                        <Dumbbell className="text-purple-600 h-6 w-6" />
                                                                </div>
                                                                <div className="ml-4">
                                                                        <p className="text-sm font-medium text-gray-500">
                                                                                Total Lapangan
                                                                        </p>
                                                                        <p className="text-2xl font-bold text-gray-900">
                                                                                {facilities.length}
                                                                        </p>
                                                                </div>
                                                        </div>
                                                </CardContent>
                                        </Card>
                                </div>

                                {/* Quick Actions */}
                                <Card className="mb-8">
                                        <CardHeader>
                                                <CardTitle>Aksi Cepat</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                        <Button
                                                                onClick={() => setAddFacilityOpen(true)}
                                                                className="flex flex-col items-center justify-center p-6 h-24 border-2 border-dashed border-gray-300 hover:border-sport-blue hover:bg-blue-50 bg-transparent text-gray-600 hover:text-sport-blue"
                                                                variant="ghost"
                                                        >
                                                                <Plus className="h-6 w-6 mb-2" />
                                                                <span className="text-sm font-medium">
                                                                        Tambah Lapangan
                                                                </span>
                                                        </Button>

                                                        <Button className="flex flex-col items-center justify-center h-24 bg-sport-blue hover:bg-blue-700">
                                                                <Calendar className="h-6 w-6 mb-2" />
                                                                <span className="text-sm font-medium">
                                                                        Kelola Jadwal
                                                                </span>
                                                        </Button>

                                                        <Button className="flex flex-col items-center justify-center h-24 bg-sport-green hover:bg-green-700">
                                                                <List className="h-6 w-6 mb-2" />
                                                                <span className="text-sm font-medium">
                                                                        Lihat Pemesanan
                                                                </span>
                                                        </Button>

                                                        <Button className="flex flex-col items-center justify-center h-24 bg-sport-orange hover:bg-yellow-600">
                                                                <BarChart3 className="h-6 w-6 mb-2" />
                                                                <span className="text-sm font-medium">
                                                                        Laporan
                                                                </span>
                                                        </Button>
                                                </div>
                                        </CardContent>
                                </Card>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        {/* Facility Management */}
                                        <div className="lg:col-span-2">
                                                <Card>
                                                        <CardHeader className="flex flex-row items-center justify-between">
                                                                <CardTitle>Kelola Lapangan</CardTitle>
                                                                <Button
                                                                        onClick={() => setAddFacilityOpen(true)}
                                                                        className="bg-sport-blue hover:bg-blue-700"
                                                                        size="sm"
                                                                >
                                                                        <Plus className="h-4 w-4 mr-2" />
                                                                        Tambah Lapangan
                                                                </Button>
                                                        </CardHeader>
                                                        <CardContent>
                                                                {facilitiesLoading ? (
                                                                        <div className="space-y-4">
                                                                                {[...Array(3)].map((_, i) => (
                                                                                        <div
                                                                                                key={i}
                                                                                                className="border border-gray-200 rounded-lg p-4 animate-pulse"
                                                                                        >
                                                                                                <div className="flex">
                                                                                                        <div className="w-20 h-16 bg-gray-200 rounded-lg"></div>
                                                                                                        <div className="ml-4 flex-1 space-y-2">
                                                                                                                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                                                                                                                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                                                                                                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                                                                                        </div>
                                                                                                </div>
                                                                                        </div>
                                                                                ))}
                                                                        </div>
                                                                ) : facilities.length === 0 ? (
                                                                        <div className="text-center py-8">
                                                                                <Dumbbell className="mx-auto h-12 w-12 text-gray-400" />
                                                                                <h3 className="mt-2 text-sm font-medium text-gray-900">
                                                                                        Belum ada lapangan
                                                                                </h3>
                                                                                <p className="mt-1 text-sm text-gray-500">
                                                                                        Mulai dengan menambahkan lapangan
                                                                                        pertama Anda.
                                                                                </p>
                                                                                <div className="mt-6">
                                                                                        <Button
                                                                                                onClick={() =>
                                                                                                        setAddFacilityOpen(true)
                                                                                                }
                                                                                                className="bg-sport-blue hover:bg-blue-700"
                                                                                        >
                                                                                                <Plus className="h-4 w-4 mr-2" />
                                                                                                Tambah Lapangan
                                                                                        </Button>
                                                                                </div>
                                                                        </div>
                                                                ) : (
                                                                        <div className="space-y-4">
                                                                                {facilities.map(
                                                                                        (facility: Facility) => (
                                                                                                <div
                                                                                                        key={facility.id}
                                                                                                        className="border border-gray-200 rounded-lg p-4"
                                                                                                >
                                                                                                        <div className="flex justify-between items-start">
                                                                                                                <div className="flex">
                                                                                                                        <img
                                                                                                                                src={
                                                                                                                                        facility
                                                                                                                                                .images?.[0] ||
                                                                                                                                        defaultImage
                                                                                                                                }
                                                                                                                                alt={
                                                                                                                                        facility.name
                                                                                                                                }
                                                                                                                                className="w-20 h-16 object-cover rounded-lg"
                                                                                                                        />
                                                                                                                        <div className="ml-4">
                                                                                                                                <h3 className="font-semibold">
                                                                                                                                        {
                                                                                                                                                facility.name
                                                                                                                                        }
                                                                                                                                </h3>
                                                                                                                                <p className="text-sm text-gray-600">
                                                                                                                                        {
                                                                                                                                                facility.sportType
                                                                                                                                        }{" "}
                                                                                                                                        • Indoor
                                                                                                                                </p>
                                                                                                                                <p className="text-sm text-sport-blue font-medium">
                                                                                                                                        Rp{" "}
                                                                                                                                        {parseFloat(
                                                                                                                                                facility.pricePerHour
                                                                                                                                        ).toLocaleString()}
                                                                                                                                        /jam
                                                                                                                                </p>
                                                                                                                                <div className="flex items-center mt-1">
                                                                                                                                        <div className="flex text-yellow-400">
                                                                                                                                                {[
                                                                                                                                                        ...Array(
                                                                                                                                                                5
                                                                                                                                                        ),
                                                                                                                                                ].map(
                                                                                                                                                        (
                                                                                                                                                                _,
                                                                                                                                                                i
                                                                                                                                                        ) => (
                                                                                                                                                                <Star
                                                                                                                                                                        key={
                                                                                                                                                                                i
                                                                                                                                                                        }
                                                                                                                                                                        className="h-3 w-3 fill-current"
                                                                                                                                                                />
                                                                                                                                                        )
                                                                                                                                                )}
                                                                                                                                        </div>
                                                                                                                                        <span className="text-xs text-gray-500 ml-1">
                                                                                                                                                {facility.averageRating?.toFixed(
                                                                                                                                                        1
                                                                                                                                                ) ||
                                                                                                                                                        "N/A"}{" "}
                                                                                                                                                (
                                                                                                                                                {facility.reviewCount ||
                                                                                                                                                        0}{" "}
                                                                                                                                                ulasan)
                                                                                                                                        </span>
                                                                                                                                </div>
                                                                                                                        </div>
                                                                                                                </div>
                                                                                                                <div className="flex items-center space-x-2">
                                                                                                                        <Badge
                                                                                                                                variant={
                                                                                                                                        facility.isActive
                                                                                                                                                ? "default"
                                                                                                                                                : "secondary"
                                                                                                                                }
                                                                                                                        >
                                                                                                                                {facility.isActive
                                                                                                                                        ? "Aktif"
                                                                                                                                        : "Nonaktif"}
                                                                                                                        </Badge>
                                                                                                                        <DropdownMenu>
                                                                                                                                <DropdownMenuTrigger
                                                                                                                                        asChild
                                                                                                                                >
                                                                                                                                        <Button
                                                                                                                                                variant="ghost"
                                                                                                                                                size="sm"
                                                                                                                                        >
                                                                                                                                                <MoreVertical className="h-4 w-4" />
                                                                                                                                        </Button>
                                                                                                                                </DropdownMenuTrigger>
                                                                                                                                <DropdownMenuContent>
                                                                                                                                        <DropdownMenuItem
                                                                                                                                                onClick={() =>
                                                                                                                                                        handleEditFacility(
                                                                                                                                                                facility
                                                                                                                                                        )
                                                                                                                                                }
                                                                                                                                        >
                                                                                                                                                <Edit className="h-4 w-4 mr-2" />
                                                                                                                                                Edit
                                                                                                                                        </DropdownMenuItem>
                                                                                                                                        <DropdownMenuItem
                                                                                                                                                onClick={() =>
                                                                                                                                                        handleDeleteFacility(
                                                                                                                                                                facility
                                                                                                                                                        )
                                                                                                                                                }
                                                                                                                                                className="text-red-600"
                                                                                                                                        >
                                                                                                                                                <Trash2 className="h-4 w-4 mr-2" />
                                                                                                                                                Hapus
                                                                                                                                        </DropdownMenuItem>
                                                                                                                                </DropdownMenuContent>
                                                                                                                        </DropdownMenu>
                                                                                                                </div>
                                                                                                        </div>
                                                                                                </div>
                                                                                        )
                                                                                )}
                                                                        </div>
                                                                )}
                                                        </CardContent>
                                                </Card>
                                        </div>

                                        {/* Pending Bookings - Approval System */}
                                        <div>
                                                <Card className="mb-6">
                                                        <CardHeader>
                                                                <CardTitle className="flex items-center justify-between">
                                                                        <span>Pemesanan Menunggu Persetujuan</span>
                                                                        <Badge variant="destructive" className="ml-2">
                                                                                {pendingBookings.length}
                                                                        </Badge>
                                                                </CardTitle>
                                                        </CardHeader>
                                                        <CardContent>
                                                                {pendingBookings.length === 0 ? (
                                                                        <div className="text-center py-4 text-gray-500">
                                                                                Tidak ada pemesanan yang menunggu persetujuan
                                                                        </div>
                                                                ) : (
                                                                        <div className="space-y-4">
                                                                                {pendingBookings.map((booking: any) => (
                                                                                        <div key={booking.id} className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
                                                                                                <div className="flex justify-between items-start">
                                                                                                        <div className="flex-1">
                                                                                                                <h4 className="font-medium text-gray-900">{booking.facility?.name}</h4>
                                                                                                                <p className="text-sm text-gray-600">{booking.customerName}</p>
                                                                                                                <p className="text-sm text-gray-500">
                                                                                                                        {new Date(booking.bookingDate).toLocaleDateString('id-ID')} • {booking.startTime} - {booking.endTime}
                                                                                                                </p>
                                                                                                                <p className="text-sm font-medium text-gray-900 mt-1">
                                                                                                                        Rp {parseFloat(booking.totalPrice).toLocaleString()}
                                                                                                                </p>
                                                                                                        </div>
                                                                                                        <div className="flex space-x-2 ml-4">
                                                                                                                <Button
                                                                                                                        size="sm"
                                                                                                                        className="bg-green-600 hover:bg-green-700 text-white"
                                                                                                                        onClick={() => handleBookingApproval(booking.id, "approved")}
                                                                                                                        disabled={updateBookingStatusMutation.isPending}
                                                                                                                >
                                                                                                                        Setujui
                                                                                                                </Button>
                                                                                                                <Button
                                                                                                                        size="sm"
                                                                                                                        variant="destructive"
                                                                                                                        onClick={() => handleBookingApproval(booking.id, "rejected")}
                                                                                                                        disabled={updateBookingStatusMutation.isPending}
                                                                                                                >
                                                                                                                        Tolak
                                                                                                                </Button>
                                                                                                        </div>
                                                                                                </div>
                                                                                        </div>
                                                                                ))}
                                                                        </div>
                                                                )}
                                                        </CardContent>
                                                </Card>

                                                {/* Cancellation Requests */}
                                                <Card className="mb-6">
                                                        <CardHeader>
                                                                <CardTitle className="flex items-center justify-between">
                                                                        <span>Permintaan Pembatalan</span>
                                                                        <Badge variant="secondary" className="ml-2">
                                                                                {cancellationRequests.length}
                                                                        </Badge>
                                                                </CardTitle>
                                                        </CardHeader>
                                                        <CardContent>
                                                                {cancellationRequests.length === 0 ? (
                                                                        <div className="text-center py-4 text-gray-500">
                                                                                Tidak ada permintaan pembatalan
                                                                        </div>
                                                                ) : (
                                                                        <div className="space-y-4">
                                                                                {cancellationRequests.map((booking: any) => (
                                                                                        <div key={booking.id} className="border border-orange-200 bg-orange-50 rounded-lg p-4">
                                                                                                <div className="flex justify-between items-start">
                                                                                                        <div className="flex-1">
                                                                                                                <h4 className="font-medium text-gray-900">{booking.facility?.name}</h4>
                                                                                                                <p className="text-sm text-gray-600">{booking.customerName}</p>
                                                                                                                <p className="text-sm text-gray-500">
                                                                                                                        {new Date(booking.bookingDate).toLocaleDateString('id-ID')} • {booking.startTime} - {booking.endTime}
                                                                                                                </p>
                                                                                                                <p className="text-sm font-medium text-gray-900 mt-1">
                                                                                                                        Rp {parseFloat(booking.totalPrice).toLocaleString()}
                                                                                                                </p>
                                                                                                                {booking.cancellationReason && (
                                                                                                                        <div className="mt-2 p-2 bg-gray-100 rounded text-sm">
                                                                                                                                <strong>Alasan: </strong>{booking.cancellationReason}
                                                                                                                        </div>
                                                                                                                )}
                                                                                                        </div>
                                                                                                        <div className="flex space-x-2 ml-4">
                                                                                                                <Button
                                                                                                                        size="sm"
                                                                                                                        className="bg-red-600 hover:bg-red-700 text-white"
                                                                                                                        onClick={() => handleCancellationApproval(booking.id, "cancelled")}
                                                                                                                        disabled={updateBookingStatusMutation.isPending}
                                                                                                                >
                                                                                                                        Setujui Pembatalan
                                                                                                                </Button>
                                                                                                                <Button
                                                                                                                        size="sm"
                                                                                                                        className="bg-green-600 hover:bg-green-700 text-white"
                                                                                                                        onClick={() => handleCancellationApproval(booking.id, "approved")}
                                                                                                                        disabled={updateBookingStatusMutation.isPending}
                                                                                                                >
                                                                                                                        Tolak Pembatalan
                                                                                                                </Button>
                                                                                                        </div>
                                                                                                </div>
                                                                                        </div>
                                                                                ))}
                                                                        </div>
                                                                )}
                                                        </CardContent>
                                                </Card>

                                                {/* Recent Bookings */}
                                                <Card>
                                                        <CardHeader>
                                                                <CardTitle>Pemesanan Terbaru</CardTitle>
                                                        </CardHeader>
                                                        <CardContent>
                                                                {bookingsLoading ? (
                                                                        <div className="space-y-4">
                                                                                {[...Array(3)].map((_, i) => (
                                                                                        <div
                                                                                                key={i}
                                                                                                className="border-l-4 border-gray-200 bg-gray-50 pl-4 py-3 animate-pulse"
                                                                                        >
                                                                                                <div className="space-y-2">
                                                                                                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                                                                                                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                                                                                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                                                                                                </div>
                                                                                        </div>
                                                                                ))}
                                                                        </div>
                                                                ) : recentBookings.length === 0 ? (
                                                                        <div className="text-center py-8">
                                                                                <Calendar className="mx-auto h-8 w-8 text-gray-400" />
                                                                                <p className="mt-2 text-sm text-gray-500">
                                                                                        Belum ada pemesanan
                                                                                </p>
                                                                        </div>
                                                                ) : (
                                                                        <div className="space-y-4">
                                                                                {recentBookings.map((booking: any) => (
                                                                                        <div
                                                                                                key={booking.id}
                                                                                                className={`border-l-4 pl-4 py-3 ${
                                                                                                        booking.status ===
                                                                                                        "confirmed"
                                                                                                                ? "border-sport-blue bg-blue-50"
                                                                                                                : booking.status ===
                                                                                                                  "pending"
                                                                                                                ? "border-sport-orange bg-orange-50"
                                                                                                                : "border-sport-green bg-green-50"
                                                                                                }`}
                                                                                        >
                                                                                                <div className="flex justify-between items-start">
                                                                                                        <div>
                                                                                                                <p className="font-medium text-sm">
                                                                                                                        {
                                                                                                                                booking.customerName
                                                                                                                        }
                                                                                                                </p>
                                                                                                                <p className="text-xs text-gray-600">
                                                                                                                        {
                                                                                                                                booking.facility
                                                                                                                                        ?.name
                                                                                                                        }
                                                                                                                </p>
                                                                                                                <p className="text-xs text-gray-500">
                                                                                                                        {new Date(
                                                                                                                                booking.bookingDate
                                                                                                                        ).toLocaleDateString(
                                                                                                                                "id-ID"
                                                                                                                        )}
                                                                                                                        ,{" "}
                                                                                                                        {booking.startTime}-
                                                                                                                        {booking.endTime}
                                                                                                                </p>
                                                                                                        </div>
                                                                                                        <Badge
                                                                                                                variant={
                                                                                                                        booking.status ===
                                                                                                                        "confirmed"
                                                                                                                                ? "default"
                                                                                                                                : booking.status ===
                                                                                                                                  "pending"
                                                                                                                                ? "secondary"
                                                                                                                                : "outline"
                                                                                                                }
                                                                                                                className="text-xs"
                                                                                                        >
                                                                                                                {booking.status ===
                                                                                                                "confirmed"
                                                                                                                        ? "Konfirmasi"
                                                                                                                        : booking.status ===
                                                                                                                          "pending"
                                                                                                                        ? "Pending"
                                                                                                                        : booking.status}
                                                                                                        </Badge>
                                                                                                </div>
                                                                                        </div>
                                                                                ))}
                                                                        </div>
                                                                )}

                                                                {recentBookings.length > 0 && (
                                                                        <Button
                                                                                variant="ghost"
                                                                                className="w-full mt-4 text-sport-blue hover:text-blue-700"
                                                                        >
                                                                                Lihat Semua Pemesanan
                                                                                <Eye className="ml-2 h-4 w-4" />
                                                                        </Button>
                                                                )}
                                                        </CardContent>
                                                </Card>
                                        </div>
                                </div>
                        </div>

                        {/* Add Facility Modal */}
                        {business && (
                                <AddFacilityModal
                                        open={addFacilityOpen}
                                        onClose={() => setAddFacilityOpen(false)}
                                        businessId={business.id}
                                />
                        )}

                        {/* Edit Facility Modal */}
                        <Dialog open={editFacilityOpen} onOpenChange={setEditFacilityOpen}>
                                <DialogContent className="max-w-2xl">
                                        <DialogHeader>
                                                <DialogTitle>Edit Lapangan</DialogTitle>
                                        </DialogHeader>
                                        {selectedFacility && (
                                                <form
                                                        onSubmit={handleUpdateFacility}
                                                        className="space-y-4"
                                                >
                                                        <div>
                                                                <Label htmlFor="edit-name">Nama Lapangan</Label>
                                                                <Input
                                                                        id="edit-name"
                                                                        value={selectedFacility.name}
                                                                        onChange={(e) =>
                                                                                setSelectedFacility({
                                                                                        ...selectedFacility,
                                                                                        name: e.target.value,
                                                                                })
                                                                        }
                                                                />
                                                        </div>

                                                        <div>
                                                                <Label htmlFor="edit-description">
                                                                        Deskripsi
                                                                </Label>
                                                                <Textarea
                                                                        id="edit-description"
                                                                        value={selectedFacility.description || ""}
                                                                        onChange={(e) =>
                                                                                setSelectedFacility({
                                                                                        ...selectedFacility,
                                                                                        description: e.target.value,
                                                                                })
                                                                        }
                                                                />
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                        <Label htmlFor="edit-capacity">
                                                                                Kapasitas
                                                                        </Label>
                                                                        <Input
                                                                                id="edit-capacity"
                                                                                type="number"
                                                                                value={selectedFacility.capacity}
                                                                                onChange={(e) =>
                                                                                        setSelectedFacility({
                                                                                                ...selectedFacility,
                                                                                                capacity: parseInt(
                                                                                                        e.target.value
                                                                                                ),
                                                                                        })
                                                                                }
                                                                        />
                                                                </div>

                                                                <div>
                                                                        <Label htmlFor="edit-price">
                                                                                Harga per Jam
                                                                        </Label>
                                                                        <Input
                                                                                id="edit-price"
                                                                                type="number"
                                                                                value={selectedFacility.pricePerHour}
                                                                                onChange={(e) =>
                                                                                        setSelectedFacility({
                                                                                                ...selectedFacility,
                                                                                                pricePerHour: e.target.value,
                                                                                        })
                                                                                }
                                                                        />
                                                                </div>
                                                        </div>

                                                        <DialogFooter>
                                                                <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        onClick={() => setEditFacilityOpen(false)}
                                                                >
                                                                        Batal
                                                                </Button>
                                                                <Button
                                                                        type="submit"
                                                                        className="bg-sport-blue hover:bg-blue-700"
                                                                        disabled={updateFacilityMutation.isPending}
                                                                >
                                                                        {updateFacilityMutation.isPending
                                                                                ? "Menyimpan..."
                                                                                : "Simpan"}
                                                                </Button>
                                                        </DialogFooter>
                                                </form>
                                        )}
                                </DialogContent>
                        </Dialog>

                        {/* Delete Confirmation Modal */}
                        <Dialog
                                open={deleteConfirmOpen}
                                onOpenChange={setDeleteConfirmOpen}
                        >
                                <DialogContent>
                                        <DialogHeader>
                                                <DialogTitle>Konfirmasi Hapus</DialogTitle>
                                        </DialogHeader>
                                        <p className="text-gray-600">
                                                Apakah Anda yakin ingin menghapus lapangan "
                                                {selectedFacility?.name}"? Tindakan ini tidak dapat
                                                dibatalkan.
                                        </p>
                                        <DialogFooter>
                                                <Button
                                                        variant="outline"
                                                        onClick={() => setDeleteConfirmOpen(false)}
                                                >
                                                        Batal
                                                </Button>
                                                <Button
                                                        variant="destructive"
                                                        onClick={confirmDelete}
                                                        disabled={deleteFacilityMutation.isPending}
                                                >
                                                        {deleteFacilityMutation.isPending
                                                                ? "Menghapus..."
                                                                : "Hapus"}
                                                </Button>
                                        </DialogFooter>
                                </DialogContent>
                        </Dialog>
                </div>
        );
}
