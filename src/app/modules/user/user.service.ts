/* eslint-disable @typescript-eslint/no-unused-vars */
import { IAuthProvider, IsActive, IsAgentStatus, IUser, Role } from "./user.interface";
import { User } from "./user.model";
import AppError from "../../errorHelpers/AppError";
import httpStatus from 'http-status-codes';
import bcryptjs from "bcryptjs";
import { envVars } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";
import { Types } from "mongoose";
import { Wallet } from "../wallet/wallet.model";



const createUser = async (payload: Partial<IUser>) => {
    const { email, password, ...rest } = payload;

    const isUserExist = await User.findOne({ email })

    if (isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, "User Already Exist")
    }

    const hashedPassword = await bcryptjs.hash(password as string, Number(envVars.BCRYPT_SALT_ROUND))
    const authProvider: IAuthProvider = { provider: "credentials", providerId: email as string }

    const userId = new Types.ObjectId();

    const wallet = await Wallet.create({
        user: userId,
        balance: 50
    });

    const user = await User.create({
        _id: userId,
        email,
        password: hashedPassword,
        auths: [authProvider],
        wallet: wallet._id,
        ...rest,
        role: rest.role || Role.USER,
    });

    const createdUserWithWallet = await User.findById(user._id).populate('wallet', "balance");

    return createdUserWithWallet
}

const updateUser = async (userId: string, payload: Partial<IUser>, decoded: JwtPayload) => {
    // const updateUser = async (userId: string, payload: Partial<IUser & { oldPassword?: string; newPassword?: string }>, decoded: JwtPayload) => {

    // const user = await User.findById(userId).select("+password");

    const user = await User.findById(userId);
    if (!user) throw new AppError(httpStatus.NOT_FOUND, "User Not Found");

    const isUser = [Role.USER, Role.AGENT].includes(decoded.role);

    if (isUser && decoded.userId !== userId) {
        throw new AppError(httpStatus.FORBIDDEN, "You can only update your own profile");
    }

    if (user.role === Role.SUPER_ADMIN && decoded.role !== Role.SUPER_ADMIN) {
        throw new AppError(httpStatus.FORBIDDEN, "Only SUPER_ADMIN can modify SUPER_ADMIN");
    }

    if (payload.role) {
        if (isUser) throw new AppError(httpStatus.FORBIDDEN, "Unauthorized role change");

        if (decoded.role === Role.ADMIN && payload.role === Role.SUPER_ADMIN) {
            throw new AppError(httpStatus.FORBIDDEN, "Admin can't assign SUPER_ADMIN");
        }
    }

    if (payload.isActive || payload.isDeleted || payload.isVerified) {
        if (isUser) throw new AppError(httpStatus.FORBIDDEN, "Unauthorized status update");
    }

    if (payload.password) {
        payload.password = await bcryptjs.hash(payload.password, envVars.BCRYPT_SALT_ROUND);
    }

    // ========= New code ================
    // if (payload.oldPassword && payload.newPassword) {
    //     const isPasswordMatch = await bcryptjs.compare(payload.oldPassword, user.password);
    //     if (!isPasswordMatch) {
    //         throw new AppError(httpStatus.BAD_REQUEST, "Old password is incorrect");
    //     }

    //     user.password = await bcryptjs.hash(payload.newPassword, Number(envVars.BCRYPT_SALT_ROUND));
    // }
    // ========= New code ================

    // Update name and phone
    // if (payload.name) user.name = payload.name;
    // if (payload.phone) user.phone = payload.phone;
    // await user.save();
    // const { password: _, ...rest } = user.toObject();
    // return rest;

    return await User.findByIdAndUpdate(userId, payload, { new: true, runValidators: true });
};


// const updateUser = async (userId: string, payload: Partial<IUser>, decodedToken: JwtPayload) => {
//     const ifUserExist = await User.findById(userId);

//     if (!ifUserExist) {
//         throw new AppError(httpStatus.NOT_FOUND, "User Not Found")
//     }

//     if (payload.role) {
//         if (decodedToken.role === Role.USER || decodedToken.role === Role.AGENT) {
//             throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
//         }

//         if (payload.role === Role.SUPER_ADMIN && decodedToken.role === Role.ADMIN) {
//             throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
//         }
//     }

//     if (payload.isActive || payload.isDeleted || payload.isVerified) {
//         if (decodedToken.role === Role.USER || decodedToken.role === Role.AGENT) {
//             throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
//         }
//     }

//     if (payload.password) {
//         payload.password = await bcryptjs.hash(payload.password, envVars.BCRYPT_SALT_ROUND)
//     }

//     const newUpdatedUser = await User.findByIdAndUpdate(userId, payload, { new: true, runValidators: true })

//     return newUpdatedUser;

// }

const getAllUsers = async () => {
    return await User.find({});
};

const getSingleUser = async (userId: string) => {
    // const user = await User.findById(userId);
    // if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");
    // return user;

    const user = await User.findById(userId).populate("wallet");
    if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");
    return user;
};

const getMe = async (userId: string) => {
    const user = await User.findById(userId).select("-password").populate("wallet", "balance");
    return {
        data: user
    }
};

const userStatus = async (userId: string) => {
    const user = await User.findById(userId).populate("wallet")
    if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");

    // user.isActive = user.isActive === "ACTIVE" ? "BLOCKED" : "ACTIVE";
    user.isActive = user.isActive === IsActive.ACTIVE ? IsActive.BLOCKED : IsActive.ACTIVE;

    if (user.wallet) {
        await Wallet.findByIdAndUpdate(user.wallet._id, {
            isBlocked: user.isActive === IsActive.BLOCKED
        });
    }

    await user.save();
    return user;
};

const updateRole = async (userId: string, role: Role) => {
    const user = await User.findById(userId);
    if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");

    user.role = role;

    if (role === Role.AGENT) {
        user.isAgentStatus = IsAgentStatus.APPROVED;
    } else {
        user.isAgentStatus = IsAgentStatus.SUSPENDED;
    }

    await user.save();
    return user;
};

const getAllAgents = async () => {
    return await User.find({ role: Role.AGENT });

    // return await User.find({
    //     role: Role.AGENT,
    //     isAgentStatus: IsAgentStatus.APPROVED
    // });
};

const agentApproval = async (userId: string) => {
    const user = await User.findById(userId);
    if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");

    if (user.isAgentStatus === IsAgentStatus.APPROVED) {
        user.isAgentStatus = IsAgentStatus.SUSPENDED;
        user.role = Role.USER;
    } else {
        user.isAgentStatus = IsAgentStatus.APPROVED;
        user.role = Role.AGENT;
    }

    // if (user.role !== Role.AGENT) {
    // if (user.role !== Role.AGENT && user.isApproved === false) {
    //     throw new AppError(httpStatus.BAD_REQUEST, "Only agents can be approved or suspended");
    // }

    // user.isApproved = !user.isApproved;

    // if (!user.isApproved) {
    //     user.role = Role.USER;
    // } else {
    //     user.role = Role.AGENT;
    // }

    await user.save();

    return user;
    // return {
    //     success: true,
    //     message: user.isApproved ? "Agent approved" : "Agent suspended",
    //     data: user,
    // };
};



export const UserServices = {
    createUser,
    updateUser,
    getAllUsers,
    userStatus,
    getAllAgents,
    agentApproval,
    getMe,
    updateRole,
    getSingleUser
}

// const getMe = async (userId: string) => {
//     const user = await User.findById(userId)
//         .select("-password")
//         .populate("wallet", "balance");

//     if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");

//     return user;
// };