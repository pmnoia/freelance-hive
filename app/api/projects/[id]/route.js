import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb.js';
import Project from '@/models/Project.js';

// GET /api/projects/[id]
// Purpose: Get a specific project by ID
export async function GET(request, { params }) {
  try {
    console.log('🔍 Fetching project details...');
    
    // Connect to database
    await connectDB();
    
    const { id } = params;
    
    // Find project with all related data
    const project = await Project.findById(id)
      .populate('clientId', 'name email profile.bio profile.skills')
      .populate('assignedFreelancer', 'name profile.bio profile.skills profile.hourlyRate');
    
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }
    
    console.log('✅ Project found:', project.title);
    
    return NextResponse.json({
      success: true,
      project
    });
    
  } catch (error) {
    console.error('❌ Error fetching project:', error.message);
    
    if (error.name === 'CastError') {
      return NextResponse.json(
        { error: 'Invalid project ID format' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[id]
// Purpose: Update a project (only by the client who owns it)
export async function PUT(request, { params }) {
  try {
    console.log('📝 Updating project...');
    
    // Connect to database
    await connectDB();
    
    const { id } = params;
    const body = await request.json();
    const { clientId, ...updateData } = body; // Extract clientId for authorization
    
    // Find the existing project
    const existingProject = await Project.findById(id);
    
    if (!existingProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }
    
    // Check if the user is authorized to update this project
    if (clientId && existingProject.clientId.toString() !== clientId) {
      return NextResponse.json(
        { error: 'You can only update your own projects' },
        { status: 403 }
      );
    }
    
    // Update the project
    const updatedProject = await Project.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true, // Return the updated document
        runValidators: true // Run model validation
      }
    ).populate('clientId', 'name email')
     .populate('assignedFreelancer', 'name profile.bio');
    
    console.log('✅ Project updated:', updatedProject.title);
    
    return NextResponse.json({
      success: true,
      message: 'Project updated successfully!',
      project: updatedProject
    });
    
  } catch (error) {
    console.error('❌ Error updating project:', error.message);
    
    if (error.name === 'ValidationError') {
      const errorMessages = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { error: 'Validation failed', details: errorMessages },
        { status: 400 }
      );
    }
    
    if (error.name === 'CastError') {
      return NextResponse.json(
        { error: 'Invalid project ID format' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id]
// Purpose: Delete a project (only by the client who owns it)
export async function DELETE(request, { params }) {
  try {
    console.log('🗑️ Deleting project...');
    
    // Connect to database
    await connectDB();
    
    const { id } = params;
    
    // Get clientId from query parameters for authorization
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    
    // Find the project first
    const project = await Project.findById(id);
    
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }
    
    // Check authorization
    if (clientId && project.clientId.toString() !== clientId) {
      return NextResponse.json(
        { error: 'You can only delete your own projects' },
        { status: 403 }
      );
    }
    
    // Delete the project
    await Project.findByIdAndDelete(id);
    
    console.log('✅ Project deleted:', project.title);
    
    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully!'
    });
    
  } catch (error) {
    console.error('❌ Error deleting project:', error.message);
    
    if (error.name === 'CastError') {
      return NextResponse.json(
        { error: 'Invalid project ID format' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}