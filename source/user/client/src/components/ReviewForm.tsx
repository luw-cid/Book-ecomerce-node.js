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

        if (!customerName.trim() || !comment.trim()) {
            setError('Please provide your name and comment');
            return;
        }

        setIsSubmitting(true);

        try {
            if (isAuthenticated && rating > 0) {
                // User đã login VÀ có rating → Gửi cả comment + rating trong 1 request
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');

                console.log('🔑 Submitting review + rating with token:', token ? 'Present' : 'Missing');

                await axios.post(
                    `http://localhost:3000/reviews/${productId}/review`,
                    {
                        customerName,
                        title,
                        comment,
                        rating
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}` // ← GỬI TOKEN để verify user
                        }
                    }
                );
            } else {
                // User chưa login HOẶC không có rating → Chỉ gửi comment
                await axios.post(`http://localhost:3000/reviews/${productId}/review`, {
                    customerName,
                    title,
                    comment
                });
            }

            // Reset form
            setCustomerName('');
            setTitle('');
            setComment('');
            setRating(0);

            onReviewSubmitted();
        } catch (err: any) {
            console.error('❌ Submit error:', err); // ← LOG
            console.error('❌ Response data:', err.response?.data);
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
                        <Label htmlFor="comment">Your Review *</Label>
                        <Textarea
                            id="comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share your thoughts about this book..."
                            rows={5}
                            required
                            className="resize-none"
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                            {error}
                        </p>
                    )}

                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full"
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Review'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}