import Image from 'next/image';
import StaticNavbar from '@/components/layout/StaticNavbar';
import Footer from '@/components/layout/Footer';

const TeamPage = () => {
  const mentors = [
    {
      id: 1,
      name: 'Rani Guntikadi',
      title: 'Senior Database Architect',
      expertise: 'SQL, Database Design, Performance Optimization',
      experience: '8+ years',
      company: 'Microsoft',
      students: '2,100+',
      rating: 4.9,
      image: '/assets/students/s2.jpg',
      linkedin: 'https://linkedin.com/in/rani-guntikadi',
      description: 'Rani is a database expert with over 8 years of experience in designing and optimizing large-scale database systems. She has helped thousands of students master SQL and database management.',
      achievements: [
        'Led database optimization projects saving companies ₹50Cr+ annually',
        'Published 15+ technical papers on database performance',
        'Mentored 2,100+ students with 94% placement rate'
      ]
    },
    {
      id: 2,
      name: 'Rakesh Ganji',
      title: 'Senior Python Developer',
      expertise: 'Python, Django, Full-Stack Development',
      experience: '10+ years',
      company: 'Google',
      students: '3,200+',
      rating: 4.9,
      image: '/assets/students/s11.jpg',
      linkedin: 'https://linkedin.com/in/rakesh-ganji',
      description: 'Rakesh is a full-stack developer with expertise in Python, Django, and modern web technologies. He has built scalable applications for top tech companies.',
      achievements: [
        'Built applications serving 10M+ users',
        'Open source contributor with 5K+ GitHub stars',
        'Helped 3,200+ students transition to tech careers'
      ]
    },
    {
      id: 3,
      name: 'Sumasri Vallapu',
      title: 'Excel & Business Intelligence Expert',
      expertise: 'Advanced Excel, VBA, Data Visualization',
      experience: '12+ years',
      company: 'Goldman Sachs',
      students: '1,250+',
      rating: 4.8,
      image: '/assets/students/s3.jpg',
      linkedin: 'https://linkedin.com/in/sumasri-vallapu',
      description: 'Sumasri is a business intelligence expert specializing in Excel, VBA, and data visualization. She has transformed financial modeling processes for Fortune 500 companies.',
      achievements: [
        'Automated processes saving 1000+ hours monthly',
        'Created financial models used by top investment banks',
        'Trained 1,250+ professionals in advanced Excel'
      ]
    }
  ];

  const teamMembers = [
    {
      id: 4,
      name: 'Priya Sharma',
      title: 'Head of Student Success',
      expertise: 'Career Guidance, Placement Support',
      experience: '6+ years',
      company: 'OLLA',
      students: '5,000+',
      rating: 4.9,
      image: '/assets/students/s1.jpg',
      linkedin: 'https://linkedin.com/in/priya-sharma',
      description: 'Priya leads our student success initiatives, ensuring every student gets the support they need to achieve their career goals.',
      achievements: [
        'Achieved 94% placement rate for students',
        'Built partnerships with 500+ companies',
        'Guided 5,000+ students in their career journey'
      ]
    },
    {
      id: 5,
      name: 'Arjun Patel',
      title: 'Technical Curriculum Lead',
      expertise: 'Curriculum Design, Learning Experience',
      experience: '7+ years',
      company: 'OLLA',
      students: '8,000+',
      rating: 4.8,
      image: '/assets/students/s4.jpg',
      linkedin: 'https://linkedin.com/in/arjun-patel',
      description: 'Arjun designs our technical curriculum, ensuring students learn the most relevant and in-demand skills for today\'s job market.',
      achievements: [
        'Designed 50+ industry-relevant courses',
        'Collaborated with 200+ industry experts',
        'Improved student learning outcomes by 40%'
      ]
    },
    {
      id: 6,
      name: 'Kavya Reddy',
      title: 'Community Manager',
      expertise: 'Community Building, Student Engagement',
      experience: '5+ years',
      company: 'OLLA',
      students: '10,000+',
      rating: 4.9,
      image: '/assets/students/s5.jpg',
      linkedin: 'https://linkedin.com/in/kavya-reddy',
      description: 'Kavya manages our vibrant student community, creating engaging experiences and fostering peer-to-peer learning.',
      achievements: [
        'Built community of 10,000+ active learners',
        'Organized 100+ networking events',
        'Increased student engagement by 60%'
      ]
    }
  ];

  const stats = [
    { number: '15+', label: 'Expert Mentors', description: 'Industry veterans with 8+ years experience' },
    { number: '25,000+', label: 'Students Trained', description: 'Across all our programs' },
    { number: '94%', label: 'Success Rate', description: 'Students placed in top companies' },
    { number: '500+', label: 'Partner Companies', description: 'Trust our talent pipeline' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <StaticNavbar />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 pt-20">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-sora font-black text-white mb-6">
              Meet Our Expert Team
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 font-inter max-w-4xl mx-auto mb-8">
              Learn from industry veterans who have worked at top companies and are passionate about sharing their knowledge. 
              Our mentors have collectively trained over 25,000 students with a 94% success rate.
            </p>
            <div className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full text-white font-inter font-semibold">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Industry experts with 8+ years experience
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="text-4xl font-sora font-black text-blue-600 mb-2">{stat.number}</div>
              <div className="text-lg font-sora font-bold text-text-primary mb-1">{stat.label}</div>
              <div className="text-text-secondary font-inter text-sm">{stat.description}</div>
            </div>
          ))}
        </div>

        {/* Expert Mentors Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-sora font-bold text-text-primary mb-8 text-center">
            Our Expert Mentors
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {mentors.map((mentor) => (
              <div key={mentor.id} className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300">
                {/* Mentor Photo */}
                <div className="text-center mb-6">
                  <div className="relative w-32 h-32 mx-auto mb-4">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full p-1">
                      <div className="w-full h-full bg-white rounded-full p-1">
                        <div className="w-full h-full rounded-full overflow-hidden">
                          <Image
                            src={mentor.image}
                            alt={mentor.name}
                            width={128}
                            height={128}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-2xl font-sora font-bold text-text-primary mb-1">{mentor.name}</h3>
                  <p className="text-blue-600 font-inter font-semibold text-lg mb-1">{mentor.title}</p>
                  <p className="text-text-secondary font-inter text-sm mb-2">{mentor.experience} • {mentor.company}</p>
                  <div className="flex items-center justify-center space-x-4 text-sm text-text-secondary">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {mentor.rating}
                    </div>
                    <div>{mentor.students} students</div>
                  </div>
                </div>

                {/* Expertise */}
                <div className="mb-6">
                  <h4 className="font-sora font-bold text-text-primary mb-3">Expertise</h4>
                  <div className="flex flex-wrap gap-2">
                    {mentor.expertise.split(', ').map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-inter rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <p className="text-text-secondary font-inter leading-relaxed mb-6">
                  {mentor.description}
                </p>

                {/* Key Achievements */}
                <div className="mb-6">
                  <h4 className="font-sora font-bold text-text-primary mb-3">Key Achievements</h4>
                  <ul className="space-y-2">
                    {mentor.achievements.map((achievement, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm text-text-secondary">
                        <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>{achievement}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* LinkedIn */}
                <div className="text-center">
                  <a
                    href={mentor.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors font-inter font-semibold"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    <span>Connect on LinkedIn</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Members Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-sora font-bold text-text-primary mb-8 text-center">
            Our Core Team
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {teamMembers.map((member) => (
              <div key={member.id} className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300">
                {/* Team Member Photo */}
                <div className="text-center mb-6">
                  <div className="relative w-32 h-32 mx-auto mb-4">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full p-1">
                      <div className="w-full h-full bg-white rounded-full p-1">
                        <div className="w-full h-full rounded-full overflow-hidden">
                          <Image
                            src={member.image}
                            alt={member.name}
                            width={128}
                            height={128}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-500 rounded-full border-4 border-white flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-2xl font-sora font-bold text-text-primary mb-1">{member.name}</h3>
                  <p className="text-purple-600 font-inter font-semibold text-lg mb-1">{member.title}</p>
                  <p className="text-text-secondary font-inter text-sm mb-2">{member.experience} • {member.company}</p>
                  <div className="flex items-center justify-center space-x-4 text-sm text-text-secondary">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {member.rating}
                    </div>
                    <div>{member.students} students</div>
                  </div>
                </div>

                {/* Expertise */}
                <div className="mb-6">
                  <h4 className="font-sora font-bold text-text-primary mb-3">Expertise</h4>
                  <div className="flex flex-wrap gap-2">
                    {member.expertise.split(', ').map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-inter rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <p className="text-text-secondary font-inter leading-relaxed mb-6">
                  {member.description}
                </p>

                {/* Key Achievements */}
                <div className="mb-6">
                  <h4 className="font-sora font-bold text-text-primary mb-3">Key Achievements</h4>
                  <ul className="space-y-2">
                    {member.achievements.map((achievement, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm text-text-secondary">
                        <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>{achievement}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* LinkedIn */}
                <div className="text-center">
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-purple-600 hover:text-purple-700 transition-colors font-inter font-semibold"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    <span>Connect on LinkedIn</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Join Our Team CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-center">
          <h2 className="text-3xl font-sora font-bold text-white mb-4">
            Want to Join Our Team?
          </h2>
          <p className="text-blue-100 font-inter text-lg mb-6 max-w-2xl mx-auto">
            We&apos;re always looking for passionate educators and industry experts to help us transform more lives through education.
          </p>
          <button className="bg-white text-blue-600 hover:bg-blue-50 font-sora font-bold text-lg px-8 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg">
            View Open Positions
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TeamPage;
