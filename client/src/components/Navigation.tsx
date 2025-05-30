import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { Dumbbell, Bell, User, Store, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface NavigationProps {
  user: any;
}

export default function Navigation({ user }: NavigationProps) {
  const [location] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const switchRoleMutation = useMutation({
    mutationFn: (role: string) => apiRequest("PATCH", "/api/auth/user/role", { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Role berhasil diubah",
        description: "Halaman akan dimuat ulang...",
      });
      setTimeout(() => window.location.reload(), 1000);
    },
    onError: () => {
      toast({
        title: "Gagal mengubah role",
        description: "Silakan coba lagi",
        variant: "destructive",
      });
    },
  });

  const isCustomer = user?.role === "customer";
  const isBusiness = user?.role === "business";

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <Dumbbell className="text-sport-blue text-2xl mr-2" />
              <span className="text-xl font-bold text-gray-900">SportBooking</span>
            </Link>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              <Link
                href="/"
                className={`px-1 pt-1 text-sm font-medium border-b-2 ${
                  location === "/"
                    ? "text-sport-blue border-sport-blue"
                    : "text-gray-500 hover:text-gray-700 border-transparent"
                }`}
              >
                Beranda
              </Link>
              {isCustomer && (
                <>
                  <Link
                    href="/"
                    className="text-gray-500 hover:text-gray-700 px-1 pt-1 text-sm font-medium border-b-2 border-transparent"
                  >
                    Cari Lapangan
                  </Link>
                  <Link
                    href="/my-bookings"
                    className={`px-1 pt-1 text-sm font-medium border-b-2 ${
                      location === "/my-bookings"
                        ? "text-sport-blue border-sport-blue"
                        : "text-gray-500 hover:text-gray-700 border-transparent"
                    }`}
                  >
                    Pesanan Saya
                  </Link>
                </>
              )}
              {isBusiness && (
                <Link
                  href="/dashboard"
                  className={`px-1 pt-1 text-sm font-medium border-b-2 ${
                    location === "/dashboard"
                      ? "text-sport-blue border-sport-blue"
                      : "text-gray-500 hover:text-gray-700 border-transparent"
                  }`}
                >
                  Dashboard
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Button
                variant={isCustomer ? "default" : "outline"}
                size="sm"
                onClick={() => switchRoleMutation.mutate("customer")}
                disabled={switchRoleMutation.isPending}
              >
                <User className="mr-1 h-4 w-4" />
                Pelanggan
              </Button>
              <Button
                variant={isBusiness ? "default" : "outline"}
                size="sm"
                onClick={() => switchRoleMutation.mutate("business")}
                disabled={switchRoleMutation.isPending}
                className={isBusiness ? "bg-sport-blue hover:bg-blue-700" : ""}
              >
                <Store className="mr-1 h-4 w-4" />
                Pemilik Usaha
              </Button>
            </div>
            
            <Button variant="ghost" size="sm">
              <Bell className="h-5 w-5 text-gray-500" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profileImageUrl} alt={user?.firstName || "User"} />
                    <AvatarFallback>
                      {user?.firstName?.charAt(0) || user?.email?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    {user?.firstName && (
                      <p className="font-medium">{user.firstName} {user.lastName}</p>
                    )}
                    {user?.email && (
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    )}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <a href="/api/logout" className="flex items-center">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Keluar</span>
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
