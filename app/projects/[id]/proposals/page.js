'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProposalsPage({ params }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [project, setProject] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projectId, setProjectId] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    
    // Await params and get project ID
    const getProjectId = async () => {
      const resolvedParams = await params;
      setProjectId(resolvedParams.id);
    };
    
    getProjectId();
  }, [params, router]);

  useEffect(() => {
    if (projectId && user) {
      fetchProjectAndProposals(user);
    }
  }, [projectId, user]);

  const fetchProjectAndProposals = async (currentUser) => {
    try {
      // Fetch project details
      const projectResponse = await fetch(`../../api/projects/${projectId}`);
      const projectData = await projectResponse.json();
      
      if (!projectData.success) {
        router.push('/projects');
        return;
      }
      
      const projectInfo = projectData.project;
      
      // Check if user owns this project
      if (projectInfo.clientId._id !== currentUser._id) {
        router.push('/projects');
        return;
      }
      
      setProject(projectInfo);
      
      // Fetch proposals for this project
      const proposalsResponse = await fetch(`../../api/proposals?projectId=${projectId}`);
      const proposalsData = await proposalsResponse.json();
      
      if (proposalsData.success) {
        setProposals(proposalsData.proposals);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProposalAction = async (proposalId, status) => {
    if (!confirm(`Are you sure you want to ${status} this proposal?`)) {
      return;
    }
    
    try {
      const response = await fetch(`../../api/proposals/${proposalId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          clientId: user._id
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(`Proposal ${status} successfully!`);
        // Refresh proposals
        fetchProjectAndProposals(user);
      } else {
        alert(data.error || `Failed to ${status} proposal`);
      }
    } catch (error) {
      console.error(`Error ${status}ing proposal:`, error);
      alert('An error occurred. Please try again.');
    }
  };

  if (loading || !user || !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading proposals...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Proposals</h1>
              <p className="text-gray-600">Manage proposals for your project</p>
            </div>
            <Link 
              href={`/projects/${project._id}`}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back to Project
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Project Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-2">{project.title}</h2>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {project.category}
            </span>
            <span className="font-medium">Budget: ${project.budget}</span>
            <span>Status: {project.status}</span>
          </div>
        </div>

        {/* Proposals List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold">
              Proposals ({proposals.length})
            </h3>
          </div>
          
          {proposals.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-600 mb-4">No proposals yet</div>
              <p className="text-gray-500">Freelancers haven&apos;t submitted any proposals for this project yet.</p>
            </div>
          ) : (
            <div className="divide-y">
              {proposals.map((proposal) => (
                <div key={proposal._id} className="p-6">
                  
                  {/* Freelancer Info */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-semibold text-lg">{proposal.freelancerId.name}</h4>
                      <p className="text-gray-600">{proposal.freelancerId.email}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">${proposal.proposedBudget}</div>
                      <div className="text-sm text-gray-600">Proposed Rate</div>
                    </div>
                  </div>
                  
                  {/* Proposal Details */}
                  <div className="mb-4">
                    <h5 className="font-medium text-gray-900 mb-2">Cover Letter:</h5>
                    <p className="text-gray-700 whitespace-pre-wrap">{proposal.message}</p>
                  </div>
                  
                  <div className="mb-4">
                    <h5 className="font-medium text-gray-900 mb-1">Estimated Duration:</h5>
                    <p className="text-gray-700">{proposal.deliveryDays} days</p>
                  </div>
                  
                  {/* Status and Actions */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        proposal.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        proposal.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {proposal.status === 'pending' ? 'Pending Review' : proposal.status.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-500">
                        Submitted {new Date(proposal.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {proposal.status === 'pending' && (
                      <div className="space-x-3">
                        <button
                          onClick={() => handleProposalAction(proposal._id, 'accepted')}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleProposalAction(proposal._id, 'rejected')}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                        >
                          Reject
                        </button>
                      </div>
                    )}
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