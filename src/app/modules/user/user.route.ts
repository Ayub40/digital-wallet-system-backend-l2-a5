import { Router } from "express";
import { UserControllers } from "./user.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { createUserZodSchema, updateUserZodSchema } from "./user.validation";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "./user.interface";

const router = Router()

router.post("/register", validateRequest(createUserZodSchema), UserControllers.createUser);
router.get("/all-users", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), UserControllers.getAllUsers);
router.get("/me", checkAuth(...Object.values(Role)), UserControllers.getMe);
router.get("/agents", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), UserControllers.getAllAgents);
router.get("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), UserControllers.getSingleUser);
// router.patch("/:id", validateRequest(updateUserZodSchema), checkAuth(...Object.values(Role)), UserControllers.updateUser)
router.patch("/update-profile", validateRequest(updateUserZodSchema), checkAuth(...Object.values(Role)), UserControllers.updateUser)
router.patch("/role/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), UserControllers.updateRole);
// router.patch("/:id", validateRequest(updateUserZodSchema), checkAuth((Role.USER, Role.AGENT, Role.ADMIN, Role.SUPER_ADMIN)), UserControllers.updateUser)
// router.get("/agents", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), UserControllers.getAllAgents);
router.patch("/status/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), UserControllers.userStatus);
router.patch("/agent/approve-suspend/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), UserControllers.agentApproval);


export const UserRoutes = router;