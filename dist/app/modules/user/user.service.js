"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserServices = void 0;
/* eslint-disable @typescript-eslint/no-unused-vars */
const user_interface_1 = require("./user.interface");
const user_model_1 = require("./user.model");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const env_1 = require("../../config/env");
const mongoose_1 = require("mongoose");
const wallet_model_1 = require("../wallet/wallet.model");
const createUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = payload, rest = __rest(payload, ["email", "password"]);
    const isUserExist = yield user_model_1.User.findOne({ email });
    if (isUserExist) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "User Already Exist");
    }
    const hashedPassword = yield bcryptjs_1.default.hash(password, Number(env_1.envVars.BCRYPT_SALT_ROUND));
    const authProvider = { provider: "credentials", providerId: email };
    const userId = new mongoose_1.Types.ObjectId();
    const wallet = yield wallet_model_1.Wallet.create({
        user: userId,
        balance: 50
    });
    const user = yield user_model_1.User.create(Object.assign(Object.assign({ _id: userId, email, password: hashedPassword, auths: [authProvider], wallet: wallet._id }, rest), { role: rest.role || user_interface_1.Role.USER }));
    const createdUserWithWallet = yield user_model_1.User.findById(user._id).populate('wallet', "balance");
    return createdUserWithWallet;
});
const updateUser = (userId, payload, decoded) => __awaiter(void 0, void 0, void 0, function* () {
    // const updateUser = async (userId: string, payload: Partial<IUser & { oldPassword?: string; newPassword?: string }>, decoded: JwtPayload) => {
    // const user = await User.findById(userId).select("+password");
    const user = yield user_model_1.User.findById(userId);
    if (!user)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User Not Found");
    const isUser = [user_interface_1.Role.USER, user_interface_1.Role.AGENT].includes(decoded.role);
    if (isUser && decoded.userId !== userId) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "You can only update your own profile");
    }
    if (user.role === user_interface_1.Role.SUPER_ADMIN && decoded.role !== user_interface_1.Role.SUPER_ADMIN) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Only SUPER_ADMIN can modify SUPER_ADMIN");
    }
    if (payload.role) {
        if (isUser)
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Unauthorized role change");
        if (decoded.role === user_interface_1.Role.ADMIN && payload.role === user_interface_1.Role.SUPER_ADMIN) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Admin can't assign SUPER_ADMIN");
        }
    }
    if (payload.isActive || payload.isDeleted || payload.isVerified) {
        if (isUser)
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Unauthorized status update");
    }
    if (payload.password) {
        payload.password = yield bcryptjs_1.default.hash(payload.password, env_1.envVars.BCRYPT_SALT_ROUND);
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
    return yield user_model_1.User.findByIdAndUpdate(userId, payload, { new: true, runValidators: true });
});
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
const getAllUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield user_model_1.User.find({});
});
const getSingleUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    // const user = await User.findById(userId);
    // if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");
    // return user;
    const user = yield user_model_1.User.findById(userId).populate("wallet");
    if (!user)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found");
    return user;
});
const getMe = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(userId).select("-password").populate("wallet", "balance");
    return {
        data: user
    };
});
const userStatus = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(userId).populate("wallet");
    if (!user)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found");
    // user.isActive = user.isActive === "ACTIVE" ? "BLOCKED" : "ACTIVE";
    user.isActive = user.isActive === user_interface_1.IsActive.ACTIVE ? user_interface_1.IsActive.BLOCKED : user_interface_1.IsActive.ACTIVE;
    if (user.wallet) {
        yield wallet_model_1.Wallet.findByIdAndUpdate(user.wallet._id, {
            isBlocked: user.isActive === user_interface_1.IsActive.BLOCKED
        });
    }
    yield user.save();
    return user;
});
const updateRole = (userId, role) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(userId);
    if (!user)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found");
    user.role = role;
    if (role === user_interface_1.Role.AGENT) {
        user.isAgentStatus = user_interface_1.IsAgentStatus.APPROVED;
    }
    else {
        user.isAgentStatus = user_interface_1.IsAgentStatus.SUSPENDED;
    }
    yield user.save();
    return user;
});
const getAllAgents = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield user_model_1.User.find({ role: user_interface_1.Role.AGENT });
    // return await User.find({
    //     role: Role.AGENT,
    //     isAgentStatus: IsAgentStatus.APPROVED
    // });
});
const agentApproval = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(userId);
    if (!user)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found");
    if (user.isAgentStatus === user_interface_1.IsAgentStatus.APPROVED) {
        user.isAgentStatus = user_interface_1.IsAgentStatus.SUSPENDED;
        user.role = user_interface_1.Role.USER;
    }
    else {
        user.isAgentStatus = user_interface_1.IsAgentStatus.APPROVED;
        user.role = user_interface_1.Role.AGENT;
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
    yield user.save();
    return user;
    // return {
    //     success: true,
    //     message: user.isApproved ? "Agent approved" : "Agent suspended",
    //     data: user,
    // };
});
exports.UserServices = {
    createUser,
    updateUser,
    getAllUsers,
    userStatus,
    getAllAgents,
    agentApproval,
    getMe,
    updateRole,
    getSingleUser
};
// const getMe = async (userId: string) => {
//     const user = await User.findById(userId)
//         .select("-password")
//         .populate("wallet", "balance");
//     if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");
//     return user;
// };
