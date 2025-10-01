'use client';

import { Star } from 'lucide-react';

interface ReviewsTabProps {
  courseRating: string;
  totalReviews: number;
}

// Mock reviews for demonstration
const mockReviews = [
  {
    id: '1',
    student_name: 'Priya Sharma',
    rating: 5,
    comment: 'Excellent course! The instructor explains complex concepts in a very simple and understandable way. Highly recommended for anyone looking to master this subject.',
    created_at: '2024-09-15',
    helpful_count: 24
  },
  {
    id: '2',
    student_name: 'Rahul Kumar',
    rating: 4,
    comment: 'Great content and well-structured modules. The hands-on exercises really helped me understand the practical applications. Would love to see more advanced topics covered.',
    created_at: '2024-09-10',
    helpful_count: 18
  },
  {
    id: '3',
    student_name: 'Anita Desai',
    rating: 5,
    comment: 'Best investment I made in my learning journey! The course content is up-to-date and relevant. The instructor is very knowledgeable and responsive to questions.',
    created_at: '2024-09-05',
    helpful_count: 31
  },
  {
    id: '4',
    student_name: 'Vikram Singh',
    rating: 4,
    comment: 'Solid course with good practical examples. The pace is perfect for beginners. Some sections could use more depth, but overall a great learning experience.',
    created_at: '2024-08-28',
    helpful_count: 12
  },
  {
    id: '5',
    student_name: 'Meera Patel',
    rating: 5,
    comment: 'Outstanding course! Clear explanations, practical exercises, and excellent support. I feel confident applying what I learned in real projects.',
    created_at: '2024-08-20',
    helpful_count: 27
  }
];

export default function ReviewsTab({ courseRating, totalReviews }: ReviewsTabProps) {
  
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating
                ? 'text-yellow-500 fill-yellow-500'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      return `${Math.floor(diffDays / 7)} weeks ago`;
    } else if (diffDays < 365) {
      return `${Math.floor(diffDays / 30)} months ago`;
    } else {
      return `${Math.floor(diffDays / 365)} years ago`;
    }
  };

  // Calculate rating distribution
  const ratingDistribution = [
    { stars: 5, percentage: 68, count: Math.floor(totalReviews * 0.68) },
    { stars: 4, percentage: 20, count: Math.floor(totalReviews * 0.20) },
    { stars: 3, percentage: 8, count: Math.floor(totalReviews * 0.08) },
    { stars: 2, percentage: 3, count: Math.floor(totalReviews * 0.03) },
    { stars: 1, percentage: 1, count: Math.floor(totalReviews * 0.01) },
  ];

  return (
    <div className="space-y-8">
      {/* Rating Overview */}
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-8 border border-yellow-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Overall Rating */}
          <div className="text-center md:text-left">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Overall Rating</h3>
            <div className="flex items-center justify-center md:justify-start space-x-4">
              <div className="text-6xl font-black text-gray-900">
                {courseRating}
              </div>
              <div>
                <div className="flex items-center space-x-1 mb-2">
                  {renderStars(Math.round(parseFloat(courseRating)))}
                </div>
                <p className="text-sm text-gray-600 font-medium">
                  Based on {totalReviews.toLocaleString()} reviews
                </p>
              </div>
            </div>
          </div>

          {/* Rating Distribution */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Rating Breakdown</h3>
            <div className="space-y-2">
              {ratingDistribution.map((item) => (
                <div key={item.stars} className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1 w-20">
                    <span className="text-sm font-medium text-gray-700">{item.stars}</span>
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  </div>
                  <div className="flex-1 bg-white rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-yellow-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {item.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews List Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-gray-900">
          Student Reviews ({totalReviews})
        </h3>
        <select className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="recent">Most Recent</option>
          <option value="helpful">Most Helpful</option>
          <option value="highest">Highest Rating</option>
          <option value="lowest">Lowest Rating</option>
        </select>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {mockReviews.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 border border-gray-200 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reviews Yet</h3>
            <p className="text-gray-600">Be the first to review this course!</p>
          </div>
        ) : (
          mockReviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-md transition-shadow"
            >
              {/* Review Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  {/* User Avatar */}
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-bold text-white">
                      {review.student_name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-gray-900">
                      {review.student_name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {formatDate(review.created_at)}
                    </p>
                  </div>
                </div>
                {renderStars(review.rating)}
              </div>

              {/* Review Content */}
              <p className="text-gray-700 leading-relaxed mb-4">
                {review.comment}
              </p>

              {/* Review Actions */}
              <div className="flex items-center space-x-6 pt-4 border-t border-gray-100">
                <button className="flex items-center space-x-2 text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                  <span className="font-medium">Helpful ({review.helpful_count})</span>
                </button>
                <button className="flex items-center space-x-2 text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="font-medium">Reply</span>
                </button>
                <button className="flex items-center space-x-2 text-sm text-gray-600 hover:text-red-600 transition-colors ml-auto">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                  </svg>
                  <span className="font-medium">Report</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Load More Button */}
      {mockReviews.length > 0 && (
        <div className="text-center">
          <button className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-colors">
            Load More Reviews
          </button>
        </div>
      )}

      {/* Write a Review CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white text-center">
        <h3 className="text-2xl font-bold mb-2">Share Your Experience</h3>
        <p className="text-blue-100 mb-6">Help other students by sharing your thoughts about this course</p>
        <button className="bg-white text-blue-600 hover:bg-blue-50 font-bold px-8 py-3 rounded-xl transition-colors">
          Write a Review
        </button>
      </div>
    </div>
  );
}