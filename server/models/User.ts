import mongoose, { Document, Schema } from 'mongoose';

export enum UserRole {
    ADMIN = 'Admin',
    STAFF = 'Staff',
}

export interface IUser extends Document {
    firebaseUid: string;
    email: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema(
    {
        firebaseUid: {
            type: String,
            required: true,
            unique: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        role: {
            type: String,
            enum: Object.values(UserRole),
            default: UserRole.STAFF,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IUser>('User', UserSchema);
