import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { WalletControllers } from "./wallet.controller";

const router = Router()

router.get("/wallets", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), WalletControllers.getAllWallets);
router.patch("/wallets/block/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), WalletControllers.walletBlock);


export const WalletRoutes = router;