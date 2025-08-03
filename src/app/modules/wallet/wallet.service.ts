import AppError from "../../errorHelpers/AppError";
import { Wallet } from "./wallet.model";
import httpStatus from "http-status-codes";

const getAllWallets = async () => {
    return await Wallet.find({}).populate("user", "name email role");
};

const walletBlock = async (walletId: string) => {
    const wallet = await Wallet.findById(walletId);
    if (!wallet) throw new AppError(httpStatus.NOT_FOUND, "Wallet not found");

    wallet.isBlocked = !wallet.isBlocked;
    await wallet.save();
    return wallet;
};


export const WalletServices = {
    getAllWallets,
    walletBlock
}