import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const publicGalleryApi = {
  async getApprovedImages() {
    const { data } = await axios.get(`${baseURL}/api/gallery/public/approved`);
    return data;
  },
};
