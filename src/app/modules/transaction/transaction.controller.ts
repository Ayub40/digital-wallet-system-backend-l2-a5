/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { TransactionService } from "./transaction.service";
import { JwtPayload } from "jsonwebtoken";
import { Role } from "../user/user.interface";
import AppError from "../../errorHelpers/AppError";

const addMoney = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // const wallet = await TransactionService.addMoney(req.user._id, req.body.amount);
    const decodeToken = req.user as JwtPayload
    const wallet = await TransactionService.addMoney(decodeToken.userId, req.body.amount)
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Money added successfully",
        data: wallet
    });
})

const withdrawMoney = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const decodeToken = req.user as JwtPayload
    const { amount, agent } = req.body;

    // const wallet = await TransactionService.withdrawMoney(decodeToken.userId, req.body.amount);
    const wallet = await TransactionService.withdrawMoney(decodeToken.userId, amount, agent);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Money withdrawn successfully",
        data: wallet
    });
})

const sendMoney = catchAsync(async (req: Request, res: Response) => {
    const { receiver, amount } = req.body;
    const decodeToken = req.user as JwtPayload;

    const result = await TransactionService.sendMoney(decodeToken.userId, receiver, amount);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Money sent successfully",
        data: result
    });
});

const getHistory = catchAsync(async (req: Request, res: Response) => {
    const decodeToken = req.user as JwtPayload;
    const history = await TransactionService.getHistory(decodeToken.userId, req.query as Record<string, string>);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Transaction history fetched successfully",
        // data: history
        data: history.data,
        meta: history.meta,
    });
})

// For AGENT
const agentCashIn = catchAsync(async (req: Request, res: Response) => {
    const agent = req.user as JwtPayload;
    const { identifier, amount } = req.body;

    if (agent.role !== Role.AGENT) {
        throw new AppError(httpStatus.FORBIDDEN, "Only agents can perform cash-in");
    }

    const wallet = await TransactionService.agentCashIn(agent.userId, identifier, amount);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Cash-in successful",
        data: wallet
    });
});

const agentCashOut = catchAsync(async (req: Request, res: Response) => {
    const agent = req.user as JwtPayload;
    const { identifier, amount } = req.body;

    if (agent.role !== Role.AGENT) {
        throw new AppError(httpStatus.FORBIDDEN, "Only agents can perform cash-out");
    }

    const wallet = await TransactionService.agentCashOut(agent.userId, identifier, amount);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Cash-out successful",
        data: wallet
    });
});

const agentCommissionHistory = catchAsync(async (req: Request, res: Response) => {
    const agent = req.user as JwtPayload;

    const history = await TransactionService.getAgentCommissionHistory(agent.userId, agent.role);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Agent commission history fetched successfully",
        data: history
    });
});

// For Admin
const getAllTransactions = catchAsync(async (req: Request, res: Response) => {
    const query = req.query
    const transactions = await TransactionService.getAllTransactions((query as Record<string, string>));

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "All transactions fetched successfully",
        data: transactions.data,
        meta: transactions.meta,
    });
});



export const TransactionController = {
    addMoney,
    withdrawMoney,
    sendMoney,
    getHistory,
    agentCashIn,
    agentCashOut,
    agentCommissionHistory,
    getAllTransactions
}
