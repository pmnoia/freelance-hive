'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProjectDetailsPage({ params }) {
  const router = useRouter();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [projectId, setProjectId] = useState(null);
  const [proposalData, setProposalData] = useState({
    coverLetter: '',
    proposedRate: '',
    estimatedDuration: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Get current user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Await params and get project ID
    const getProjectId = async () => {
      const resolvedParams = await params;
      setProjectId(resolvedParams.id);
    };
    
    getProjectId();
  }, [params]);

  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      const data = await response.json();
      
      if (data.success) {
        setProject(data.project);
      } else {
        console.error('Project not found');
      }
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading project details...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h2>
          <p className="text-gray-600 mb-4">The project you&apos;re looking for doesn&apos;t exist.</p>
          <Link 
            href="/projects"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
          >
            Browse Projects
          </Link>
        </div>
      </div>
    );
  }

  const isClient = user && user._id === project.clientId._id;
  const canSubmitProposal = user && user.role === 'freelancer' && project.status === 'open' && !isClient;

  const handleProposalSubmit = async (e) => {
    e.preventDefault();
    
    if (!proposalData.coverLetter.trim() || !proposalData.proposedRate || !proposalData.estimatedDuration) {
      alert('Please fill in all required fields');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const response = await fetch('/api/proposals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: projectId,
          freelancerId: user._id,
          ...proposalData,
          proposedRate: parseFloat(proposalData.proposedRate)
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Proposal submitted successfully!');
        setShowProposalForm(false);
        setProposalData({ coverLetter: '', proposedRate: '', estimatedDuration: '' });
      } else {
        alert(data.error || 'Failed to submit proposal');
      }
    } catch (error) {
      console.error('Error submitting proposal:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link 
              href="/projects"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back to Projects
            </Link>
            {isClient && (
              <Link
                href={`/projects/${project._id}/edit`}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md font-medium"
              >
                Edit Project
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Project Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{project.title}</h1>
              <div className="flex items-center space-x-4 mb-4">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                  {project.category}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  project.status === 'open' ? 'bg-green-100 text-green-800' :
                  project.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {project.status.toUpperCase()}
                </span>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-4xl font-bold text-green-600">${project.budget}</div>
              <div className="text-gray-600">Fixed Budget</div>
            </div>
          </div>

          {/* Project Meta Info */}
          <div className="grid md:grid-cols-3 gap-4 py-4 border-t border-gray-200">
            <div>
              <div className="text-sm font-medium text-gray-700">Posted By</div>
              <div className="text-lg">{project.clientId.name}</div>
              <div className="text-sm text-gray-600">{project.clientId.email}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700">Posted Date</div>
              <div className="text-lg">{formatDate(project.createdAt)}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700">Deadline</div>
              <div className="text-lg">{formatDate(project.deadline)}</div>
              <div className={`text-sm ${
                getDaysUntilDeadline(project.deadline) < 7 ? 'text-red-600' : 'text-gray-600'
              }`}>
                {getDaysUntilDeadline(project.deadline)} days remaining
              </div>
            </div>
          </div>
        </div>

        {/* Project Description */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Project Description</h2>
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">{project.description}</p>
          </div>
        </div>

        {/* Skills Required */}
        {project.skillsRequired && project.skillsRequired.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Skills Required</h2>
            <div className="flex flex-wrap gap-3">
              {project.skillsRequired.map((skill, index) => (
                <span 
                  key={index}
                  className="bg-blue-50 text-blue-700 px-3 py-2 rounded-lg font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Assignment Info */}
        {project.assignedFreelancer && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Assigned Freelancer</h2>
            <div className="flex items-center space-x-4">
              <div>
                <div className="font-medium text-lg">{project.assignedFreelancer.name}</div>
                <div className="text-gray-600">{project.assignedFreelancer.email}</div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {canSubmitProposal && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-4">Interested in this project?</h2>
              <p className="text-gray-600 mb-6">Submit a proposal to let the client know why you&apos;re the perfect fit for this job.</p>
              <button
                onClick={() => setShowProposalForm(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-md font-medium text-lg transition duration-200"
              >
                Submit Proposal
              </button>
            </div>
          </div>
        )}

        {/* Proposal Form Modal */}
        {showProposalForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-semibold mb-4">Submit Proposal</h3>
              
              <form onSubmit={handleProposalSubmit} className="space-y-4">
                
                {/* Cover Letter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cover Letter *
                  </label>
                  <textarea
                    value={proposalData.coverLetter}
                    onChange={(e) => setProposalData({...proposalData, coverLetter: e.target.value})}
                    placeholder="Explain why you're the perfect fit for this project..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={1000}
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">{proposalData.coverLetter.length}/1000</p>
                </div>
                
                {/* Proposed Rate */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Rate ($) *
                  </label>
                  <input
                    type="number"
                    value={proposalData.proposedRate}
                    onChange={(e) => setProposalData({...proposalData, proposedRate: e.target.value})}
                    placeholder="500"
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">Project budget: ${project.budget}</p>
                </div>
                
                {/* Estimated Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Duration (Days) *
                  </label>
                  <input
                    type="number"
                    value={proposalData.estimatedDuration}
                    onChange={(e) => setProposalData({...proposalData, estimatedDuration: e.target.value})}
                    placeholder="7"
                    min="1"
                    max="365"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">How many days to complete this project?</p>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`flex-1 py-2 px-4 rounded-md font-medium text-white ${
                      submitting 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {submitting ? 'Submitting...' : 'Submit Proposal'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowProposalForm(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-md font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Not Logged In */}
        {!user && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-4">Want to apply for this project?</h2>
              <p className="text-gray-600 mb-6">Create an account or login to submit proposals and connect with clients.</p>
              <div className="space-x-4">
                <Link
                  href="/login"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md font-medium"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Client View */}
        {isClient && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-blue-900">This is your project</h2>
            <p className="text-blue-800 mb-4">
              You can manage proposals, edit project details, and communicate with freelancers here.
            </p>
            <div className="space-x-3">
              <Link
                href={`/projects/${project._id}/proposals`}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
              >
                View Proposals
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}