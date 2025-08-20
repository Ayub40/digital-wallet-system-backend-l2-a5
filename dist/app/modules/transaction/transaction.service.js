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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionService = void 0;
const wallet_model_1 = require("../wallet/wallet.model");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const transaction_model_1 = require("./transaction.model");
const transaction_interface_1 = require("./transaction.interface");
const user_interface_1 = require("../user/user.interface");
const mongoose_1 = require("mongoose");
const addMoney = (userId, amount) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Add Money Called for userId:", userId);
    const wallet = yield wallet_model_1.Wallet.findOne({ user: userId });
    console.log("Found Wallet", wallet);
    if (!wallet)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Wallet not found");
    wallet.balance += amount;
    yield wallet.save();
    yield transaction_model_1.Transaction.create({
        sender: userId,
        amount,
        type: transaction_interface_1.TransactionType.ADD,
        status: "SUCCESS"
    });
    return wallet;
});
const withdrawMoney = (userId, amount) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Withdraw Money Called for userId:", userId);
    const wallet = yield wallet_model_1.Wallet.findOne({ user: userId });
    console.log("Found Wallet for Withdraw", wallet);
    if (!wallet || wallet.balance < amount) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Insufficient balance");
    }
    wallet.balance -= amount;
    yield wallet.save();
    yield transaction_model_1.Transaction.create({
        sender: userId,
        amount,
        type: transaction_interface_1.TransactionType.WITHDRAW,
        status: "SUCCESS"
    });
    return wallet;
});
const sendMoney = (senderId, receiverId, amount) => __awaiter(void 0, void 0, void 0, function* () {
    const senderWallet = yield wallet_model_1.Wallet.findOne({ user: senderId });
    const receiverWallet = yield wallet_model_1.Wallet.findOne({ user: receiverId });
    if (!senderWallet || !receiverWallet || senderWallet.balance < amount) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Transfer failed");
    }
    senderWallet.balance -= amount;
    receiverWallet.balance += amount;
    yield senderWallet.save();
    yield receiverWallet.save();
    yield transaction_model_1.Transaction.create({
        sender: senderId,
        receiver: receiverId,
        amount,
        type: transaction_interface_1.TransactionType.TRANSFER,
        status: "SUCCESS"
    });
    return { senderWallet, receiverWallet };
});
// const getHistory = async (userId: string) => {
//     console.log("Fetching history for:", userId);
//     return await Transaction.find({
//         $or: [{ sender: userId }, { receiver: userId }]
//     }).sort({ createdAt: -1 });
// }
const getHistory = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Fetching history for:", userId);
    const objectUserId = new mongoose_1.Types.ObjectId(userId);
    console.log("Finding history for:", objectUserId);
    const history = yield transaction_model_1.Transaction.find({
        $or: [
            { sender: objectUserId },
            { receiver: objectUserId }
        ]
    }).sort({ createdAt: -1 });
    console.log("Found transactions:", history);
    return history;
});
// For Agent
const agentCashIn = (agentId, userId, amount) => __awaiter(void 0, void 0, void 0, function* () {
    const userWallet = yield wallet_model_1.Wallet.findOne({ user: userId });
    if (!userWallet)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User wallet not found");
    userWallet.balance += amount;
    yield userWallet.save();
    yield transaction_model_1.Transaction.create({
        sender: agentId,
        receiver: userId,
        amount,
        type: transaction_interface_1.TransactionType.CASH_IN,
        status: "SUCCESS"
    });
    return userWallet;
});
const agentCashOut = (agentId, userId, amount) => __awaiter(void 0, void 0, void 0, function* () {
    const userWallet = yield wallet_model_1.Wallet.findOne({ user: userId });
    if (!userWallet || userWallet.balance < amount) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Insufficient balance or wallet not found");
    }
    userWallet.balance -= amount;
    yield userWallet.save();
    yield transaction_model_1.Transaction.create({
        sender: userId,
        receiver: agentId,
        amount,
        type: transaction_interface_1.TransactionType.CASH_OUT,
        status: "SUCCESS"
    });
    return userWallet;
});
const getAgentCommissionHistory = (agentId, role) => __awaiter(void 0, void 0, void 0, function* () {
    if (role !== user_interface_1.Role.AGENT) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Only agents can view commission history");
    }
    const history = yield transaction_model_1.Transaction.find({
        $and: [
            { type: { $in: [transaction_interface_1.TransactionType.CASH_IN, transaction_interface_1.TransactionType.CASH_OUT] } },
            { $or: [{ sender: agentId }, { receiver: agentId }] }
        ]
    }).sort({ createdAt: -1 });
    return history;
});
// For Admin
const getAllTransactions = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield transaction_model_1.Transaction.find({}).populate("sender receiver", "email");
});
exports.TransactionService = {
    addMoney,
    withdrawMoney,
    sendMoney,
    getHistory,
    agentCashIn,
    agentCashOut,
    getAgentCommissionHistory,
    getAllTransactions
};
