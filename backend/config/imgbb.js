import axios from 'axios';
import FormData from 'form-data';

const IMGBB_API_KEY = process.env.IMGBB_API_KEY || '192f7b9ab289d65080762262bb74de1d';
const IMGBB_API_URL = 'https://api.imgbb.com/1/upload';

export const uploadToImgBB = async (imageBuffer, filename) => {
  try {
    console.log('[ImgBB] Starting upload:', { key: IMGBB_API_KEY, filename });
    if (!imageBuffer || imageBuffer.length === 0) {
      console.error('[ImgBB] Image buffer is empty!');
      throw new Error('Image buffer is empty');
    }
    // Convert buffer to base64 string
    const base64Image = imageBuffer.toString('base64');
    const formData = new FormData();
    formData.append('image', base64Image);
    console.log('[ImgBB] FormData created. Buffer size:', imageBuffer.length);
    const response = await axios.post(IMGBB_API_URL, formData, {
      params: {
        key: IMGBB_API_KEY
      },
      headers: {
        ...formData.getHeaders()
      }
    });
    console.log('[ImgBB] Raw response:', response.status, response.statusText, response.data);
    if (response.data.success) {
      console.log('[ImgBB] Upload success. Image URL:', response.data.data.url);
      return {
        url: response.data.data.url,
        deleteUrl: response.data.data.delete_url,
        id: response.data.data.id
      };
    } else {
      console.error('[ImgBB] API error:', response.data);
      throw new Error(`ImgBB API error: ${response.data.error?.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('[ImgBB] Upload error:', error.response?.data || error.message);
    if (error.response?.status === 400) {
      throw new Error(`ImgBB API error: ${error.response.data.error?.message || 'Invalid request'}`);
    } else if (error.response?.status === 403) {
      throw new Error('ImgBB API key is invalid or expired');
    } else {
      throw new Error(`Image upload failed: ${error.message}`);
    }
  }
};