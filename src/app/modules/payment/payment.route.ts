import express, { NextFunction, Request, Response } from 'express';
import { PaymentController } from "./payment.controller";


const paymentController = new PaymentController();

const router = express.Router();
router.post('/payment', paymentController.paymentRequest);

// Callback route for Paytm response
router.post('/callback', paymentController.paymentRequestCallback);

export const PaymentRouter = router;