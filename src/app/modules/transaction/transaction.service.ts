import { Wallet } from "../wallet/wallet.model";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";
import { Transaction } from "./transaction.model";
import { TransactionType } from "./transaction.interface";
import { Role } from "../user/user.interface";
import { Types } from "mongoose";

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

const withdrawMoney = async (userId: string, amount: number) => {
    console.log("Withdraw Money Called for userId:", userId);

    const wallet = await Wallet.findOne({ user: userId });
    console.log("Found Wallet for Withdraw", wallet);

    if (!wallet || wallet.balance < amount) {
        throw new AppError(httpStatus.BAD_REQUEST, "Insufficient balance");
    }

    wallet.balance -= amount;
    await wallet.save();

    await Transaction.create({
        sender: userId,
        amount,
        type: TransactionType.WITHDRAW,
        status: "SUCCESS"
    });

    return wallet;
}

const sendMoney = async (senderId: string, receiverId: string, amount: number) => {
    const senderWallet = await Wallet.findOne({ user: senderId });
    const receiverWallet = await Wallet.findOne({ user: receiverId });

    if (!senderWallet || !receiverWallet || senderWallet.balance < amount) {
        throw new AppError(httpStatus.BAD_REQUEST, "Transfer failed");
    }

    senderWallet.balance -= amount;
    receiverWallet.balance += amount;

    await senderWallet.save();
    await receiverWallet.save();

    await Transaction.create({
        sender: senderId,
        receiver: receiverId,
        amount,
        type: TransactionType.TRANSFER,
        status: "SUCCESS"
    });

    return { senderWallet, receiverWallet };
}

// const getHistory = async (userId: string) => {
//     console.log("Fetching history for:", userId);

//     return await Transaction.find({
//         $or: [{ sender: userId }, { receiver: userId }]
//     }).sort({ createdAt: -1 });
// }

const getHistory = async (userId: string) => {
    console.log("Fetching history for:", userId);

    const objectUserId = new Types.ObjectId(userId);

    console.log("Finding history for:", objectUserId);

    const history = await Transaction.find({
        $or: [
            { sender: objectUserId },
            { receiver: objectUserId }
        ]
    }).sort({ createdAt: -1 });

    console.log("Found transactions:", history);

    return history;
};

// For Agent
const agentCashIn = async (agentId: string, userId: string, amount: number) => {
    const userWallet = await Wallet.findOne({ user: userId });
    if (!userWallet) throw new AppError(httpStatus.NOT_FOUND, "User wallet not found");

    userWallet.balance += amount;
    await userWallet.save();

    await Transaction.create({
        sender: agentId,
        receiver: userId,
        amount,
        type: TransactionType.CASH_IN,
        status: "SUCCESS"
    });

    return userWallet;
};

const agentCashOut = async (agentId: string, userId: string, amount: number) => {
    const userWallet = await Wallet.findOne({ user: userId });
    if (!userWallet || userWallet.balance < amount) {
        throw new AppError(httpStatus.BAD_REQUEST, "Insufficient balance or wallet not found");
    }

    userWallet.balance -= amount;
    await userWallet.save();

    await Transaction.create({
        sender: userId,
        receiver: agentId,
        amount,
        type: TransactionType.CASH_OUT,
        status: "SUCCESS"
    });

    return userWallet;
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


// For Admin
const getAllTransactions = async () => {
    return await Transaction.find({}).populate("sender receiver", "email");
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