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
exports.TransactionController = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const transaction_service_1 = require("./transaction.service");
const user_interface_1 = require("../user/user.interface");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const addMoney = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // const wallet = await TransactionService.addMoney(req.user._id, req.body.amount);
    const decodeToken = req.user;
    const wallet = yield transaction_service_1.TransactionService.addMoney(decodeToken.userId, req.body.amount);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Money added successfully",
        data: wallet
    });
}));
const withdrawMoney = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const decodeToken = req.user;
    const { amount, agent } = req.body;
    // const wallet = await TransactionService.withdrawMoney(decodeToken.userId, req.body.amount);
    const wallet = yield transaction_service_1.TransactionService.withdrawMoney(decodeToken.userId, amount, agent);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Money withdrawn successfully",
        data: wallet
    });
}));
const sendMoney = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { receiver, amount } = req.body;
    const decodeToken = req.user;
    const result = yield transaction_service_1.TransactionService.sendMoney(decodeToken.userId, receiver, amount);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Money sent successfully",
        data: result
    });
}));
const getHistory = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const decodeToken = req.user;
    const history = yield transaction_service_1.TransactionService.getHistory(decodeToken.userId, req.query);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Transaction history fetched successfully",
        // data: history
        data: history.data,
        meta: history.meta,
    });
}));
// For AGENT
const agentCashIn = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const agent = req.user;
    const { identifier, amount } = req.body;
    if (agent.role !== user_interface_1.Role.AGENT) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Only agents can perform cash-in");
    }
    const wallet = yield transaction_service_1.TransactionService.agentCashIn(agent.userId, identifier, amount);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Cash-in successful",
        data: wallet
    });
}));
const agentCashOut = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const agent = req.user;
    const { identifier, amount } = req.body;
    if (agent.role !== user_interface_1.Role.AGENT) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Only agents can perform cash-out");
    }
    const wallet = yield transaction_service_1.TransactionService.agentCashOut(agent.userId, identifier, amount);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Cash-out successful",
        data: wallet
    });
}));
const agentCommissionHistory = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const agent = req.user;
    const history = yield transaction_service_1.TransactionService.getAgentCommissionHistory(agent.userId, agent.role);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Agent commission history fetched successfully",
        data: history
    });
}));
// For Admin
const getAllTransactions = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const transactions = yield transaction_service_1.TransactionService.getAllTransactions(query);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "All transactions fetched successfully",
        data: transactions.data,
        meta: transactions.meta,
    });
}));
exports.TransactionController = {
    addMoney,
    withdrawMoney,
    sendMoney,
    getHistory,
    agentCashIn,
    agentCashOut,
    agentCommissionHistory,
    getAllTransactions
};
