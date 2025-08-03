import { Schema, model } from "mongoose";
import { ITransaction, TransactionType } from "./transaction.interface";

const transactionSchema = new Schema<ITransaction>({
    sender:
    {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    receiver:
    {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    amount:
    {
        type: Number,
        required: true
    },
    type:
    {
        type: String,
        enum: Object.values(TransactionType),
        required: true
    },
    status:
    {
        type: String,
        enum: ["SUCCESS", "FAILED"],
        default: "SUCCESS"
    }
},
    { timestamps: true }
);

export const Transaction = model<ITransaction>("Transaction", transactionSchema);
