import { useQuery } from "@tanstack/react-query";

export function useAuth() {
	const { data: user, isLoading } = useQuery({
		queryKey: ["/api/auth/user"],
		queryFn: async () => {
			const req = await fetch("/api/auth/user", {
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem("session")}`,
				},
			});

			if (req.status == 401) return;

			const res = await req.json();
			return res;
		},
		retry: false,
	});

	return {
		user,
		isLoading,
		isAuthenticated: !!user,
	};
}
