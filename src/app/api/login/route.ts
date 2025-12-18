import { NextRequest, NextResponse } from 'next/server';

// Mock user data
const mockUser = {
  data: {
    username: 'erlanggadewasakti',
    password: 'erlanggadewasakti@82200109',
    access_token: 'mockBearerToken1234567890'
  }
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (username === mockUser.data.username && password === mockUser.data.password) {
      return NextResponse.json({
        message: 'Login successful!',
        ...mockUser
      });
    }

    return NextResponse.json({ message: 'Invalid username or password.' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ message: 'An error occurred while processing the request.' }, { status: 500 });
  }
}
