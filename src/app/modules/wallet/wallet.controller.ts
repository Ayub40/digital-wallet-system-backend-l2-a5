import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { WalletServices } from "./wallet.service";

const getAllWallets = catchAsync(async (_req, res) => {
    const wallets = await WalletServices.getAllWallets();
    
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "All wallets fetched successfully",
        data: wallets
    });
});

const walletBlock = catchAsync(async (req, res) => {
    const walletId = req.params.id;
    const wallet = await WalletServices.walletBlock(walletId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Wallet block status updated",
        data: wallet
    });
});


export const WalletControllers = {
    getAllWallets,
    walletBlock
}