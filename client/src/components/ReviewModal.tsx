import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Star } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ReviewModalProps {
  open: boolean;
  onClose: () => void;
  facilityId: number;
  bookingId?: number;
  facilityName: string;
}

export default function ReviewModal({ 
  open, 
  onClose, 
  facilityId, 
  bookingId, 
  facilityName 
}: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createReviewMutation = useMutation({
    mutationFn: (reviewData: any) => apiRequest("POST", "/api/reviews", reviewData),
    onSuccess: () => {
      toast({
        title: "Review berhasil dikirim!",
        description: "Terima kasih atas review Anda.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/reviews/facility", facilityId] });
      queryClient.invalidateQueries({ queryKey: ["/api/facilities/search"] });
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Gagal mengirim review",
        description: error.message || "Terjadi kesalahan saat mengirim review",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setRating(0);
    setHoveredRating(0);
    setComment("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast({
        title: "Rating diperlukan",
        description: "Mohon berikan rating untuk lapangan ini",
        variant: "destructive",
      });
      return;
    }

    const reviewData = {
      facilityId,
      bookingId,
      rating,
      comment: comment.trim() || undefined,
    };

    createReviewMutation.mutate(reviewData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Berikan Review</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Bagaimana pengalaman Anda di <span className="font-medium">{facilityName}</span>?
            </p>

            {/* Star Rating */}
            <div className="flex flex-col items-center space-y-4">
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="p-1 transition-colors"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= (hoveredRating || rating)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
              
              {rating > 0 && (
                <p className="text-sm text-gray-600">
                  {rating === 1 && "Sangat Buruk"}
                  {rating === 2 && "Buruk"}
                  {rating === 3 && "Cukup"}
                  {rating === 4 && "Baik"}
                  {rating === 5 && "Sangat Baik"}
                </p>
              )}
            </div>
          </div>

          {/* Comment */}
          <div>
            <Label htmlFor="comment" className="text-sm font-medium">
              Komentar (opsional)
            </Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Ceritakan pengalaman Anda..."
              rows={4}
              className="mt-2"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
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
              disabled={createReviewMutation.isPending || rating === 0}
            >
              {createReviewMutation.isPending ? "Mengirim..." : "Kirim Review"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
