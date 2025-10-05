import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4 py-16">
        
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome to <span className="text-blue-600">FreelanceHive</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            The student freelancer marketplace where talent meets opportunity. 
            Connect with skilled students for your projects or find exciting work as a freelancer.
          </p>
          
          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/register" 
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-200"
            >
              Get Started - Join Now
            </Link>
            <Link 
              href="/login" 
              className="bg-white hover:bg-gray-50 text-blue-600 font-semibold py-3 px-8 rounded-lg border-2 border-blue-600 transition duration-200"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* For Freelancers */}
          <div className="bg-white rounded-xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">For Freelancers</h2>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Find projects that match your skills
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Work with local businesses and students
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Build your portfolio and experience
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Set your own rates and schedule
              </li>
            </ul>
            <div className="mt-6">
              <Link 
                href="/register" 
                className="inline-block bg-blue-100 hover:bg-blue-200 text-blue-600 font-medium py-2 px-4 rounded transition duration-200"
              >
                Join as Freelancer →
              </Link>
            </div>
          </div>

          {/* For Clients */}
          <div className="bg-white rounded-xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">For Clients</h2>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Access skilled student talent
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Affordable rates for quality work
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Post projects easily and quickly
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Support student entrepreneurs
              </li>
            </ul>
            <div className="mt-6">
              <Link 
                href="/register" 
                className="inline-block bg-blue-100 hover:bg-blue-200 text-blue-600 font-medium py-2 px-4 rounded transition duration-200"
              >
                Hire Freelancers →
              </Link>
            </div>
          </div>
        </div>

        {/* Popular Categories */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Popular Categories</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {['Web Development', 'Graphic Design', 'Content Writing', 'Digital Marketing'].map((category) => (
              <span 
                key={category}
                className="bg-white text-gray-700 px-6 py-3 rounded-full shadow-md font-medium"
              >
                {category}
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t border-gray-200">
          <p className="text-gray-500">
            Built with Next.js, MongoDB, and passion for connecting talent with opportunity.
          </p>
        </div>
      </div>
    </main>
  );
}
