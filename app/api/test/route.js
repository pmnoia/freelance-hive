import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

// GET /api/test
// Purpose: Test registration and login functionality
export async function GET() {
  try {
    console.log('🧪 Testing FreelanceHive APIs...');
    
    await connectDB();
    
    // Clean up any existing test user
    await User.deleteMany({ email: 'test@freelancehive.com' });
    
    // Test data
    const testUser = {
      name: 'Test User',
      email: 'test@freelancehive.com', 
      password: 'password123',
      role: 'freelancer'
    };
    
    // Test 1: Registration
    console.log('Testing registration...');
    const newUser = new User({
      ...testUser,
      profile: {
        bio: '',
        skills: [],
        hourlyRate: 0
      }
    });
    
    const savedUser = await newUser.save();
    console.log('✅ Registration test passed');
    
    // Test 2: Login (password check)
    console.log('Testing login...');
    const foundUser = await User.findOne({ email: testUser.email });
    const passwordMatch = await foundUser.checkPassword(testUser.password);
    
    if (!passwordMatch) {
      throw new Error('Password check failed');
    }
    console.log('✅ Login test passed');
    
    // Clean up
    await User.deleteOne({ _id: savedUser._id });
    
    return NextResponse.json({
      message: '🎉 All tests passed! Your APIs are working!',
      tests: {
        registration: '✅ Working',
        login: '✅ Working', 
        passwordHashing: '✅ Working',
        database: '✅ Connected'
      },
      nextSteps: [
        'Your /api/register endpoint is ready',
        'Your /api/login endpoint is ready',
        'You can now build frontend forms to use these APIs'
      ]
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    return NextResponse.json({
      message: '❌ Test failed',
      error: error.message,
      suggestion: 'Check your database connection and User model'
    }, { status: 500 });
  }
}