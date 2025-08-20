import { Types } from "mongoose";

export enum TransactionType {
  ADD = "ADD",
  WITHDRAW = "WITHDRAW",
  TRANSFER = "TRANSFER",
  CASH_IN = "CASH_IN",
  CASH_OUT = "CASH_OUT"
}

export interface ITransaction {
  sender?: Types.ObjectId;
  receiver?: Types.ObjectId;
  amount: number;
  type: TransactionType;
  status: "SUCCESS" | "FAILED";
}
