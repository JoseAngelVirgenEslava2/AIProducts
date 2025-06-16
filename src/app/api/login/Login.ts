import { NextResponse } from 'next/server';
import { connectDB } from '@/utils/db';
import { UserModel } from '@/app/Persistence/UserSchema';
import { compareSync } from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
  await connectDB();
  const { email, password } = await req.json();

  const user = await UserModel.findOne({ email });
  if (!user || !compareSync(password, user.passwordHash)) {
    return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
  }

  const token = jwt.sign({ sub: user._id, email: user.email }, process.env.JWT_SECRET!, {
    expiresIn: '1h',
  });

  return NextResponse.json({ token });
}