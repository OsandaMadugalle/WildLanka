import axios from 'axios';

const testAdminLogin = async () => {
  try {
    console.log('Testing admin login...');
    
    const response = await axios.post('http://localhost:5000/api/auth/login', {
  email: 'admin@wildlanka.com',
      password: 'admin123'
    });
    
    console.log('✅ Admin login successful!');
    console.log('Token:', response.data.token);
    console.log('User:', response.data.user);
    
  } catch (error) {
    console.error('❌ Admin login failed:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message);
    console.error('Error:', error.message);
    console.error('Full error:', error);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('Server is not running on port 5000');
    }
  }
};

testAdminLogin();
