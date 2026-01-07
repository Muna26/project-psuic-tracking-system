'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';

type RatingModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (rating: number, feedback: string) => void;
    ticketTitle: string;
};

export default function RatingModal({ isOpen, onClose, onSubmit, ticketTitle }: RatingModalProps) {
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [hover, setHover] = useState(0);

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (rating === 0) return alert('Please select a rating');
        onSubmit(rating, feedback);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl">
                <h2 className="text-2xl font-bold text-center mb-2">Rate Service</h2>
                <p className="text-gray-500 text-center mb-6">How was the repair for &quot;{ticketTitle}&quot;?</p>

                <div className="flex justify-center gap-2 mb-6">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            className="focus:outline-none transition-transform hover:scale-110"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHover(star)}
                            onMouseLeave={() => setHover(rating)}
                        >
                            <Star
                                size={32}
                                className={`${star <= (hover || rating)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                    } transition-colors`}
                            />
                        </button>
                    ))}
                </div>

                <textarea
                    className="w-full p-3 border rounded-lg mb-6 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                    rows={3}
                    placeholder="Any additional feedback? (Optional)"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                />

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition"
                    >
                        Skip
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={rating === 0}
                        className="flex-1 py-2 bg-yellow-400 text-yellow-900 font-bold rounded-lg hover:bg-yellow-500 transition disabled:opacity-50"
                    >
                        Submit Review
                    </button>
                </div>
            </div>
        </div>
    );
}
