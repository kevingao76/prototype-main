import axios from 'axios';
import geocode from '../utils/geocode.js'

const calculateDistance = async (startCoords, endCoords) => {
  const osrmUrl = `http://router.project-osrm.org/route/v1/driving/${startCoords.lng},${startCoords.lat};${endCoords.lng},${endCoords.lat}?overview=false`;

  try {
    const response = await axios.get(osrmUrl);
    const routes = response.data.routes;

    if (routes.length === 0) {
      throw new Error('No route found');
    }

    const distance = routes[0].distance; // Distance in meters
    return distance;
  } catch (error) {
    console.error(`OSRM error: ${error.message}`);
    throw error;
  }
};

const getDistanceBetweenAddresses = async (address1, address2) => {
  try {
    const [startCoords, endCoords] = await Promise.all([geocode(address1), geocode(address2)]);
    const distance = await calculateDistance(startCoords, endCoords);
    return distance;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    throw error;
  }
};

export default getDistanceBetweenAddresses;
