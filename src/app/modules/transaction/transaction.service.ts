import { Wallet } from "../wallet/wallet.model";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";
import { Transaction } from "./transaction.model";
import { TransactionType } from "./transaction.interface";
import { Role } from "../user/user.interface";
import { Types } from "mongoose";
import { User } from "../user/user.model";
import { QueryBuilder } from "../../utils/QueryBuilder";

const addMoney = async (userId: string, amount: number) => {
    console.log("Add Money Called for userId:", userId);

    const wallet = await Wallet.findOne({ user: userId });
    console.log("Found Wallet", wallet);

    if (!wallet) throw new AppError(httpStatus.NOT_FOUND, "Wallet not found");

    wallet.balance += amount;
    await wallet.save();

    await Transaction.create({
        sender: userId,
        amount,
        type: TransactionType.ADD,
        status: "SUCCESS"
    });

    return wallet;
}

const withdrawMoney = async (userId: string, amount: number, agent: string) => {
    const agentUser = await User.findOne({
        $or: [{ email: agent }, { phone: agent }]
    });

    if (!agentUser) throw new AppError(httpStatus.NOT_FOUND, "Agent not found");

    const userWallet = await Wallet.findOne({ user: userId });
    const agentWallet = await Wallet.findOne({ user: agentUser._id });

    const numericAmount = Number(amount);

    if (isNaN(numericAmount) || numericAmount <= 0) {
        throw new AppError(httpStatus.BAD_REQUEST, "Invalid withdraw amount");
    }

    if (!userWallet || !agentWallet || userWallet.balance < numericAmount) {
        throw new AppError(httpStatus.BAD_REQUEST, "Insufficient balance or wallet not found");
    }

    userWallet.balance -= numericAmount;
    agentWallet.balance += numericAmount;

    await userWallet.save();
    await agentWallet.save();

    await Transaction.create({
        sender: userId,
        receiver: agentUser._id,
        amount: numericAmount,
        type: TransactionType.WITHDRAW,
        status: "SUCCESS"
    });

    return { userWallet, agentWallet };
};

const sendMoney = async (senderId: string, receiver: string, amount: number) => {

    const receiverUser = await User.findOne({
        $or: [{ email: receiver }, { phone: receiver }]
    });

    if (!receiverUser) {
        throw new AppError(httpStatus.NOT_FOUND, "Receiver not found");
    }

    const senderWallet = await Wallet.findOne({ user: senderId });
    const receiverWallet = await Wallet.findOne({ user: receiverUser._id });

    if (!senderWallet || !receiverWallet) {
        throw new AppError(httpStatus.BAD_REQUEST, "Wallet not found");
    }

    if (senderWallet.balance < amount) {
        throw new AppError(httpStatus.BAD_REQUEST, "Insufficient balance");
    }

    senderWallet.balance -= amount;
    receiverWallet.balance += amount;

    await senderWallet.save();
    await receiverWallet.save();

    await Transaction.create({
        sender: senderId,
        receiver: receiverUser._id,
        amount,
        type: TransactionType.TRANSFER,
        status: "SUCCESS"
    });

    return { senderWallet, receiverWallet };
};


// For Agent
const agentCashIn = async (agentId: string, identifier: string, amount: number) => {

    const user = await User.findOne({
        $or: [{ email: identifier }, { phone: identifier }]
    });

    if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");

    const userWallet = await Wallet.findOne({ user: user._id });
    if (!userWallet) throw new AppError(httpStatus.NOT_FOUND, "User wallet not found");

    const agentWallet = await Wallet.findOne({ user: agentId });
    if (!agentWallet) throw new AppError(httpStatus.NOT_FOUND, "Agent wallet not found");

    if (agentWallet.balance < amount) {
        throw new AppError(httpStatus.BAD_REQUEST, "Insufficient balance in Agent wallet");
    }

    agentWallet.balance -= amount;
    userWallet.balance += amount;

    await agentWallet.save();
    await userWallet.save();

    await Transaction.create({
        sender: agentId,
        receiver: user._id,
        amount,
        type: TransactionType.CASH_IN,
        status: "SUCCESS"
    });

    return { userWallet, agentWallet };
};

const agentCashOut = async (agentId: string, identifier: string, amount: number) => {

    const user = await User.findOne({
        $or: [{ email: identifier }, { phone: identifier }]
    });

    if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");

    const userWallet = await Wallet.findOne({ user: user._id });

    if (!userWallet) throw new AppError(httpStatus.NOT_FOUND, "User wallet not found");

    const agentWallet = await Wallet.findOne({ user: agentId });
    if (!agentWallet) throw new AppError(httpStatus.NOT_FOUND, "Agent wallet not found");

    if (userWallet.balance < amount) {
        throw new AppError(httpStatus.BAD_REQUEST, "Insufficient balance in User wallet");
    }

    // if (!userWallet || userWallet.balance < amount) {
    //     throw new AppError(httpStatus.BAD_REQUEST, "Insufficient balance or wallet not found");
    // }

    userWallet.balance -= amount;
    agentWallet.balance += amount;

    await userWallet.save();
    await agentWallet.save();

    await Transaction.create({
        sender: user._id,
        receiver: agentId,
        amount,
        type: TransactionType.CASH_OUT,
        status: "SUCCESS"
    });

    return { userWallet, agentWallet };
};

const getAgentCommissionHistory = async (agentId: string, role: Role) => {
    if (role !== Role.AGENT) {
        throw new AppError(httpStatus.FORBIDDEN, "Only agents can view commission history");
    }

    const history = await Transaction.find({
        $and: [
            { type: { $in: [TransactionType.CASH_IN, TransactionType.CASH_OUT] } },
            { $or: [{ sender: agentId }, { receiver: agentId }] }
        ]
    }).sort({ createdAt: -1 });

    return history;
};

const getAllTransactions = async (query: Record<string, string>) => {

    const queryBuilder = new QueryBuilder(Transaction.find(), query).paginate();

    const dataQuery = queryBuilder.build().populate("sender receiver", "name email");

    const [data, meta] = await Promise.all([
        dataQuery,
        queryBuilder.getMeta()
    ]);

    return {
        data,
        meta
    }

};

const getHistory = async (userId: string, query: Record<string, string>) => {
    const objectUserId = new Types.ObjectId(userId);

    const filter: any = {
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
        if (query.startDate) filter.createdAt.$gte = new Date(query.startDate);
        if (query.endDate) filter.createdAt.$lte = new Date(query.endDate);
    }

    const baseQuery = Transaction.find(filter);

    const queryBuilder = new QueryBuilder(baseQuery, query)
        .sort()
        .fields()
        .paginate();

    const dataQuery = queryBuilder.build().populate("sender receiver", "name email");

    const [data, meta] = await Promise.all([
        dataQuery,
        queryBuilder.getMeta()
    ]);

    return {
        data,
        meta
    };
};


export const TransactionService = {
    addMoney,
    withdrawMoney,
    sendMoney,
    getHistory,
    agentCashIn,
    agentCashOut,
    getAgentCommissionHistory,
    getAllTransactions
}


