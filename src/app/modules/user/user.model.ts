import { model, Schema } from "mongoose";
import { IUser, Role } from "./user.interface";

const userSchema = new Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String },
    role: {
        type: String,
        enum: Object.values(Role),
        default: Role.USER
    },
    phone: { type: String },
    isBlocked: { type: Boolean, default: false }
}, {
    timestamps: true,
    versionKey: false
})

export const User = model<IUser>("User", userSchema);
