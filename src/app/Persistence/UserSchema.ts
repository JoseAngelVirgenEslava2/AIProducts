import mongoose, { Schema, Document } from "mongoose";
import { hashSync } from "bcryptjs";

export interface IUserDoc extends Document {
  email: string;
  passwordHash: string;
  name: string;
}

const userSchema = new Schema<IUserDoc>(
  {
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
  },
  { timestamps: true }
);

// Hash password automatically when set through `password` virtual
userSchema
  .virtual("password")
  .set(function (this: IUserDoc, pwd: string) {
    this.passwordHash = hashSync(pwd, 12);
  });

export const UserModel =
  mongoose.models.User || mongoose.model<IUserDoc>("User", userSchema);