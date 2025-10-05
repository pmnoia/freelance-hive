'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function MyProposalsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'freelancer') {
      router.push('/dashboard');
      return;
    }
    
    setUser(parsedUser);
    fetchProposals(parsedUser);
  }, [router]);

  const fetchProposals = async (currentUser) => {
    try {
      const response = await fetch(`/api/proposals?freelancerId=${currentUser._id}`);
      const data = await response.json();
      
      if (data.success) {
        setProposals(data.proposals);
      }
    } catch (error) {
      console.error('Error fetching proposals:', error);
    } finally {
      setLoading(false);
    }
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Proposals</h1>
              <p className="text-gray-600">Track your submitted proposals</p>
            </div>
            <Link 
              href="/dashboard"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {loading ? (
          <div className="text-center py-8 text-gray-600">Loading proposals...</div>
        ) : proposals.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-gray-600 mb-4">You haven&apos;t submitted any proposals yet</div>
            <p className="text-gray-500 mb-6">Start browsing projects and submit your first proposal!</p>
            <Link
              href="/projects"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium"
            >
              Browse Projects
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {proposals.map((proposal) => (
              <div key={proposal._id} className="bg-white rounded-lg shadow p-6">
                
                {/* Project Info Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {proposal.projectId.title}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Project Budget: ${proposal.projectId.budget}
                      </span>
                      <span>Your Rate: ${proposal.proposedBudget}</span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      proposal.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      proposal.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {proposal.status === 'pending' ? 'Pending' : proposal.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                {/* Proposal Details */}
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Your Cover Letter:</h4>
                  <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded">
                    {proposal.message}
                  </p>
                </div>
                
                <div className="mb-4">
                  <span className="font-medium text-gray-900">Duration: </span>
                  <span className="text-gray-700">{proposal.deliveryDays} days</span>
                </div>
                
                {/* Actions and Meta */}
                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="text-sm text-gray-500">
                    Submitted on {new Date(proposal.createdAt).toLocaleDateString()}
                  </div>
                  
                  <div className="space-x-3">
                    <Link
                      href={`/projects/${proposal.projectId._id}`}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      View Project
                    </Link>
                    
                    {proposal.status === 'accepted' && (
                      <span className="bg-green-100 text-green-800 px-3 py-2 rounded-md text-sm font-medium">
                        🎉 Congratulations! You got the job!
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}