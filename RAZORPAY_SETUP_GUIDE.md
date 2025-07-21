# Razorpay Payment Setup Guide

## Error: "भुगतान आदेश बनाने में त्रुटि / Error creating payment order"

This error occurs when Razorpay credentials are not properly configured.

## Step-by-Step Fix

### 1. Create Razorpay Account
1. Go to [https://razorpay.com](https://razorpay.com)
2. Click "Sign Up" and create a free account
3. Complete email verification
4. Complete business verification (for production) or use test mode

### 2. Get API Credentials
1. Login to Razorpay Dashboard
2. Go to **Settings** → **API Keys**
3. Click **Generate Test Key** (for testing)
4. Copy the credentials:
   - **Key ID**: `rzp_test_XXXXXXXXXXXXXXXXXX`
   - **Key Secret**: `XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`

### 3. Update Backend Configuration
1. Open `backend/.env` file
2. Replace the placeholder values:
   ```env
   # Before (placeholder values)
   RAZORPAY_KEY_ID=your-razorpay-key-id
   RAZORPAY_KEY_SECRET=your-razorpay-key-secret
   
   # After (your actual credentials)
   RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXXXXX
   RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

### 4. Restart Backend Server
```bash
cd backend
npm run dev
```

### 5. Test Payment Flow
1. Go to `http://localhost:3000/parent/login`
2. Login with parent credentials
3. Navigate to Fee Payment
4. Try to make a payment
5. Should now work without the error

## Important Notes

### Test vs Production
- **Test Keys**: Start with `rzp_test_` - for development
- **Live Keys**: Start with `rzp_live_` - for production only

### Security
- Never commit real credentials to version control
- Use environment variables only
- Keep credentials secure

### Test Cards (for testing payments)
- **Card Number**: 4111 1111 1111 1111
- **Expiry**: Any future date
- **CVV**: Any 3 digits
- **Name**: Any name

## Troubleshooting

### Error: "Payment service not configured"
- Check if `.env` file has correct Razorpay credentials
- Restart the backend server after updating `.env`

### Error: "Invalid key_id or key_secret"
- Verify credentials are copied correctly from Razorpay dashboard
- Ensure no extra spaces or characters

### Error: "Network error"
- Check internet connection
- Verify Razorpay service status

## Payment Flow After Fix
1. Parent selects student and amount
2. Backend creates Razorpay order
3. Frontend opens Razorpay payment gateway
4. Parent completes payment
5. Parent uploads screenshot
6. Admin approves/rejects payment
7. Student fee record updated

## Support
If you continue to face issues:
1. Check backend console for detailed error logs
2. Verify all environment variables are set
3. Test with Razorpay test credentials first
4. Contact Razorpay support for API-related issues