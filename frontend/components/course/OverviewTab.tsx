'use client';

interface OverviewTabProps {
  learningOutcomes: string;
  description: string;
  prerequisites?: string;
  tags: string[];
  rating: string;
  enrollmentCount: number;
  viewCount: number;
}

export default function OverviewTab({
  learningOutcomes,
  description,
  prerequisites,
  tags,
  rating,
  enrollmentCount,
  viewCount
}: OverviewTabProps) {
  
  // Parse learning outcomes
  const parseLearningOutcomes = () => {
    if (!learningOutcomes || !learningOutcomes.trim()) return [];
    
    let outcomes: string[] = [];
    
    if (learningOutcomes.includes('•')) {
      outcomes = learningOutcomes.split(/[•\n]/).filter(line => line.trim());
    } else if (learningOutcomes.includes(',')) {
      outcomes = learningOutcomes.split(',').filter(line => line.trim());
    } else {
      outcomes = [learningOutcomes];
    }
    
    return outcomes.map(outcome => outcome.trim()).filter(Boolean);
  };

  const outcomes = parseLearningOutcomes();

  return (
    <div className="space-y-6">
      {/* What You'll Learn */}
      {outcomes.length > 0 && (
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            What You&apos;ll Learn
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {outcomes.map((outcome, index) => (
              <div key={index} className="flex items-start space-x-2">
                <div className="flex-shrink-0 w-5 h-5 bg-gray-900 rounded-full flex items-center justify-center mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed flex-1">{outcome}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* About This Course */}
      {description && description.trim() && (
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            About This Course
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {description}
          </p>
        </div>
      )}

      {/* Course Stats - Only Rating, Students, Views */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Course Statistics
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {/* Rating */}
          <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-gray-900 mb-1">{rating}</div>
            <p className="text-xs text-gray-600">Rating</p>
          </div>

          {/* Students */}
          <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-gray-900 mb-1">{enrollmentCount.toLocaleString()}</div>
            <p className="text-xs text-gray-600">Students</p>
          </div>

          {/* Views */}
          <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-gray-900 mb-1">{viewCount?.toLocaleString() || 0}</div>
            <p className="text-xs text-gray-600">Views</p>
          </div>
        </div>
      </div>

      {/* Prerequisites */}
      {prerequisites && prerequisites.trim() && (
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Prerequisites
          </h2>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {prerequisites}
            </p>
          </div>
        </div>
      )}

      {/* Tags */}
      {tags && tags.length > 0 && (
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Course Tags
          </h2>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm font-medium border border-gray-200 hover:bg-gray-200 transition-colors"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}