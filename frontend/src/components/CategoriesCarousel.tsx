import { useState, useRef, useEffect } from 'react'

const CategoriesCarousel = () => {
  const [activeTab, setActiveTab] = useState('technical')
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const categories = {
    technical: [
      { name: 'Artificial Intelligence', icon: '🤖', count: 45, color: 'from-primary-500 to-primary-600' },
      { name: 'Data Science', icon: '📊', count: 38, color: 'from-blue-500 to-blue-600' },
      { name: 'Machine Learning', icon: '🧠', count: 32, color: 'from-purple-500 to-purple-600' },
      { name: 'Web Development', icon: '💻', count: 56, color: 'from-green-500 to-green-600' },
      { name: 'Mobile Development', icon: '📱', count: 29, color: 'from-orange-500 to-orange-600' },
      { name: 'Cloud Computing', icon: '☁️', count: 24, color: 'from-indigo-500 to-indigo-600' },
      { name: 'Cybersecurity', icon: '🔒', count: 18, color: 'from-red-500 to-red-600' },
      { name: 'Blockchain', icon: '⛓️', count: 15, color: 'from-yellow-500 to-yellow-600' }
    ],
    lifeSkills: [
      { name: 'Leadership', icon: '👑', count: 22, color: 'from-pink-500 to-pink-600' },
      { name: 'Communication', icon: '💬', count: 35, color: 'from-primary-500 to-primary-600' },
      { name: 'Time Management', icon: '⏰', count: 28, color: 'from-orange-500 to-orange-600' },
      { name: 'Problem Solving', icon: '🧩', count: 31, color: 'from-blue-500 to-blue-600' },
      { name: 'Critical Thinking', icon: '🤔', count: 26, color: 'from-purple-500 to-purple-600' },
      { name: 'Emotional Intelligence', icon: '❤️', count: 19, color: 'from-red-500 to-red-600' },
      { name: 'Public Speaking', icon: '🎤', count: 23, color: 'from-green-500 to-green-600' },
      { name: 'Negotiation', icon: '🤝', count: 17, color: 'from-indigo-500 to-indigo-600' }
    ]
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault()
      const container = scrollContainerRef.current
      if (container) {
        const scrollAmount = e.key === 'ArrowLeft' ? -300 : 300
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
      }
    }
  }

  useEffect(() => {
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener('wheel', (e) => {
        e.preventDefault()
        container.scrollBy({ left: e.deltaY, behavior: 'smooth' })
      })
    }
  }, [])

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-charcoal mb-6">
            Explore Learning Categories
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose from our comprehensive range of technical and life skills courses
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-12">
          <div className="bg-white rounded-xl p-2 shadow-lg border border-gray-100">
            {['technical', 'lifeSkills'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-primary-600'
                }`}
              >
                {tab === 'technical' ? 'Technical Skills' : 'Life Skills'}
              </button>
            ))}
          </div>
        </div>

        {/* Categories Grid */}
        <div className="relative">
          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-6"
            onKeyDown={handleKeyDown}
            tabIndex={0}
          >
            {categories[activeTab as keyof typeof categories].map((category, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-80 snap-start"
              >
                <div className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 hover:border-gray-200 cursor-pointer">
                  {/* Icon and Count */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-16 h-16 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300`}>
                      {category.icon}
                    </div>
                    <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {category.count} courses
                    </span>
                  </div>
                  
                  {/* Category Name */}
                  <h3 className="text-xl font-bold text-charcoal mb-2 group-hover:text-primary-600 transition-colors duration-300">
                    {category.name}
                  </h3>
                  
                  {/* Hover effect line */}
                  <div className={`h-1 bg-gradient-to-r ${category.color} w-0 group-hover:w-full transition-all duration-500 rounded-full`} />
                </div>
              </div>
            ))}
          </div>

          {/* Scroll Indicators */}
          <div className="flex justify-center mt-8 space-x-2">
            {[0, 1, 2, 3].map((_, index) => (
              <div
                key={index}
                className="w-2 h-2 bg-gray-300 rounded-full transition-all duration-300"
              />
            ))}
          </div>
        </div>

        {/* Keyboard Navigation Hint */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            💡 Use arrow keys or scroll to navigate through categories
          </p>
        </div>
      </div>
    </section>
  )
}

export default CategoriesCarousel
