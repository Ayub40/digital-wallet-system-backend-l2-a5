"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = void 0;
const mongoose_1 = require("mongoose");
const transaction_interface_1 = require("./transaction.interface");
const transactionSchema = new mongoose_1.Schema({
    sender: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User"
    },
    receiver: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User"
    },
    amount: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: Object.values(transaction_interface_1.TransactionType),
        required: true
    },
    status: {
        type: String,
        enum: ["SUCCESS", "FAILED"],
        default: "SUCCESS"
    }
}, { timestamps: true });
exports.Transaction = (0, mongoose_1.model)("Transaction", transactionSchema);
