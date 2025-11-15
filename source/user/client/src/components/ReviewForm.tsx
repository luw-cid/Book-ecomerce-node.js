import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Star } from 'lucide-react';
import axios from 'axios';

interface ReviewFormProps {
    productId: string;
    isAuthenticated: boolean;
    onReviewSubmitted: () => void;
}

export function ReviewForm({ productId, isAuthenticated, onReviewSubmitted }: ReviewFormProps) {
    const [customerName, setCustomerName] = useState('');
    const [title, setTitle] = useState('');
    const [comment, setComment] = useState('');
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!customerName.trim() || !title.trim() || !comment.trim()) {
            setError('Please fill in all fields');
            return;
        }

        if (comment.length < 20) {
            setError('Comment must be at least 20 characters');
            return;
        }

        setIsSubmitting(true);

        try {
            // Submit review (không cần login)
            await axios.post(`http://localhost:3000/reviews/${productId}/review`, {
                customerName,
                title,
                comment,
                season: ['spring', 'summer', 'autumn', 'winter'][Math.floor(Math.random() * 4)]
            });

            // Submit rating (nếu đã login và có rating)
            if (isAuthenticated && rating > 0) {
                const token = localStorage.getItem('token');
                await axios.post(
                    `http://localhost:3000/reviews/${productId}/rating`,
                    { rating },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
            }

            // Reset form
            setCustomerName('');
            setTitle('');
            setComment('');
            setRating(0);

            onReviewSubmitted();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to submit review');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Write a Review</h3>

                <form onSubmit={handleSubmitReview} className="space-y-4">
                    {/* Name */}
                    <div>
                        <Label htmlFor="name">Your Name *</Label>
                        <Input
                            id="name"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="Enter your name"
                            required
                        />
                    </div>

                    {/* Rating (chỉ hiện nếu đã login) */}
                    {isAuthenticated && (
                        <div>
                            <Label>Your Rating {rating > 0 && `(${rating} stars)`}</Label>
                            <div className="flex items-center space-x-1 mt-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        className="focus:outline-none"
                                    >
                                        <Star
                                            className={`h-8 w-8 transition-colors ${star <= (hoverRating || rating)
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'text-gray-300'
                                                }`}
                                        />
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Rating requires login
                            </p>
                        </div>
                    )}

                    {!isAuthenticated && (
                        <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
                            ⚠️ Please log in to submit a star rating
                        </p>
                    )}

                    {/* Title */}
                    <div>
                        <Label htmlFor="title">Review Title *</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Sum up your experience in a few words"
                            required
                        />
                    </div>

                    {/* Comment */}
                    <div>
                        <Label htmlFor="comment">Your Review * (min 20 characters)</Label>
                        <Textarea
                            id="comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share your thoughts about this book..."
                            rows={5}
                            required
                            className="resize-none"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            {comment.length} / 20 characters minimum
                        </p>
                    </div>

                    {error && (
                        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                            {error}
                        </p>
                    )}

                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-spring via-summer via-autumn to-winter text-white hover:opacity-90"
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Review'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}