import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

// POST /api/login
// Purpose: Authenticate user login
export async function POST(request) {
  try {
    console.log('🔐 User login attempt...');
    
    // Step 1: Connect to MongoDB
    await connectDB();
    
    // Step 2: Get login credentials
    const body = await request.json();
    const { email, password } = body;
    
    console.log('📧 Login attempt for email:', email);
    
    // Step 3: Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { 
          error: 'Email and password are required',
          required: ['email', 'password']
        },
        { status: 400 }
      );
    }
    
    // Step 4: Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found for email:', email);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 } // 401 = Unauthorized
      );
    }
    
    // Step 5: Check password using User model method
    const isPasswordCorrect = await user.checkPassword(password);
    if (!isPasswordCorrect) {
      console.log('❌ Invalid password for user:', email);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    console.log('✅ Login successful for user:', user._id);
    
    // Step 6: Return user info (without password)
    const userResponse = user.getPublicProfile();
    
    return NextResponse.json({
      message: `Welcome back, ${user.name}!`,
      user: userResponse
    }, { status: 200 });
    
  } catch (error) {
    console.error('❌ Login error:', error.message);
    
    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}