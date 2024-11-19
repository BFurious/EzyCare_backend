import sendResponse from "../../../shared/sendResponse";
import { PaymentService } from "./payment.service";
import { Request, Response } from "express";


export class PaymentController {
    private paymentService;
    constructor() {
        this.paymentService = new PaymentService();
     }
    
    async paymentRequest(req: Request, res: Response): Promise<void> {
        try {
            const { orderId, amount, customerId } = req.body;
            const result = await this.paymentService.paymentRequest(orderId, amount, customerId);
            sendResponse(res, {
                statusCode: 200,
                message: 'Successfully Updated Patient !!',
                success: true,
                data: result,
            });
        } catch (error: any) {
            sendResponse(res, {
                statusCode: 500,
                message: error.message,
                success: false
            });
        }
    }

    async paymentRequestCallback(req: Request, res: Response): Promise<void> {
        try {    
            const paytmParams = req.body;
            const checksumHash = paytmParams.CHECKSUMHASH;
            delete paytmParams.CHECKSUMHASH;
        
            const result = await this.paymentService.paymentRequestCallback(paytmParams, checksumHash );
            sendResponse(res, {
                statusCode: 200,
                message: 'Successfully Updated Patient !!',
                success: true,
                data: result,
            });
        } catch (error: any) {
            sendResponse(res, {
                statusCode: 500,
                message: error.message,
                success: false
            });
        }
    }


}