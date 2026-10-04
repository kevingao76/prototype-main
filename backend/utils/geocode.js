import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const geocode = async (address) => {
  const encodedAddress = encodeURIComponent(address);
  const apiKey = process.env.OPENCAGE_API_KEY;
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodedAddress}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    const data = response.data;

    if (data.results.length === 0) {
      throw new Error('No results found');
    }

    const location = data.results[0].geometry;
    return {
      lat: location.lat,
      lng: location.lng
    };
  } catch (error) {
    console.error(`Geocoding error: ${error.message}`);
    throw error;
  }
};

export default geocode;
