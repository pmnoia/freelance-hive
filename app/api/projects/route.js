import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb.js';
import Project from '@/models/Project.js';

// GET /api/projects
// Purpose: List all projects with filtering options
export async function GET(request) {
  try {
    console.log('📋 Fetching projects...');
    
    // Connect to database
    await connectDB();
    
    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const clientId = searchParams.get('clientId');
    
    // Build query object
    const query = {};
    
    if (status) query.status = status;
    if (category) query.category = category;
    if (clientId) query.clientId = clientId;
    
    // Fetch projects with client info
    const projects = await Project.find(query)
      .populate('clientId', 'name profile.bio')
      .populate('assignedFreelancer', 'name profile.bio profile.skills')
      .sort({ createdAt: -1 }) // Newest first
      .limit(50); // Limit for performance
    
    console.log(`✅ Found ${projects.length} projects`);
    
    return NextResponse.json({
      success: true,
      projects,
      total: projects.length,
      filters: { status, category, clientId }
    });
    
  } catch (error) {
    console.error('❌ Error fetching projects:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// POST /api/projects
// Purpose: Create a new project
export async function POST(request) {
  try {
    console.log('🆕 Creating new project...');
    
    // Connect to database
    await connectDB();
    
    // Get project data from request
    const body = await request.json();
    const { title, description, category, skillsRequired, budget, deadline, clientId } = body;
    
    console.log('📝 Project data:', { title, category, budget, clientId });
    
    // Basic validation
    if (!title || !description || !category || !budget || !deadline || !clientId) {
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          required: ['title', 'description', 'category', 'budget', 'deadline', 'clientId']
        },
        { status: 400 }
      );
    }
    
    // Create new project
    const newProject = new Project({
      title,
      description,
      category,
      skillsRequired: skillsRequired || [],
      budget: Number(budget),
      deadline: new Date(deadline),
      clientId
    });
    
    // Save to database
    const savedProject = await newProject.save();
    
    // Get the project with populated client info
    const populatedProject = await Project.findById(savedProject._id)
      .populate('clientId', 'name email profile.bio');
    
    console.log('✅ Project created:', savedProject._id);
    
    return NextResponse.json({
      success: true,
      message: 'Project created successfully!',
      project: populatedProject
    }, { status: 201 });
    
  } catch (error) {
    console.error('❌ Error creating project:', error.message);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errorMessages = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { error: 'Validation failed', details: errorMessages },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}