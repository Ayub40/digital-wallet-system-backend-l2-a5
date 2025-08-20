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
    const user = yield user_model_1.User.create(Object.assign({ _id: userId, email, password: hashedPassword, auths: [authProvider], wallet: wallet._id }, rest));
    const createdUserWithWallet = yield user_model_1.User.findById(user._id).populate('wallet', "balance");
    return createdUserWithWallet;
});
const updateUser = (userId, payload, decoded) => __awaiter(void 0, void 0, void 0, function* () {
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
const userStatus = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(userId);
    if (!user)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found");
    // user.isActive = user.isActive === "ACTIVE" ? "BLOCKED" : "ACTIVE";
    user.isActive = user.isActive === user_interface_1.IsActive.ACTIVE ? user_interface_1.IsActive.BLOCKED : user_interface_1.IsActive.ACTIVE;
    yield user.save();
    return user;
});
const getAllAgents = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield user_model_1.User.find({ role: user_interface_1.Role.AGENT });
});
const agentApproval = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(userId);
    if (!user)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found");
    if (user.role !== user_interface_1.Role.AGENT) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Only agents can be approved or suspended");
    }
    user.isApproved = !user.isApproved;
    yield user.save();
    return user;
});
exports.UserServices = {
    createUser,
    updateUser,
    getAllUsers,
    userStatus,
    getAllAgents,
    agentApproval
};
