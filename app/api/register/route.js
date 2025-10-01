import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

// POST /api/register
// Purpose: Register a new user (freelancer or client)
export async function POST(request) {
  try {
    console.log('🚀 New user registration started...');
    
    // Step 1: Connect to MongoDB
    await connectDB();
    
    // Step 2: Get the registration data from request body
    const body = await request.json();
    const { name, email, password, role } = body;
    
    console.log('📝 Registration attempt for:', email, 'as', role);
    
    // Step 3: Basic validation
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { 
          error: 'All fields are required',
          required: ['name', 'email', 'password', 'role']
        },
        { status: 400 }
      );
    }
    
    // Step 4: Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 } // 409 = Conflict
      );
    }
    
    // Step 5: Create new user
    // Password will be automatically hashed by the User model middleware
    const newUser = new User({
      name,
      email,
      password, // Gets hashed automatically
      role,
      profile: {
        bio: '',
        skills: [],
        hourlyRate: role === 'freelancer' ? 0 : undefined
      }
    });
    
    // Step 6: Save to database
    const savedUser = await newUser.save();
    
    console.log('✅ User registered successfully:', savedUser._id);
    
    // Step 7: Return success response (without password)
    const userResponse = savedUser.getPublicProfile();
    
    return NextResponse.json({
      message: 'Registration successful! Welcome to FreelanceHive!',
      user: userResponse
    }, { status: 201 }); // 201 = Created
    
  } catch (error) {
    console.error('❌ Registration error:', error.message);
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const errorMessages = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: errorMessages
        },
        { status: 400 }
      );
    }
    
    // Handle duplicate key errors (shouldn't happen due to our check, but just in case)
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      );
    }
    
    // Handle other errors
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}