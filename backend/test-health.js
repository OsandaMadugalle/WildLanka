import axios from 'axios';

const testHealth = async () => {
  try {
    console.log('Testing server health...');
    
    const response = await axios.get('http://localhost:5000/health');
    
    console.log('✅ Server is running!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.log('❌ Server is not running!');
    console.log('Error:', error.message);
  }
};

testHealth();
