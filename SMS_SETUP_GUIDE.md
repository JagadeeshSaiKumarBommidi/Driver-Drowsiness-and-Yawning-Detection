# 📱 Setting Up Real OTP/SMS Functionality

## Current Issue
You're getting "OTP not found" because the system is currently in demo mode. To enable real SMS delivery to phone numbers, you need to configure Twilio.

## 🚀 Quick Setup Steps

### Step 1: Get Twilio Credentials
1. **Sign up** for a free Twilio account at [https://www.twilio.com/](https://www.twilio.com/)
2. **Verify your phone number** during signup
3. **Go to your Twilio Console** at [https://console.twilio.com/](https://console.twilio.com/)
4. **Copy your credentials**:
   - Account SID (starts with "AC...")
   - Auth Token (click the eye icon to reveal)

### Step 2: Get a Phone Number
1. In Twilio Console, go to **Phone Numbers** → **Manage** → **Buy a number**
2. **Choose a number** (free trial gives you $15 credit)
3. **Copy the phone number** (format: +1234567890)

### Step 3: Configure the App
1. **Copy the template**:
   ```bash
   copy .env.example .env.local
   ```

2. **Edit `.env.local`** with your actual credentials:
   ```env
   VITE_TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxx
   VITE_TWILIO_AUTH_TOKEN=your_auth_token_here
   VITE_TWILIO_FROM_NUMBER=+1234567890
   ```

3. **Restart the development server**:
   ```bash
   npm run dev
   ```

### Step 4: Test Real SMS
1. **Enter your real phone number** in the login form
2. **Click "Send OTP"**
3. **Check your phone** for the SMS message
4. **Enter the OTP** you received

## 💡 Alternative: Direct Configuration

If you don't want to use environment variables, you can directly edit the config file:

**Edit `src/config/twilio.ts`**:
```typescript
export const TWILIO_CONFIG = {
  accountSid: 'ACxxxxxxxxxxxxxxxxxxxxx', // Your actual Account SID
  authToken: 'your_auth_token_here',     // Your actual Auth Token
  fromNumber: '+1234567890',             // Your Twilio phone number
};
```

## 🔧 Troubleshooting

### "OTP not found" Error
- **Cause**: Demo mode is active, OTP storage is working
- **Solution**: Configure Twilio credentials as above

### "Failed to send OTP" Error
- **Check**: Twilio credentials are correct
- **Check**: Phone number format is correct (+1234567890)
- **Check**: You have Twilio credit remaining

### SMS Not Received
- **Check**: Phone number is correct and includes country code
- **Check**: Your phone can receive SMS
- **Check**: Twilio trial restrictions (can only send to verified numbers)

### Trial Account Limitations
- **Free trial**: Can only send SMS to verified phone numbers
- **Solution**: Verify your phone number in Twilio Console
- **Or**: Add credit to remove restrictions

## 🎯 Current Fallback Behavior

Until you configure Twilio:
- ✅ **Demo mode works**: OTP shown in browser alert
- ✅ **Login still functions**: Use the demo OTP
- ⚠️ **No real SMS**: Messages won't be sent to phones

## 📞 Support

If you need help:
1. **Check browser console** for error messages
2. **Check Twilio logs** in your console
3. **Verify phone number format** includes country code
4. **Make sure you have Twilio credit**

Once configured, your app will send real SMS messages to any phone number! 🎉
