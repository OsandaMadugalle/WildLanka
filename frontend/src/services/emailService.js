// Email Service for sending emails to donors
import emailjs from '@emailjs/browser';

// EmailJS Configuration
const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_ode3gbj', // Replace with your EmailJS service ID
  TEMPLATE_ID: 'template_q3qwprk', // Replace with your EmailJS template ID
  PUBLIC_KEY: '4ENbi-NRXw2QGnMz2', // Replace with your EmailJS public key
};

// Initialize EmailJS
emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);

// Debug function to test EmailJS with different parameter combinations
export const debugEmailJS = async () => {
  try {
    console.log('Testing EmailJS with different parameter combinations...');
    
    // Try with different parameter combinations
    const testCases = [
      {
        name: 'Standard EmailJS format',
        params: {
          to_email: 'test@example.com',
          to_name: 'Test User',
          message: 'Test message from Wildlife Safari'
        }
      },
      {
        name: 'Alternative email parameter',
        params: {
          email: 'test@example.com',
          to_name: 'Test User',
          message: 'Test message from Wildlife Safari'
        }
      },
      {
        name: 'User email parameter',
        params: {
          user_email: 'test@example.com',
          to_name: 'Test User',
          message: 'Test message from Wildlife Safari'
        }
      },
      {
        name: 'Recipient email parameter',
        params: {
          recipient_email: 'test@example.com',
          to_name: 'Test User',
          message: 'Test message from Wildlife Safari'
        }
      }
    ];

    for (const testCase of testCases) {
      console.log(`\n--- Testing: ${testCase.name} ---`);
      console.log('Parameters:', testCase.params);
      
      try {
        const result = await emailjs.send(
          EMAILJS_CONFIG.SERVICE_ID,
          EMAILJS_CONFIG.TEMPLATE_ID,
          testCase.params
        );
        console.log('✅ SUCCESS:', testCase.name);
        console.log('Result:', result);
        return { success: true, workingParams: testCase.params, result };
      } catch (error) {
        console.log('❌ FAILED:', testCase.name);
        console.log('Error:', error);
      }
    }
    
    return { success: false, error: 'All test cases failed' };
  } catch (error) {
    console.error('Debug EmailJS Error:', error);
    return { success: false, error: error.message };
  }
};

// Send thank you email to donor
export const sendThankYouEmail = async (donation) => {
  try {
    // Validate donation object
    if (!donation || !donation.email) {
      throw new Error('Donation object is missing or has no email address');
    }

    console.log('Sending thank you email to:', donation.email);
    console.log('Donation object:', donation);
    
    const templateParams = {
      to_email: donation.email, // Required by EmailJS for recipient
      to_name: donation.isAnonymous ? 'Valued Donor' : `${donation.firstName} ${donation.lastName}`,
      message: `Thank you so much for your generous donation of ${donation.currency} ${donation.amount?.toLocaleString()} to our wildlife conservation efforts.

Your contribution will help us:
• Protect endangered wildlife species
• Maintain and preserve natural habitats
• Support our conservation programs
• Educate communities about wildlife protection

We are truly grateful for your support in helping us make a difference in wildlife conservation.

Best regards,
The Wildlife Safari Team`,
      // Alternative parameter names in case EmailJS expects different ones
      email: donation.email,
      user_email: donation.email,
      recipient_email: donation.email,
    };

    console.log('Template parameters:', templateParams);

    const result = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      templateParams
    );

    console.log('Email sent successfully:', result);
    return {
      success: true,
      messageId: result.text,
    };
  } catch (error) {
    console.error('EmailJS Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to send email',
    };
  }
};

// Send custom email to donor
export const sendCustomEmail = async (donation, subject, message) => {
  try {
    // Validate inputs
    if (!donation || !donation.email) {
      throw new Error('Donation object is missing or has no email address');
    }
    
    if (!message || !message.trim()) {
      throw new Error('Message is required');
    }

    console.log('Sending custom email to:', donation.email);
    console.log('Subject:', subject);
    console.log('Message:', message);
    
    const templateParams = {
      to_email: donation.email, // Required by EmailJS for recipient
      to_name: donation.isAnonymous ? 'Valued Donor' : `${donation.firstName} ${donation.lastName}`,
      message: message,
      subject: subject || 'Message from Wildlife Safari',
      // Alternative parameter names in case EmailJS expects different ones
      email: donation.email,
      user_email: donation.email,
      recipient_email: donation.email,
    };

    console.log('Template parameters:', templateParams);

    const result = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      templateParams
    );

    console.log('Custom email sent successfully:', result);
    return {
      success: true,
      messageId: result.text,
    };
  } catch (error) {
    console.error('EmailJS Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to send email',
    };
  }
};

// Test EmailJS configuration
export const testEmailConfiguration = async () => {
  try {
    console.log('Testing EmailJS configuration...');
    
    const testParams = {
      to_email: 'test@example.com', // Required by EmailJS
      to_name: 'Test User',
      message: 'This is a test email to verify EmailJS configuration is working correctly.',
      subject: 'Test Email from Wildlife Safari',
      // Alternative parameter names
      email: 'test@example.com',
      user_email: 'test@example.com',
      recipient_email: 'test@example.com',
    };

    console.log('Test parameters:', testParams);

    const result = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      testParams
    );

    console.log('Test email sent successfully:', result);
    return {
      success: true,
      message: 'EmailJS configuration is working correctly',
      messageId: result.text,
    };
  } catch (error) {
    console.error('EmailJS Test Error:', error);
    return {
      success: false,
      error: error.message || 'EmailJS configuration test failed',
    };
  }
};
