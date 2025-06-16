import { NextResponse } from 'next/server';
import { connectDB } from '@/utils/db';
import { UserModel } from '@/app/Persistence/UserSchema';

export async function POST(req: Request) {
  await connectDB();
  const { email, password, name } = await req.json();

  const exists = await UserModel.findOne({ email });
  if (exists) {
    return NextResponse.json({ error: 'El correo ya está registrado' }, { status: 409 });
  }

  const nuevo = new UserModel({ email, name });
  (nuevo as any).password = password;
  await nuevo.save();

  const jwt = await import('jsonwebtoken');
  const token = jwt.sign({ sub: nuevo._id, email: nuevo.email }, process.env.JWT_SECRET!, {
    expiresIn: '1h',
  });

  return NextResponse.json({ token });
}