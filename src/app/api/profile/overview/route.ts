import { NextResponse, NextRequest } from 'next/server';

// Mock user profile data
const mockUserProfile = {
  data: {
    nama: 'Erlangga Dewa Sakti',
    username: 'erlanggadewasakti',
    nim: '1122334455',
    role: 'mahasiswa',
    photo: 'https://cdn.devdojo.com/users/November2021/erlanggadewa7.jpg'
  }
};

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');

  if (authHeader === `Bearer mockBearerToken1234567890`) {
    return NextResponse.json(mockUserProfile);
  }

  return NextResponse.json({ message: 'Unauthorized access. Please log in.' }, { status: 401 });
}
