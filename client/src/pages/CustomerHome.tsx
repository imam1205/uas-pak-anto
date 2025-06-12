import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import SearchFilters from "@/components/SearchFilters";
import FacilityCard from "@/components/FacilityCard";
import BookingModal from "@/components/BookingModal";
import {
	SearchFilters as SearchFiltersType,
	FacilityWithDetails,
} from "@/lib/types";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";

export default function CustomerHome() {
	const [, navigate] = useLocation();
	const [filters, setFilters] = useState<SearchFiltersType>({});
	const [selectedFacility, setSelectedFacility] =
		useState<FacilityWithDetails | null>(null);
	const [bookingModalOpen, setBookingModalOpen] = useState(false);

	// Build query params from filters
	const queryParams = new URLSearchParams();
	Object.entries(filters).forEach(([key, value]) => {
		if (value !== undefined && value !== "" && value !== null) {
			queryParams.append(key, value.toString());
		}
	});

	const {
		data: facilities = [],
		isLoading,
		refetch,
	} = useQuery({
		queryKey: ["/api/facilities/search", queryParams.toString()],
		queryFn: async () => {
			const response = await fetch(
				`/api/facilities/search?${queryParams.toString()}`
			);
			if (!response.ok) throw new Error("Failed to fetch facilities");
			return response.json();
		},
	});

	const handleSearch = () => {
		refetch();
	};

	const handleBookFacility = (facility: FacilityWithDetails) => {
		setSelectedFacility(facility);
		setBookingModalOpen(true);
	};

	const handleViewFacility = (facility: FacilityWithDetails) => {
		navigate(`/facility/${facility.id}`);
	};

	return (
		<div className="bg-gray-50 min-h-screen">
			{/* Hero Section */}
			<section className="bg-gradient-to-br from-blue-600 to-blue-700 text-white py-16">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-12">
						<h1 className="text-4xl md:text-5xl font-bold mb-4">
							Temukan Lapangan Olahraga Terbaik
						</h1>
						<p className="text-xl text-blue-100 max-w-2xl mx-auto">
							Booking lapangan favorit Anda dengan mudah dan cepat
						</p>
					</div>

					{/* <div className="max-w-4xl mx-auto">
						<SearchFilters
							filters={filters}
							onFiltersChange={setFilters}
							onSearch={handleSearch}
						/>
					</div> */}
				</div>
			</section>

			{/* Search Results */}
			<section className="py-12">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex flex-col lg:flex-row gap-8">
						{/* Filter Sidebar */}
						<div className="lg:w-1/4">
							<SearchFilters
								filters={filters}
								onFiltersChange={setFilters}
								onSearch={handleSearch}
							/>
						</div>

						{/* Results */}
						<div className="lg:w-3/4">
							<div className="flex justify-between items-center mb-6">
								<h2 className="text-xl font-semibold">
									{isLoading
										? "Mencari..."
										: `${facilities.length} Lapangan Ditemukan`}
								</h2>
								<Select>
									<SelectTrigger className="w-48">
										<SelectValue placeholder="Urutkan: Relevan" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="relevant">
											Urutkan: Relevan
										</SelectItem>
										<SelectItem value="price_low">
											Harga: Terendah
										</SelectItem>
										<SelectItem value="price_high">
											Harga: Tertinggi
										</SelectItem>
										<SelectItem value="rating">
											Rating: Tertinggi
										</SelectItem>
										<SelectItem value="distance">
											Jarak: Terdekat
										</SelectItem>
									</SelectContent>
								</Select>
							</div>

							{isLoading ? (
								<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
									{[...Array(6)].map((_, i) => (
										<div
											key={i}
											className="bg-white rounded-xl shadow-sm overflow-hidden"
										>
											<div className="w-full h-48 bg-gray-200 animate-pulse"></div>
											<div className="p-4 space-y-3">
												<div className="h-4 bg-gray-200 rounded animate-pulse"></div>
												<div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
												<div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
											</div>
										</div>
									))}
								</div>
							) : facilities.length === 0 ? (
								<div className="text-center py-12">
									<div className="text-gray-500 mb-4">
										<svg
											className="mx-auto h-12 w-12"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
											/>
										</svg>
									</div>
									<h3 className="text-lg font-medium text-gray-900 mb-2">
										Tidak ada lapangan ditemukan
									</h3>
									<p className="text-gray-500 mb-4">
										Coba ubah filter pencarian Anda
									</p>
									<Button
										onClick={handleSearch}
										className="bg-sport-blue hover:bg-blue-700"
									>
										Cari Lagi
									</Button>
								</div>
							) : (
								<>
									<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
										{facilities.map(
											(facility: FacilityWithDetails) => (
												<FacilityCard
													key={facility.id}
													facility={facility}
													onBook={handleBookFacility}
													onView={handleViewFacility}
												/>
											)
										)}
									</div>

									{/* Pagination */}
									<div className="flex justify-center mt-8">
										<nav className="flex items-center space-x-2">
											<Button variant="outline" size="sm">
												<ChevronLeft className="h-4 w-4" />
											</Button>
											<Button
												variant="default"
												size="sm"
												className="bg-sport-blue"
											>
												1
											</Button>
											<Button variant="outline" size="sm">
												2
											</Button>
											<Button variant="outline" size="sm">
												3
											</Button>
											<Button variant="outline" size="sm">
												<ChevronRight className="h-4 w-4" />
											</Button>
										</nav>
									</div>
								</>
							)}
						</div>
					</div>
				</div>
			</section>

			{/* Booking Modal */}
			<BookingModal
				facility={selectedFacility}
				open={bookingModalOpen}
				onClose={() => {
					setBookingModalOpen(false);
					setSelectedFacility(null);
				}}
			/>
		</div>
	);
}
