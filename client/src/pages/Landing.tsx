import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dumbbell, Users, Clock, Star, MapPin, CreditCard } from "lucide-react";

export default function Landing() {
	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<nav className="bg-white shadow-sm border-b">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between h-16">
						<div className="flex items-center">
							<div className="flex-shrink-0 flex items-center">
								<Dumbbell className="text-sport-blue text-2xl mr-2" />
								<span className="text-xl font-bold text-gray-900">
									SportBooking
								</span>
							</div>
						</div>
						<div className="flex items-center space-x-4">
							<Button
								variant="outline"
								onClick={() =>
									(window.location.href = "/login")
								}
							>
								Masuk
							</Button>
							<Button
								className="bg-sport-blue hover:bg-blue-700 text-white"
								onClick={() =>
									(window.location.href = "/login")
								}
							>
								Daftar
							</Button>
						</div>
					</div>
				</div>
			</nav>

			{/* Hero Section */}
			<section className="bg-gradient-to-br from-blue-600 to-blue-700 text-white py-20">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<h1 className="text-4xl md:text-6xl font-bold mb-6">
						Temukan Lapangan Olahraga Terbaik
					</h1>
					<p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
						Platform reservasi lapangan olahraga terlengkap di
						Indonesia. Booking lapangan favorit Anda dengan mudah
						dan cepat.
					</p>
					<Button
						size="lg"
						className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg"
						onClick={() => (window.location.href = "/api/login")}
					>
						Mulai Booking Sekarang
					</Button>
				</div>
			</section>

			{/* Features Section */}
			<section className="py-16">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-12">
						<h2 className="text-3xl font-bold text-gray-900 mb-4">
							Mengapa Memilih SportBooking?
						</h2>
						<p className="text-gray-600 max-w-2xl mx-auto">
							Kami memberikan pengalaman terbaik untuk booking
							lapangan olahraga dengan berbagai keunggulan
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						<Card className="text-center p-6">
							<CardContent className="pt-6">
								<div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
									<MapPin className="text-blue-600" />
								</div>
								<h3 className="text-xl font-semibold mb-2">
									Lokasi Strategis
								</h3>
								<p className="text-gray-600">
									Temukan lapangan terdekat dengan sistem
									pencarian berdasarkan lokasi yang akurat
								</p>
							</CardContent>
						</Card>

						<Card className="text-center p-6">
							<CardContent className="pt-6">
								<div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
									<Clock className="text-green-600" />
								</div>
								<h3 className="text-xl font-semibold mb-2">
									Booking Real-time
								</h3>
								<p className="text-gray-600">
									Cek ketersediaan dan booking lapangan secara
									real-time tanpa perlu menunggu konfirmasi
								</p>
							</CardContent>
						</Card>

						<Card className="text-center p-6">
							<CardContent className="pt-6">
								<div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4">
									<CreditCard className="text-yellow-600" />
								</div>
								<h3 className="text-xl font-semibold mb-2">
									Pembayaran Mudah
								</h3>
								<p className="text-gray-600">
									Berbagai metode pembayaran yang aman dan
									mudah untuk kenyamanan Anda
								</p>
							</CardContent>
						</Card>

						<Card className="text-center p-6">
							<CardContent className="pt-6">
								<div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
									<Star className="text-purple-600" />
								</div>
								<h3 className="text-xl font-semibold mb-2">
									Review & Rating
								</h3>
								<p className="text-gray-600">
									Baca review dari pengguna lain dan berikan
									rating untuk membantu komunitas
								</p>
							</CardContent>
						</Card>

						<Card className="text-center p-6">
							<CardContent className="pt-6">
								<div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
									<Users className="text-red-600" />
								</div>
								<h3 className="text-xl font-semibold mb-2">
									Komunitas Aktif
								</h3>
								<p className="text-gray-600">
									Bergabung dengan komunitas olahraga dan
									temukan partner bermain
								</p>
							</CardContent>
						</Card>

						<Card className="text-center p-6">
							<CardContent className="pt-6">
								<div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
									<Dumbbell className="text-indigo-600" />
								</div>
								<h3 className="text-xl font-semibold mb-2">
									Beragam Olahraga
								</h3>
								<p className="text-gray-600">
									Futsal, badminton, basket, tenis, dan
									berbagai jenis olahraga lainnya
								</p>
							</CardContent>
						</Card>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="bg-sport-blue py-16">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<h2 className="text-3xl font-bold text-white mb-4">
						Siap Memulai Aktivitas Olahraga Anda?
					</h2>
					<p className="text-blue-100 mb-8 max-w-2xl mx-auto">
						Bergabunglah dengan ribuan pengguna yang sudah merasakan
						kemudahan booking lapangan di SportBooking
					</p>
					<div className="space-x-4">
						<Button
							size="lg"
							className="bg-white text-blue-600 hover:bg-gray-100"
							onClick={() =>
								(window.location.href = "/api/login")
							}
						>
							Mulai sebagai Pelanggan
						</Button>
						<Button
							size="lg"
							variant="outline"
							className="border-white text-white hover:bg-white hover:text-blue-600"
							onClick={() =>
								(window.location.href = "/api/login")
							}
						>
							Daftar sebagai Pemilik Usaha
						</Button>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="bg-gray-900 text-white py-12">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="grid grid-cols-1 md:grid-cols-4 gap-8">
						<div>
							<div className="flex items-center mb-4">
								<Dumbbell className="text-blue-400 mr-2" />
								<span className="text-xl font-bold">
									SportBooking
								</span>
							</div>
							<p className="text-gray-400">
								Platform reservasi lapangan olahraga terdepan di
								Indonesia
							</p>
						</div>
						<div>
							<h3 className="text-lg font-semibold mb-4">
								Layanan
							</h3>
							<ul className="space-y-2 text-gray-400">
								<li>Booking Lapangan</li>
								<li>Manajemen Fasilitas</li>
								<li>Review & Rating</li>
								<li>Pembayaran Online</li>
							</ul>
						</div>
						<div>
							<h3 className="text-lg font-semibold mb-4">
								Olahraga
							</h3>
							<ul className="space-y-2 text-gray-400">
								<li>Futsal</li>
								<li>Badminton</li>
								<li>Basketball</li>
								<li>Tennis</li>
							</ul>
						</div>
						<div>
							<h3 className="text-lg font-semibold mb-4">
								Bantuan
							</h3>
							<ul className="space-y-2 text-gray-400">
								<li>FAQ</li>
								<li>Kontak Kami</li>
								<li>Kebijakan Privasi</li>
								<li>Syarat & Ketentuan</li>
							</ul>
						</div>
					</div>
					<div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
						<p>&copy; 2024 SportBooking. All rights reserved.</p>
					</div>
				</div>
			</footer>
		</div>
	);
}
