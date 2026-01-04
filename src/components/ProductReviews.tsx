import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Star, Loader2, User } from 'lucide-react';

interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profile?: {
    full_name: string | null;
  };
}

interface ProductReviewsProps {
  productId: string;
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [userReview, setUserReview] = useState<Review | null>(null);

  const fetchReviews = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      // Fetch profile names for each review
      const reviewsWithProfiles = await Promise.all(
        data.map(async (review) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', review.user_id)
            .maybeSingle();
          return { ...review, profile };
        })
      );
      setReviews(reviewsWithProfiles);
      
      // Check if current user has a review
      if (user) {
        const existing = reviewsWithProfiles.find(r => r.user_id === user.id);
        setUserReview(existing || null);
        if (existing) {
          setRating(existing.rating);
          setComment(existing.comment || '');
        }
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, [productId, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || rating === 0) return;

    setSubmitting(true);
    try {
      if (userReview) {
        // Update existing review
        const { error } = await supabase
          .from('reviews')
          .update({ rating, comment: comment || null })
          .eq('id', userReview.id);

        if (error) throw error;
        toast({ title: 'Review updated', description: 'Your review has been updated successfully.' });
      } else {
        // Create new review
        const { error } = await supabase
          .from('reviews')
          .insert({ product_id: productId, user_id: user.id, rating, comment: comment || null });

        if (error) throw error;
        toast({ title: 'Review submitted', description: 'Thank you for your feedback!' });
      }
      fetchReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({ title: 'Error', description: 'Failed to submit review.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (error) {
      toast({ title: 'Error', description: 'Failed to delete review.', variant: 'destructive' });
    } else {
      toast({ title: 'Review deleted', description: 'The review has been removed.' });
      if (userReview?.id === reviewId) {
        setUserReview(null);
        setRating(0);
        setComment('');
      }
      fetchReviews();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="glass-card rounded-xl p-6 md:p-8">
      <h2 className="font-display text-2xl text-foreground mb-6">Customer Reviews</h2>

      {/* Review Form */}
      {user && (
        <form onSubmit={handleSubmit} className="mb-8 pb-8 border-b border-border">
          <h3 className="font-display text-lg text-foreground mb-4">
            {userReview ? 'Update Your Review' : 'Write a Review'}
          </h3>
          
          {/* Star Rating */}
          <div className="flex items-center gap-2 mb-4">
            <span className="font-body text-sm text-muted-foreground mr-2">Your Rating:</span>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`h-6 w-6 transition-colors ${
                    star <= (hoverRating || rating)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-muted-foreground'
                  }`}
                />
              </button>
            ))}
          </div>

          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this product..."
            className="mb-4 bg-input"
            rows={4}
          />

          <Button type="submit" variant="gold" disabled={submitting || rating === 0}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {userReview ? 'Update Review' : 'Submit Review'}
          </Button>
        </form>
      )}

      {!user && (
        <div className="mb-8 pb-8 border-b border-border text-center">
          <p className="font-body text-muted-foreground">
            <a href="/auth" className="text-primary hover:underline">Sign in</a> to leave a review
          </p>
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 text-primary animate-spin" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8">
          <p className="font-body text-muted-foreground">No reviews yet. Be the first to review this product!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="pb-6 border-b border-border/50 last:border-0">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-display text-foreground">
                      {review.profile?.full_name || 'Anonymous User'}
                    </p>
                    <p className="font-body text-xs text-muted-foreground">
                      {formatDate(review.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= review.rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-muted-foreground'
                        }`}
                      />
                    ))}
                  </div>
                  {(user?.id === review.user_id || isAdmin) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(review.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </div>
              {review.comment && (
                <p className="font-body text-muted-foreground mt-3 ml-13 pl-13">
                  {review.comment}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}