'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'open',
    category: ''
  });

  // Fetch projects from API
  useEffect(() => {
    fetchProjects();
  }, [filters]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.category) params.append('category', filters.category);
      
      const response = await fetch(`./api/projects?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setProjects(data.projects);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'Web Development',
    'Graphic Design', 
    'Content Writing',
    'Digital Marketing',
    'Other'
  ];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysUntilDeadline = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Browse Projects</h1>
              <p className="text-gray-600">Find your next freelance opportunity</p>
            </div>
            <Link 
              href="/dashboard"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition duration-200"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Filter Projects</h3>
          <div className="grid md:grid-cols-2 gap-4">
            
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({...filters, category: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Projects List */}
        {loading ? (
          <div className="text-center py-8">
            <div className="text-lg text-gray-600">Loading projects...</div>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-lg text-gray-600 mb-4">No projects found</div>
            <p className="text-gray-500">Try adjusting your filters or check back later for new projects.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {projects.map((project) => (
              <div key={project._id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 p-6">
                
                {/* Project Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{project.title}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {project.category}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        project.status === 'open' ? 'bg-green-100 text-green-800' :
                        project.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {project.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">${project.budget}</div>
                    <div className="text-sm text-gray-600">Budget</div>
                  </div>
                </div>

                {/* Project Description */}
                <p className="text-gray-700 mb-4 line-clamp-3">{project.description}</p>

                {/* Skills Required */}
                {project.skillsRequired && project.skillsRequired.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">Skills Required:</div>
                    <div className="flex flex-wrap gap-2">
                      {project.skillsRequired.map((skill, index) => (
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

                {/* Project Info */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Client:</span> {project.clientId?.name}
                    </div>
                    <div>
                      <span className="font-medium">Posted:</span> {formatDate(project.createdAt)}
                    </div>
                    <div>
                      <span className="font-medium">Deadline:</span> {formatDate(project.deadline)}
                      <span className={`ml-2 ${
                        getDaysUntilDeadline(project.deadline) < 7 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        ({getDaysUntilDeadline(project.deadline)} days left)
                      </span>
                    </div>
                  </div>
                  
                  <Link
                    href={`/projects/${project._id}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-200"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}