import { NextFunction, Request, RequestHandler, Response } from "express";
import sendResponse from "./sendResponse";

const catchAsync = (fn: RequestHandler) => async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        await fn(req, res, next)
    } catch (error: any) {
        next(error)
    }
}
export default catchAsync;