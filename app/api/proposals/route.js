import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb.js';
import Proposal from '@/models/Proposal.js';

// GET /api/proposals
// Purpose: List proposals with filtering
export async function GET(request) {
  try {
    console.log('📋 Fetching proposals...');
    
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const freelancerId = searchParams.get('freelancerId');
    const clientId = searchParams.get('clientId');
    
    // Build query
    const query = {};
    if (projectId) query.projectId = projectId;
    if (freelancerId) query.freelancerId = freelancerId;
    
    let proposals = await Proposal.find(query)
      .populate('projectId', 'title budget clientId')
      .populate('freelancerId', 'name email profile.bio')
      .sort({ createdAt: -1 });
    
    // If filtering by clientId, filter after population
    if (clientId) {
      proposals = proposals.filter(proposal => 
        proposal.projectId.clientId.toString() === clientId
      );
    }
    
    console.log(`✅ Found ${proposals.length} proposals`);
    
    return NextResponse.json({
      success: true,
      proposals,
      total: proposals.length
    });
    
  } catch (error) {
    console.error('❌ Error fetching proposals:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch proposals' },
      { status: 500 }
    );
  }
}

// POST /api/proposals
// Purpose: Submit a new proposal
export async function POST(request) {
  try {
    console.log('🚀 Creating new proposal...');
    
    await connectDB();
    
    const body = await request.json();
    const { projectId, freelancerId, coverLetter, proposedRate, estimatedDuration } = body;
    
    // Validation
    if (!projectId || !freelancerId || !coverLetter || !proposedRate || !estimatedDuration) {
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          required: ['projectId', 'freelancerId', 'coverLetter', 'proposedRate', 'estimatedDuration']
        },
        { status: 400 }
      );
    }
    
    // Check if proposal already exists
    const existingProposal = await Proposal.findOne({ projectId, freelancerId });
    if (existingProposal) {
      return NextResponse.json(
        { error: 'You have already submitted a proposal for this project' },
        { status: 409 }
      );
    }
    
    // Convert frontend fields to model fields
    const deliveryDays = parseInt(estimatedDuration) || 7; // Default to 7 days if not a number
    
    // Create proposal
    const newProposal = new Proposal({
      projectId,
      freelancerId,
      message: coverLetter, // Model expects 'message'
      proposedBudget: Number(proposedRate), // Model expects 'proposedBudget'
      deliveryDays: deliveryDays // Model expects 'deliveryDays'
    });
    
    const savedProposal = await newProposal.save();
    
    // Get populated proposal
    const populatedProposal = await Proposal.findById(savedProposal._id)
      .populate('projectId', 'title budget')
      .populate('freelancerId', 'name email');
    
    console.log('✅ Proposal created:', savedProposal._id);
    
    return NextResponse.json({
      success: true,
      message: 'Proposal submitted successfully!',
      proposal: populatedProposal
    }, { status: 201 });
    
  } catch (error) {
    console.error('❌ Error creating proposal:', error.message);
    
    if (error.name === 'ValidationError') {
      const errorMessages = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { error: 'Validation failed', details: errorMessages },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create proposal' },
      { status: 500 }
    );
  }
}