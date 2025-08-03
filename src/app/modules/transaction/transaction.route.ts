import { Router } from "express";
// import { UserControllers } from "./user.controller";
import { TransactionController } from "./transaction.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
// import { validateRequest } from "../../middlewares/validateRequest";


const router = Router()

// router.post("/register", validateRequest(createUserZodSchema), UserControllers.createUser);
router.post("/addMoney", checkAuth(...Object.values(Role)), TransactionController.addMoney);
router.post("/withDrawMoney", checkAuth(...Object.values(Role)), TransactionController.withdrawMoney);
router.post("/send-money", checkAuth(...Object.values(Role)), TransactionController.sendMoney);
router.get("/get-history", checkAuth(...Object.values(Role)), TransactionController.getHistory);
router.post("/cash-in", checkAuth(Role.AGENT), TransactionController.agentCashIn);
router.post("/cash-out", checkAuth(Role.AGENT), TransactionController.agentCashOut);
router.get("/commission-history", checkAuth(Role.AGENT), TransactionController.agentCommissionHistory);
router.get("/transactions-history", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), TransactionController.getAllTransactions);


export const TransactionRoutes = router;