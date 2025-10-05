import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb.js';
import Proposal from '@/models/Proposal.js';
import Project from '@/models/Project.js';

// PUT /api/proposals/[id]
// Purpose: Update proposal status (accept/reject)
export async function PUT(request, { params }) {
  try {
    console.log('📝 Updating proposal status...');
    
    await connectDB();
    
    const { id } = params;
    const body = await request.json();
    const { status, clientId } = body;
    
    if (!status || !clientId) {
      return NextResponse.json(
        { error: 'Status and clientId are required' },
        { status: 400 }
      );
    }
    
    if (!['accepted', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Status must be accepted or rejected' },
        { status: 400 }
      );
    }
    
    // Get proposal with project info
    const proposal = await Proposal.findById(id).populate('projectId');
    
    if (!proposal) {
      return NextResponse.json(
        { error: 'Proposal not found' },
        { status: 404 }
      );
    }
    
    // Check if client owns the project
    if (proposal.projectId.clientId.toString() !== clientId) {
      return NextResponse.json(
        { error: 'You can only update proposals for your own projects' },
        { status: 403 }
      );
    }
    
    // Update proposal status
    proposal.status = status;
    await proposal.save();
    
    // If accepted, update project status and assign freelancer
    if (status === 'accepted') {
      await Project.findByIdAndUpdate(proposal.projectId._id, {
        status: 'in-progress',
        assignedFreelancer: proposal.freelancerId
      });
      
      // Reject all other proposals for this project
      await Proposal.updateMany(
        { 
          projectId: proposal.projectId._id,
          _id: { $ne: proposal._id }
        },
        { status: 'rejected' }
      );
    }
    
    const updatedProposal = await Proposal.findById(id)
      .populate('projectId', 'title budget')
      .populate('freelancerId', 'name email');
    
    console.log('✅ Proposal status updated:', status);
    
    return NextResponse.json({
      success: true,
      message: `Proposal ${status} successfully!`,
      proposal: updatedProposal
    });
    
  } catch (error) {
    console.error('❌ Error updating proposal:', error.message);
    return NextResponse.json(
      { error: 'Failed to update proposal' },
      { status: 500 }
    );
  }
}