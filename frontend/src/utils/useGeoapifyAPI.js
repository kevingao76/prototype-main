import { useState } from 'react';

const GEOAPIFY_API_KEY = '6f068ab5d21443ec9f641cfd905e52a9';

export const useGeoapify = () => {
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState([]);
  const [addressError, setAddressError] = useState('');

  const fetchAutocompleteSuggestions = async (query) => {
    const requestOptions = {
      method: 'GET',
    };

    try {
      const response = await fetch(`https://api.geoapify.com/v1/geocode/autocomplete?text=${query}&apiKey=${GEOAPIFY_API_KEY}`, requestOptions);
      const result = await response.json();
      setAutocompleteSuggestions(result.features || []);
    } catch (error) {
      console.error('Error fetching autocomplete suggestions:', error);
    }
  };

  const validateAddress = async (address) => {
    const requestOptions = {
      method: 'GET',
    };

    try {
      const response = await fetch(`https://api.geoapify.com/v1/geocode/search?text=${address}&apiKey=${GEOAPIFY_API_KEY}`, requestOptions);
      const result = await response.json();
      if (result.features && result.features.length > 0) {
        setAddressError('');
      } else {
        setAddressError('Address is not valid or incomplete');
      }
    } catch (error) {
      console.error('Error validating address:', error);
      setAddressError('An error occurred while validating the address');
    }
  };

  return {
    autocompleteSuggestions,
    addressError,
    fetchAutocompleteSuggestions,
    validateAddress,
    setAutocompleteSuggestions
  };
};
