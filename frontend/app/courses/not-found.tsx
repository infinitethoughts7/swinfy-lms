import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-sora font-black text-text-primary mb-4">404</h1>
          <h2 className="text-2xl font-sora font-bold text-text-primary mb-4">
            Course Not Found
          </h2>
          <p className="text-text-secondary font-inter max-w-md mx-auto">
            The course you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link
            href="/courses"
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-inter font-semibold rounded-lg transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Courses
          </Link>
          
          <div>
            <Link
              href="/"
              className="text-text-secondary hover:text-text-primary font-inter transition-colors"
            >
              Go to Homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
