'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    
    // Fetch recent projects
    fetchRecentProjects(parsedUser);
  }, [router]);

  const fetchRecentProjects = async (currentUser) => {
    try {
    // If client, get their projects; if freelancer, get open projects
    const params = currentUser.role === 'client' 
      ? `?clientId=${currentUser._id}` 
      : '?status=open&limit=5';      const response = await fetch(`./api/projects${params}`);
      const data = await response.json();
      
      if (data.success) {
        setRecentProjects(data.projects);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user.name}!</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium transition duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Browse Projects - For Freelancers */}
          {user.role === 'freelancer' && (
            <Link
              href="/projects"
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 p-6 border-l-4 border-blue-500"
            >
              <div className="flex items-center">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">Browse Projects</h3>
                  <p className="text-gray-600">Find new freelance opportunities</p>
                </div>
                <div className="text-3xl">🔍</div>
              </div>
            </Link>
          )}

          {/* Create Project - For Clients */}
          {user.role === 'client' && (
            <Link
              href="/projects/create"
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 p-6 border-l-4 border-green-500"
            >
              <div className="flex items-center">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">Create Project</h3>
                  <p className="text-gray-600">Post a new project for freelancers</p>
                </div>
                <div className="text-3xl">➕</div>
              </div>
            </Link>
          )}

          {/* My Projects */}
          <Link
            href={user.role === 'client' ? `/projects?clientId=${user._id}` : '/projects'}
            className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 p-6 border-l-4 border-purple-500"
          >
            <div className="flex items-center">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {user.role === 'client' ? 'My Projects' : 'All Projects'}
                </h3>
                <p className="text-gray-600">
                  {user.role === 'client' 
                    ? 'Manage your posted projects' 
                    : 'View available projects'}
                </p>
              </div>
              <div className="text-3xl">📁</div>
            </div>
          </Link>

          {/* My Proposals - For Freelancers */}
          {user.role === 'freelancer' && (
            <Link
              href="/proposals"
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 p-6 border-l-4 border-orange-500"
            >
              <div className="flex items-center">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">My Proposals</h3>
                  <p className="text-gray-600">Track your submitted proposals</p>
                </div>
                <div className="text-3xl">📄</div>
              </div>
            </Link>
          )}

          {/* Profile Settings (Placeholder) */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-gray-400 opacity-60">
            <div className="flex items-center">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">Profile Settings</h3>
                <p className="text-gray-600">Update your profile (Coming Soon)</p>
              </div>
              <div className="text-3xl">⚙️</div>
            </div>
          </div>
        </div>

        {/* Profile Summary */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <span className="font-medium text-gray-700">Name:</span>
                <span className="ml-2 text-gray-900">{user.name}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Email:</span>
                <span className="ml-2 text-gray-900">{user.email}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Role:</span>
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                  user.role === 'client' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {user.role === 'client' ? 'Client' : 'Freelancer'}
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <span className="font-medium text-gray-700">Bio:</span>
                <p className="text-gray-900 mt-1">{user.profile.bio || 'No bio added yet'}</p>
              </div>
              {user.profile.skills && user.profile.skills.length > 0 && (
                <div>
                  <span className="font-medium text-gray-700">Skills:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {user.profile.skills.map((skill, index) => (
                      <span 
                        key={index}
                        className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Projects */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {user.role === 'client' ? 'Your Recent Projects' : 'Recent Projects'}
            </h2>
            <Link
              href="/projects"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              View All →
            </Link>
          </div>
          
          {loading ? (
            <div className="text-center py-8 text-gray-600">Loading projects...</div>
          ) : recentProjects.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-600 mb-4">
                {user.role === 'client' 
                  ? "You haven't created any projects yet" 
                  : 'No recent projects available'}
              </div>
              {user.role === 'client' && (
                <Link
                  href="/projects/create"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
                >
                  Create Your First Project
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {recentProjects.map((project) => (
                <div key={project._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">{project.title}</h3>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">{project.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          {project.category}
                        </span>
                        <span className="font-medium">${project.budget}</span>
                        <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <Link
                        href={`/projects/${project._id}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}