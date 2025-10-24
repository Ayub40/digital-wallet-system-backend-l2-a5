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
const user_model_1 = require("../user/user.model");
const QueryBuilder_1 = require("../../utils/QueryBuilder");
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
const withdrawMoney = (userId, amount, agent) => __awaiter(void 0, void 0, void 0, function* () {
    const agentUser = yield user_model_1.User.findOne({
        $or: [{ email: agent }, { phone: agent }]
    });
    if (!agentUser)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Agent not found");
    const userWallet = yield wallet_model_1.Wallet.findOne({ user: userId });
    const agentWallet = yield wallet_model_1.Wallet.findOne({ user: agentUser._id });
    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Invalid withdraw amount");
    }
    if (!userWallet || !agentWallet || userWallet.balance < numericAmount) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Insufficient balance or wallet not found");
    }
    userWallet.balance -= numericAmount;
    agentWallet.balance += numericAmount;
    yield userWallet.save();
    yield agentWallet.save();
    yield transaction_model_1.Transaction.create({
        sender: userId,
        receiver: agentUser._id,
        amount: numericAmount,
        type: transaction_interface_1.TransactionType.WITHDRAW,
        status: "SUCCESS"
    });
    return { userWallet, agentWallet };
});
const sendMoney = (senderId, receiver, amount) => __awaiter(void 0, void 0, void 0, function* () {
    const receiverUser = yield user_model_1.User.findOne({
        $or: [{ email: receiver }, { phone: receiver }]
    });
    if (!receiverUser) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Receiver not found");
    }
    const senderWallet = yield wallet_model_1.Wallet.findOne({ user: senderId });
    const receiverWallet = yield wallet_model_1.Wallet.findOne({ user: receiverUser._id });
    if (!senderWallet || !receiverWallet) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Wallet not found");
    }
    if (senderWallet.balance < amount) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Insufficient balance");
    }
    senderWallet.balance -= amount;
    receiverWallet.balance += amount;
    yield senderWallet.save();
    yield receiverWallet.save();
    yield transaction_model_1.Transaction.create({
        sender: senderId,
        receiver: receiverUser._id,
        amount,
        type: transaction_interface_1.TransactionType.TRANSFER,
        status: "SUCCESS"
    });
    return { senderWallet, receiverWallet };
});
// For Agent
const agentCashIn = (agentId, identifier, amount) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findOne({
        $or: [{ email: identifier }, { phone: identifier }]
    });
    if (!user)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found");
    const userWallet = yield wallet_model_1.Wallet.findOne({ user: user._id });
    if (!userWallet)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User wallet not found");
    const agentWallet = yield wallet_model_1.Wallet.findOne({ user: agentId });
    if (!agentWallet)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Agent wallet not found");
    if (agentWallet.balance < amount) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Insufficient balance in Agent wallet");
    }
    agentWallet.balance -= amount;
    userWallet.balance += amount;
    yield agentWallet.save();
    yield userWallet.save();
    yield transaction_model_1.Transaction.create({
        sender: agentId,
        receiver: user._id,
        amount,
        type: transaction_interface_1.TransactionType.CASH_IN,
        status: "SUCCESS"
    });
    return { userWallet, agentWallet };
});
const agentCashOut = (agentId, identifier, amount) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findOne({
        $or: [{ email: identifier }, { phone: identifier }]
    });
    if (!user)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found");
    const userWallet = yield wallet_model_1.Wallet.findOne({ user: user._id });
    if (!userWallet)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User wallet not found");
    const agentWallet = yield wallet_model_1.Wallet.findOne({ user: agentId });
    if (!agentWallet)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Agent wallet not found");
    if (userWallet.balance < amount) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Insufficient balance in User wallet");
    }
    // if (!userWallet || userWallet.balance < amount) {
    //     throw new AppError(httpStatus.BAD_REQUEST, "Insufficient balance or wallet not found");
    // }
    userWallet.balance -= amount;
    agentWallet.balance += amount;
    yield userWallet.save();
    yield agentWallet.save();
    yield transaction_model_1.Transaction.create({
        sender: user._id,
        receiver: agentId,
        amount,
        type: transaction_interface_1.TransactionType.CASH_OUT,
        status: "SUCCESS"
    });
    return { userWallet, agentWallet };
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
const getAllTransactions = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const queryBuilder = new QueryBuilder_1.QueryBuilder(transaction_model_1.Transaction.find(), query).paginate();
    const dataQuery = queryBuilder.build().populate("sender receiver", "name email");
    const [data, meta] = yield Promise.all([
        dataQuery,
        queryBuilder.getMeta()
    ]);
    return {
        data,
        meta
    };
});
const getHistory = (userId, query) => __awaiter(void 0, void 0, void 0, function* () {
    const objectUserId = new mongoose_1.Types.ObjectId(userId);
    const filter = {
        $or: [
            { sender: objectUserId },
            { receiver: objectUserId }
        ]
    };
    // Type filter
    if (query.type) {
        filter.type = query.type.toUpperCase();
    }
    // Date filter
    if (query.startDate || query.endDate) {
        filter.createdAt = {};
        if (query.startDate)
            filter.createdAt.$gte = new Date(query.startDate);
        if (query.endDate)
            filter.createdAt.$lte = new Date(query.endDate);
    }
    const baseQuery = transaction_model_1.Transaction.find(filter);
    const queryBuilder = new QueryBuilder_1.QueryBuilder(baseQuery, query)
        .sort()
        .fields()
        .paginate();
    const dataQuery = queryBuilder.build().populate("sender receiver", "name email");
    const [data, meta] = yield Promise.all([
        dataQuery,
        queryBuilder.getMeta()
    ]);
    return {
        data,
        meta
    };
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
