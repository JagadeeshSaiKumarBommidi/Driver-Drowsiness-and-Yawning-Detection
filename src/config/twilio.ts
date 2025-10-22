// Twilio Configuration
// To use real SMS functionality, replace these values with your actual Twilio credentials

export const TWILIO_CONFIG = {
  // Get these from your Twilio Console (https://console.twilio.com/)
  accountSid: import.meta.env.VITE_TWILIO_ACCOUNT_SID || 'YOUR_TWILIO_ACCOUNT_SID',
  authToken: import.meta.env.VITE_TWILIO_AUTH_TOKEN || 'YOUR_TWILIO_AUTH_TOKEN',
  fromNumber: import.meta.env.VITE_TWILIO_FROM_NUMBER || 'YOUR_TWILIO_PHONE_NUMBER', // Must be a Twilio phone number
};

// Helper function to check if Twilio is properly configured
export const isTwilioConfigured = (): boolean => {
  return TWILIO_CONFIG.accountSid !== 'YOUR_TWILIO_ACCOUNT_SID' &&
         TWILIO_CONFIG.authToken !== 'YOUR_TWILIO_AUTH_TOKEN' &&
         TWILIO_CONFIG.fromNumber !== 'YOUR_TWILIO_PHONE_NUMBER' &&
         TWILIO_CONFIG.accountSid.length > 0 &&
         TWILIO_CONFIG.authToken.length > 0 &&
         TWILIO_CONFIG.fromNumber.length > 0;
};

// Format phone number for Twilio (must include country code)
export const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove all non-digits
  const digits = phoneNumber.replace(/\D/g, '');
  
  // If it doesn't start with country code, assume US (+1)
  if (digits.length === 10) {
    return `+1${digits}`;
  } else if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  } else {
    // For international numbers, assume they provided the country code
    return `+${digits}`;
  }
};
