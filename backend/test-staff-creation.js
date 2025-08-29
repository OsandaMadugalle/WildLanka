import axios from 'axios';

const testStaffCreation = async () => {
  try {
    console.log('Testing staff creation...');
    
    // First, login as admin to get token
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
  email: 'admin@wildlanka.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Admin login successful!');
    
    // Test creating a driver
    const driverData = {
      firstName: 'John',
      lastName: 'Driver',
  email: 'john.driver@wildlanka.com',
      password: 'password123',
      phone: '+94 71 123 4567',
      role: 'driver',
      specialization: 'Safari Vehicle Operations',
      experience: '5',
      licenseNumber: 'DL123456789'
    };
    
    const driverResponse = await axios.post('http://localhost:5000/api/staff', driverData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Driver created successfully!');
    console.log('Driver ID:', driverResponse.data._id);
    
    // Test creating a tour guide
    const guideData = {
      firstName: 'Sarah',
      lastName: 'Guide',
  email: 'sarah.guide@wildlanka.com',
      password: 'password123',
      phone: '+94 71 987 6543',
      role: 'tour_guide',
      specialization: 'Wildlife Photography',
      experience: '8',
      licenseNumber: 'TG987654321'
    };
    
    const guideResponse = await axios.post('http://localhost:5000/api/staff', guideData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Tour Guide created successfully!');
    console.log('Guide ID:', guideResponse.data._id);
    
    // Test creating a sub-admin
    const subAdminData = {
      firstName: 'Mike',
      lastName: 'Admin',
  email: 'mike.admin@wildlanka.com',
      password: 'password123',
      phone: '+94 71 555 1234',
      role: 'admin',
      specialization: 'Operations Management',
      experience: '10',
      licenseNumber: 'ADM001'
    };
    
    const subAdminResponse = await axios.post('http://localhost:5000/api/staff', subAdminData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Sub-Admin created successfully!');
    console.log('Sub-Admin ID:', subAdminResponse.data._id);
    
    console.log('\n🎉 All staff creation tests passed!');
    
  } catch (error) {
    console.error('❌ Staff creation test failed:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message);
    console.error('Error:', error.message);
  }
};

testStaffCreation();
