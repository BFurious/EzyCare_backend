import config from '../../../config';
import PaytmChecksum from "paytmchecksum";

export class PaymentService {

    async paymentRequest(orderId: string, amount: number, customerId: string) {


        const paytmParams: any = {
            MID: config.paytmMerchantId,
            WEBSITE: config.paytmWebsite,
            CHANNEL_ID: 'WEB',
            INDUSTRY_TYPE_ID: 'Retail',
            ORDER_ID: orderId,
            CUST_ID: customerId,
            TXN_AMOUNT: amount.toString(),
            CALLBACK_URL: 'http://localhost:3000/callback', // Replace with your callback URL
        };

        try {
            const checksum = await PaytmChecksum.generateSignature(paytmParams, config.paytmMerchantKey);
            paytmParams.CHECKSUMHASH = checksum;
            return ({ paytmParams });
        } catch (error) {
            console.error('Error generating checksum:', error);
            return new Error('Failed to initiate payment');
        }
    }
    async paymentRequestCallback(paytmParams: any, checksumHash:string) {


        const isValidChecksum = PaytmChecksum.verifySignature(paytmParams, config.paytmMerchantKey, checksumHash);
        if (isValidChecksum) {
            // Process payment success/failure
            if (paytmParams.STATUS === 'TXN_SUCCESS') {
                return({ message: 'Payment successful', details: paytmParams });
            } else {
                return({ message: 'Payment failed', details: paytmParams });
            }
        } else {
            throw new Error('Invalid checksum');
        }
    }
}