import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
        Select,
        SelectContent,
        SelectItem,
        SelectTrigger,
        SelectValue,
} from "@/components/ui/select";
import ReviewModal from "@/components/ReviewModal";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
        Calendar,
        Clock,
        MapPin,
        Users,
        Star,
        MessageSquare,
        X,
        CheckCircle,
        AlertCircle,
        History,
        Filter,
} from "lucide-react";
import {
        Dialog,
        DialogContent,
        DialogHeader,
        DialogTitle,
        DialogFooter,
} from "@/components/ui/dialog";
import { Booking } from "@shared/schema";
import image from "@/assets/notfound.png";

export default function MyBookings() {
        const { toast } = useToast();
        const queryClient = useQueryClient();
        const [selectedTab, setSelectedTab] = useState("all");
        const [sortBy, setSortBy] = useState("date_desc");
        const [reviewModalOpen, setReviewModalOpen] = useState(false);
        const [selectedBooking, setSelectedBooking] = useState<any>(null);
        const [cancelModalOpen, setCancelModalOpen] = useState(false);
        const [cancellationReason, setCancellationReason] = useState("");

        // Fetch bookings
        const { data: bookings = [], isLoading } = useQuery<Booking[]>({
                queryKey: ["/api/bookings/my"],
                queryFn: async () => {
                        const req = await apiRequest("GET", "/api/bookings/my");
                        const res = await req.json();
                        return res;
                },
        });

        // Request cancellation mutation
        const requestCancellationMutation = useMutation({
                mutationFn: ({ bookingId, reason }: { bookingId: number; reason: string }) =>
                        apiRequest("PATCH", `/api/bookings/${bookingId}/request-cancellation`, {
                                cancellationReason: reason,
                        }),
                onSuccess: () => {
                        toast({
                                title: "Permintaan pembatalan berhasil",
                                description: "Permintaan pembatalan Anda telah dikirim dan menunggu persetujuan pemilik usaha.",
                        });
                        queryClient.invalidateQueries({ queryKey: ["/api/bookings/my"] });
                        setCancelModalOpen(false);
                        setSelectedBooking(null);
                        setCancellationReason("");
                },
                onError: (error: any) => {
                        toast({
                                title: "Gagal mengajukan pembatalan",
                                description: error.message || "Terjadi kesalahan",
                                variant: "destructive",
                        });
                },
        });

        const handleCancelBooking = (booking: any) => {
                setSelectedBooking(booking);
                setCancelModalOpen(true);
        };

        const confirmCancel = () => {
                if (selectedBooking && cancellationReason.trim()) {
                        requestCancellationMutation.mutate({ 
                                bookingId: selectedBooking.id, 
                                reason: cancellationReason.trim() 
                        });
                }
        };

        const handleWriteReview = (booking: any) => {
                setSelectedBooking(booking);
                setReviewModalOpen(true);
        };

        // Filter and sort bookings
        const filteredBookings = bookings.filter((booking: any) => {
                if (selectedTab === "all") return true;
                if (selectedTab === "upcoming") {
                        const bookingDate = new Date(booking.bookingDate);
                        const now = new Date();
                        return bookingDate >= now && booking.status !== "cancelled";
                }
                if (selectedTab === "completed") return booking.status === "completed";
                if (selectedTab === "cancelled") return booking.status === "cancelled";
                return true;
        });

        const sortedBookings = [...filteredBookings].sort((a: any, b: any) => {
                switch (sortBy) {
                        case "date_desc":
                                return (
                                        new Date(b.bookingDate).getTime() -
                                        new Date(a.bookingDate).getTime()
                                );
                        case "date_asc":
                                return (
                                        new Date(a.bookingDate).getTime() -
                                        new Date(b.bookingDate).getTime()
                                );
                        case "price_desc":
                                return parseFloat(b.totalPrice) - parseFloat(a.totalPrice);
                        case "price_asc":
                                return parseFloat(a.totalPrice) - parseFloat(b.totalPrice);
                        default:
                                return 0;
                }
        });

        const getStatusIcon = (status: string) => {
                switch (status) {
                        case "approved":
                                return <CheckCircle className="h-4 w-4 text-sport-green" />;
                        case "pending":
                                return <AlertCircle className="h-4 w-4 text-sport-orange" />;
                        case "rejected":
                                return <X className="h-4 w-4 text-red-500" />;
                        case "cancelled":
                                return <X className="h-4 w-4 text-red-500" />;
                        case "completed":
                                return <CheckCircle className="h-4 w-4 text-sport-blue" />;
                        default:
                                return <AlertCircle className="h-4 w-4 text-gray-400" />;
                }
        };

        const getStatusBadge = (status: string) => {
                switch (status) {
                        case "approved":
                                return <Badge className="bg-sport-green">Disetujui</Badge>;
                        case "pending":
                                return (
                                        <Badge
                                                variant="secondary"
                                                className="bg-sport-orange text-white"
                                        >
                                                Menunggu Persetujuan
                                        </Badge>
                                );
                        case "rejected":
                                return <Badge variant="destructive">Ditolak</Badge>;
                        case "cancelled":
                                return <Badge variant="destructive">Dibatalkan</Badge>;
                        case "cancellation_requested":
                                return (
                                        <Badge
                                                variant="secondary"
                                                className="bg-yellow-500 text-white"
                                        >
                                                Pembatalan Diajukan
                                        </Badge>
                                );
                        case "completed":
                                return (
                                        <Badge
                                                variant="outline"
                                                className="border-sport-blue text-sport-blue"
                                        >
                                                Selesai
                                        </Badge>
                                );
                        default:
                                return <Badge variant="secondary">{status}</Badge>;
                }
        };

        const canCancelBooking = (booking: any) => {
                const bookingDateTime = new Date(
                        `${booking.bookingDate.split("T")[0]}T${booking.startTime}`
                );
                const now = new Date();
                const hoursUntilBooking =
                        (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

                return (
                        booking.status !== "cancelled" &&
                        booking.status !== "completed" &&
                        booking.status !== "rejected" &&
                        booking.status !== "cancellation_requested" &&
                        hoursUntilBooking > 1 // Changed from 2 hours to 1 hour as requested
                );
        };

        const canWriteReview = (booking: any) => {
                return booking.status === "completed";
        };

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

        return (
                <div className="bg-gray-50 min-h-screen">
                        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                                {/* Page Header */}
                                <div className="mb-8">
                                        <h1 className="text-3xl font-bold text-gray-900">
                                                Pesanan Saya
                                        </h1>
                                        <p className="text-gray-600 mt-2">
                                                Kelola dan pantau semua pemesanan lapangan Anda
                                        </p>
                                </div>

                                {/* Filter and Sort Controls */}
                                <Card className="mb-6">
                                        <CardContent className="p-4">
                                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                                                        <Tabs
                                                                value={selectedTab}
                                                                onValueChange={setSelectedTab}
                                                                className="w-full md:w-auto"
                                                        >
                                                                <TabsList className="grid w-full md:w-auto grid-cols-4">
                                                                        <TabsTrigger value="all">Semua</TabsTrigger>
                                                                        <TabsTrigger value="upcoming">
                                                                                Akan Datang
                                                                        </TabsTrigger>
                                                                        <TabsTrigger value="completed">
                                                                                Selesai
                                                                        </TabsTrigger>
                                                                        <TabsTrigger value="cancelled">
                                                                                Dibatalkan
                                                                        </TabsTrigger>
                                                                </TabsList>
                                                        </Tabs>

                                                        <div className="flex items-center space-x-4">
                                                                <div className="flex items-center space-x-2">
                                                                        <Filter className="h-4 w-4 text-gray-500" />
                                                                        <Select
                                                                                value={sortBy}
                                                                                onValueChange={setSortBy}
                                                                        >
                                                                                <SelectTrigger className="w-48">
                                                                                        <SelectValue />
                                                                                </SelectTrigger>
                                                                                <SelectContent>
                                                                                        <SelectItem value="date_desc">
                                                                                                Terbaru
                                                                                        </SelectItem>
                                                                                        <SelectItem value="date_asc">
                                                                                                Terlama
                                                                                        </SelectItem>
                                                                                        <SelectItem value="price_desc">
                                                                                                Harga Tertinggi
                                                                                        </SelectItem>
                                                                                        <SelectItem value="price_asc">
                                                                                                Harga Terendah
                                                                                        </SelectItem>
                                                                                </SelectContent>
                                                                        </Select>
                                                                </div>
                                                        </div>
                                                </div>
                                        </CardContent>
                                </Card>

                                {/* Bookings List */}
                                {sortedBookings.length === 0 ? (
                                        <Card>
                                                <CardContent className="p-12">
                                                        <div className="text-center">
                                                                <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                                        {selectedTab === "all"
                                                                                ? "Belum ada pemesanan"
                                                                                : selectedTab === "upcoming"
                                                                                ? "Tidak ada pemesanan yang akan datang"
                                                                                : selectedTab === "completed"
                                                                                ? "Belum ada pemesanan yang selesai"
                                                                                : "Tidak ada pemesanan yang dibatalkan"}
                                                                </h3>
                                                                <p className="text-gray-500 mb-6">
                                                                        {selectedTab === "all"
                                                                                ? "Mulai booking lapangan favorit Anda sekarang!"
                                                                                : "Coba ubah filter atau buat pemesanan baru."}
                                                                </p>
                                                                <Button className="bg-sport-blue hover:bg-blue-700">
                                                                        Cari Lapangan
                                                                </Button>
                                                        </div>
                                                </CardContent>
                                        </Card>
                                ) : (
                                        <div className="space-y-4">
                                                {sortedBookings.map((booking: any) => (
                                                        <Card key={booking.id} className="overflow-hidden">
                                                                <CardContent className="p-6">
                                                                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                                                                                {/* Booking Info */}
                                                                                <div className="flex flex-col md:flex-row md:items-start space-y-4 md:space-y-0 md:space-x-6 flex-1">
                                                                                        {/* Facility Image */}
                                                                                        <div className="w-full md:w-32 h-24 bg-gray-200 rounded-lg overflow-hidden">
                                                                                                <img
                                                                                                        src={
                                                                                                                booking.facility
                                                                                                                        ?.images?.[0] ||
                                                                                                                image
                                                                                                        }
                                                                                                        alt={booking.facility?.name}
                                                                                                        className="w-full h-full object-cover"
                                                                                                />
                                                                                        </div>

                                                                                        {/* Booking Details */}
                                                                                        <div className="flex-1 space-y-3">
                                                                                                <div>
                                                                                                        <h3 className="text-lg font-semibold text-gray-900">
                                                                                                                {booking.facility
                                                                                                                        ?.name ||
                                                                                                                        "Unknown Facility"}
                                                                                                        </h3>
                                                                                                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                                                                                                                <div className="flex items-center">
                                                                                                                        <MapPin className="h-4 w-4 mr-1" />
                                                                                                                        {booking.business
                                                                                                                                ?.businessName ||
                                                                                                                                "Unknown Business"}
                                                                                                                </div>
                                                                                                                <div className="flex items-center">
                                                                                                                        <Users className="h-4 w-4 mr-1" />
                                                                                                                        {booking.facility
                                                                                                                                ?.sportType ||
                                                                                                                                "Unknown Sport"}
                                                                                                                </div>
                                                                                                        </div>
                                                                                                </div>

                                                                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                                                                        <div className="flex items-center">
                                                                                                                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                                                                                                <span>
                                                                                                                        {new Date(
                                                                                                                                booking.bookingDate
                                                                                                                        ).toLocaleDateString(
                                                                                                                                "id-ID",
                                                                                                                                {
                                                                                                                                        weekday:
                                                                                                                                                "long",
                                                                                                                                        day: "numeric",
                                                                                                                                        month: "long",
                                                                                                                                        year: "numeric",
                                                                                                                                }
                                                                                                                        )}
                                                                                                                </span>
                                                                                                        </div>
                                                                                                        <div className="flex items-center">
                                                                                                                <Clock className="h-4 w-4 mr-2 text-gray-400" />
                                                                                                                <span>
                                                                                                                        {booking.startTime}{" "}
                                                                                                                        - {booking.endTime}
                                                                                                                </span>
                                                                                                        </div>
                                                                                                        <div className="flex items-center">
                                                                                                                <span className="font-medium">
                                                                                                                        Durasi:{" "}
                                                                                                                        {booking.duration}{" "}
                                                                                                                        jam
                                                                                                                </span>
                                                                                                        </div>
                                                                                                </div>

                                                                                                <div className="flex items-center justify-between">
                                                                                                        <div className="flex items-center space-x-3">
                                                                                                                {getStatusIcon(
                                                                                                                        booking.status
                                                                                                                )}
                                                                                                                {getStatusBadge(
                                                                                                                        booking.status
                                                                                                                )}
                                                                                                        </div>
                                                                                                        <div className="text-right">
                                                                                                                <p className="text-lg font-bold text-sport-blue">
                                                                                                                        Rp{" "}
                                                                                                                        {parseFloat(
                                                                                                                                booking.totalPrice
                                                                                                                        ).toLocaleString()}
                                                                                                                </p>
                                                                                                                <p className="text-sm text-gray-500">
                                                                                                                        ID: #
                                                                                                                        {booking.id
                                                                                                                                .toString()
                                                                                                                                .padStart(
                                                                                                                                        6,
                                                                                                                                        "0"
                                                                                                                                )}
                                                                                                                </p>
                                                                                                        </div>
                                                                                                </div>
                                                                                        </div>
                                                                                </div>

                                                                                {/* Action Buttons */}
                                                                                <div className="flex flex-col space-y-2 lg:w-40">
                                                                                        {canWriteReview(booking) && (
                                                                                                <Button
                                                                                                        size="sm"
                                                                                                        variant="outline"
                                                                                                        onClick={() =>
                                                                                                                handleWriteReview(
                                                                                                                        booking
                                                                                                                )
                                                                                                        }
                                                                                                        className="w-full"
                                                                                                >
                                                                                                        <Star className="h-4 w-4 mr-2" />
                                                                                                        Beri Rating
                                                                                                </Button>
                                                                                        )}

                                                                                        {canCancelBooking(booking) && (
                                                                                                <Button
                                                                                                        size="sm"
                                                                                                        variant="destructive"
                                                                                                        onClick={() =>
                                                                                                                handleCancelBooking(
                                                                                                                        booking
                                                                                                                )
                                                                                                        }
                                                                                                        className="w-full"
                                                                                                >
                                                                                                        <X className="h-4 w-4 mr-2" />
                                                                                                        Batalkan
                                                                                                </Button>
                                                                                        )}

                                                                                        {booking.status === "completed" && (
                                                                                                <Button
                                                                                                        size="sm"
                                                                                                        variant="outline"
                                                                                                        className="w-full"
                                                                                                >
                                                                                                        <History className="h-4 w-4 mr-2" />
                                                                                                        Booking Lagi
                                                                                                </Button>
                                                                                        )}
                                                                                </div>
                                                                        </div>

                                                                        {/* Customer Info */}
                                                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                                                                <div className="text-sm text-gray-600">
                                                                                        <span className="font-medium">
                                                                                                Nama Pemesan:
                                                                                        </span>{" "}
                                                                                        {booking.customerName} •
                                                                                        <span className="font-medium ml-2">
                                                                                                Telepon:
                                                                                        </span>{" "}
                                                                                        {booking.customerPhone}
                                                                                        {booking.notes && (
                                                                                                <>
                                                                                                        <br />
                                                                                                        <span className="font-medium">
                                                                                                                Catatan:
                                                                                                        </span>{" "}
                                                                                                        {booking.notes}
                                                                                                </>
                                                                                        )}
                                                                                </div>
                                                                        </div>
                                                                </CardContent>
                                                        </Card>
                                                ))}
                                        </div>
                                )}
                        </div>

                        {/* Cancel Confirmation Modal */}
                        <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
                                <DialogContent>
                                        <DialogHeader>
                                                <DialogTitle>Konfirmasi Pembatalan</DialogTitle>
                                        </DialogHeader>
                                        <div className="py-4 space-y-4">
                                                <p className="text-gray-600">
                                                        Anda akan mengajukan pembatalan untuk pemesanan di{" "}
                                                        <span className="font-medium">
                                                                {selectedBooking?.facility?.name}
                                                        </span>{" "}
                                                        pada{" "}
                                                        <span className="font-medium">
                                                                {selectedBooking &&
                                                                        new Date(
                                                                                selectedBooking.bookingDate
                                                                        ).toLocaleDateString("id-ID")}
                                                        </span>
                                                </p>
                                                <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                Alasan pembatalan *
                                                        </label>
                                                        <textarea
                                                                value={cancellationReason}
                                                                onChange={(e) => setCancellationReason(e.target.value)}
                                                                placeholder="Jelaskan alasan Anda ingin membatalkan pemesanan ini..."
                                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sport-blue focus:border-transparent resize-none"
                                                                rows={3}
                                                                required
                                                        />
                                                </div>
                                                <p className="text-sm text-gray-500">
                                                        Pembatalan dapat dilakukan hingga 1 jam sebelum waktu booking. 
                                                        Permintaan pembatalan akan dikirim ke pemilik usaha untuk disetujui.
                                                </p>
                                        </div>
                                        <DialogFooter>
                                                <Button
                                                        variant="outline"
                                                        onClick={() => setCancelModalOpen(false)}
                                                >
                                                        Batal
                                                </Button>
                                                <Button
                                                        variant="destructive"
                                                        onClick={confirmCancel}
                                                        disabled={requestCancellationMutation.isPending || !cancellationReason.trim()}
                                                >
                                                        {requestCancellationMutation.isPending
                                                                ? "Mengajukan..."
                                                                : "Ajukan Pembatalan"}
                                                </Button>
                                        </DialogFooter>
                                </DialogContent>
                        </Dialog>

                        {/* Review Modal */}
                        {selectedBooking && (
                                <ReviewModal
                                        open={reviewModalOpen}
                                        onClose={() => {
                                                setReviewModalOpen(false);
                                                setSelectedBooking(null);
                                        }}
                                        facilityId={selectedBooking.facility?.id}
                                        bookingId={selectedBooking.id}
                                        facilityName={selectedBooking.facility?.name || ""}
                                />
                        )}
                </div>
        );
}
