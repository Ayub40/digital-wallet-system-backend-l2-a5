/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import httpStatus from 'http-status-codes';
import { catchAsync } from "../../utils/catchAsync";
import { UserServices } from "./user.service";
import { sendResponse } from "../../utils/sendResponse";
import { JwtPayload } from "jsonwebtoken";
import { Role } from "./user.interface";
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
    const userId = req.params.id;
    const verifiedToken = req.user;

    const payload = req.body;
    const user = await UserServices.updateUser(userId, payload, verifiedToken as JwtPayload)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "User Updated Successfully",
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

const userStatus = catchAsync(async (req, res) => {
    const userId = req.params.id;
    const user = await UserServices.userStatus(userId);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User status toggled",
        data: user
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
        message: updatedAgent.isApproved ? "Agent Approved" : "Agent Suspended",
        data: updatedAgent,
    });
});


export const UserControllers = {
    createUser,
    updateUser,
    getAllUsers,
    userStatus,
    getAllAgents,
    agentApproval
}