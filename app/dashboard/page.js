'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Get user from localStorage (in real app, you'd use proper authentication)
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      // Redirect to login if no user data
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900">Loading...</h2>
          <p className="text-gray-600">Please wait while we verify your session.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-2xl font-bold text-gray-900">FreelanceHive Dashboard</h1>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Welcome back, {user.name}! 👋
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Your Profile</h3>
              <p className="text-gray-600"><strong>Email:</strong> {user.email}</p>
              <p className="text-gray-600"><strong>Role:</strong> {user.role}</p>
              <p className="text-gray-600"><strong>Member since:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Details</h3>
              <p className="text-gray-600">
                <strong>Bio:</strong> {user.profile?.bio || 'No bio added yet'}
              </p>
              <p className="text-gray-600">
                <strong>Skills:</strong> {user.profile?.skills?.length > 0 ? user.profile.skills.join(', ') : 'No skills added yet'}
              </p>
              {user.role === 'freelancer' && (
                <p className="text-gray-600">
                  <strong>Hourly Rate:</strong> ${user.profile?.hourlyRate || 0}/hour
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {user.role === 'freelancer' && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Find Projects</h3>
                <p className="text-blue-700 mb-4">Browse available projects that match your skills.</p>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-200">
                  Browse Projects (Coming Soon)
                </button>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-900 mb-2">My Proposals</h3>
                <p className="text-green-700 mb-4">View and manage your submitted proposals.</p>
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-200">
                  View Proposals (Coming Soon)
                </button>
              </div>
            </>
          )}

          {user.role === 'client' && (
            <>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-purple-900 mb-2">Post Project</h3>
                <p className="text-purple-700 mb-4">Create a new project and find talented freelancers.</p>
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-200">
                  Post Project (Coming Soon)
                </button>
              </div>
              
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-orange-900 mb-2">My Projects</h3>
                <p className="text-orange-700 mb-4">Manage your posted projects and proposals.</p>
                <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-200">
                  View Projects (Coming Soon)
                </button>
              </div>
            </>
          )}

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile Settings</h3>
            <p className="text-gray-700 mb-4">Update your profile information and skills.</p>
            <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-200">
              Edit Profile (Coming Soon)
            </button>
          </div>
        </div>

        {/* Status Message */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <span className="text-yellow-600 text-2xl">🚧</span>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-yellow-800">
                Dashboard Under Development
              </h3>
              <p className="text-yellow-700 mt-1">
                Great job! Your authentication system is working perfectly. 
                The next step is to build the project management and proposal features.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}