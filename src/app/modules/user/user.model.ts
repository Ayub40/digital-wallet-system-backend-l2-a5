import { model, Schema } from "mongoose";
import { IAuthProvider, IsActive, IUser, Role } from "./user.interface";
import { Wallet } from "../wallet/wallet.model";

const authProviderSchema = new Schema<IAuthProvider>({
    provider: { type: String, required: true },
    providerId: { type: String, required: true }
}, {
    versionKey: false,
    _id: false
})

const userSchema = new Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    phone: { type: String },
    role: {
        type: String,
        enum: Object.values(Role),
        default: Role.USER
    },
    wallet: {
        type: Schema.Types.ObjectId,
        ref: "Wallet",
        // required: true
    },
    isDeleted: { type: Boolean, default: false },
    isActive: {
        type: String,
        enum: Object.values(IsActive),
        default: IsActive.ACTIVE
    },
    // isVerified: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: true },
    isApproved: { type: Boolean, default: false },
    auths: [authProviderSchema],
    // isBlocked: { type: Boolean, default: false }
}, {
    timestamps: true,
    versionKey: false
})

// userSchema.post('save', async function (user) {
//     const existingWallet = await Wallet.findOne({ user: user._id });
//     if (!existingWallet) {
//         await Wallet.create({
//             user: user._id,
//             userInfo: {
//                 name: user.name,
//                 phone: user.phone,
//             },
//             balance: 50,
//         });
//     }
// });

export const User = model<IUser>("User", userSchema);
