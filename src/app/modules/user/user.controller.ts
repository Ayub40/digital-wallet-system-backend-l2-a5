/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import httpStatus from 'http-status-codes';
import { catchAsync } from "../../utils/catchAsync";
import { UserServices } from "./user.service";
import { sendResponse } from "../../utils/sendResponse";
import { JwtPayload } from "jsonwebtoken";
import { IsActive, IsAgentStatus, Role } from "./user.interface";
import AppError from "../../errorHelpers/AppError";


const createUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = await UserServices.createUser(req.body)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "User Created Successfully",
        data: user
    })
})

const updateUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const userId = (req.user as JwtPayload)?.userId;
    const payload = req.body;
    const user = await UserServices.updateUser(userId, payload, req.user as JwtPayload)

    // const userId = req.params.id;
    // const verifiedToken = req.user;
    // const payload = req.body;
    // const user = await UserServices.updateUser(userId, payload, verifiedToken as JwtPayload)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "User Updated Successfully",
        // data: user,
        data: user,
    })
})

const getAllUsers = catchAsync(async (_req, res) => {
    const users = await UserServices.getAllUsers();
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "All users fetched successfully",
        data: users
    });
});

const getSingleUser = catchAsync(async (req, res) => {
    const userId = req.params.id;
    const user = await UserServices.getSingleUser(userId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User fetched successfully",
        data: user,
    });
});

const getMe = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload
    const result = await UserServices.getMe(decodedToken.userId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Your profile Retrieved Successfully",
        data: result.data
    })
})

const userStatus = catchAsync(async (req, res) => {
    const userId = req.params.id;
    const user = await UserServices.userStatus(userId);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        // message: "User status toggled",
        message: user.isActive === IsActive.ACTIVE ? "User Activated" : "User Blocked",
        data: user
    });
});

const updateRole = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    const user = await UserServices.updateRole(id, role);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User role updated successfully",
        data: user,
    });
});

const getAllAgents = catchAsync(async (_req, res) => {
    const agents = await UserServices.getAllAgents();
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "All agents fetched successfully",
        data: agents
    });
});


const agentApproval = catchAsync(async (req: Request, res: Response) => {
    const userId = req.params.id;
    const updatedAgent = await UserServices.agentApproval(userId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: updatedAgent.isAgentStatus === IsAgentStatus.APPROVED ? "Agent Approved" : "Agent Suspended",
        data: updatedAgent,
    });
});


export const UserControllers = {
    createUser,
    updateUser,
    getAllUsers,
    userStatus,
    getAllAgents,
    agentApproval,
    getMe,
    updateRole,
    getSingleUser
}




// const getMe = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
//     const userId = req.user?.userId;
//     if (!userId) throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");

//     const user = await UserServices.getMe(userId);

//     sendResponse(res, {
//         success: true,
//         statusCode: httpStatus.OK,
//         message: "User info fetched successfully",
//         data: user
//     });
// });