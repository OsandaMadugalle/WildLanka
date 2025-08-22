import axios from 'axios';
import FormData from 'form-data';

const IMGBB_API_KEY = process.env.IMGBB_API_KEY || '71f772675b2bf6510734e771bd676095';
const IMGBB_API_URL = 'https://api.imgbb.com/1/upload';

export const uploadToImgBB = async (imageBuffer, filename) => {
  try {
    console.log('Starting ImgBB upload with key:', IMGBB_API_KEY);
    
    const formData = new FormData();
    formData.append('image', imageBuffer, {
      filename: filename,
      contentType: 'image/jpeg'
    });

    console.log('FormData created, making request to ImgBB...');

    const response = await axios.post(IMGBB_API_URL, formData, {
      params: {
        key: IMGBB_API_KEY
      },
      headers: {
        ...formData.getHeaders()
      }
    });

    console.log('ImgBB response:', response.data);

    if (response.data.success) {
      return {
        url: response.data.data.url,
        deleteUrl: response.data.data.delete_url,
        id: response.data.data.id
      };
    } else {
      console.error('ImgBB API error:', response.data);
      throw new Error(`ImgBB API error: ${response.data.error?.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('ImgBB upload error:', error.response?.data || error.message);
    if (error.response?.status === 400) {
      throw new Error(`ImgBB API error: ${error.response.data.error?.message || 'Invalid request'}`);
    } else if (error.response?.status === 403) {
      throw new Error('ImgBB API key is invalid or expired');
    } else {
      throw new Error(`Image upload failed: ${error.message}`);
    }
  }
};
