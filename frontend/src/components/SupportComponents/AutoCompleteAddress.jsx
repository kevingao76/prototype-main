import React, { useState, useEffect } from 'react';
import { Autocomplete, TextField, CircularProgress } from '@mui/material';
import { useGeoapify } from '../hooks/useGeoapifyAPI'; 

const AutoCompleteAddress = ({ address, setAddress, error, setError }) => {
  const [loading, setLoading] = useState(false);
  const { setAutocompleteSuggestions, autocompleteSuggestions, fetchAutocompleteSuggestions, validateAddress } = useGeoapify();

  useEffect(() => {
    if (address) {
      validateAddress(address);
    }
  }, [address, validateAddress]);

  const handleAddressChange = (event, newValue) => {
    setAddress(newValue);
    fetchAutocompleteSuggestions(newValue);
  };

  const handleSuggestionClick = (event, value) => {
    if (value) {
      setAddress(value);
      setAutocompleteSuggestions([]);
    }
  };

  return (
    <Autocomplete
      freeSolo
      options={autocompleteSuggestions.map((option) => option.properties.formatted)}
      onInputChange={handleAddressChange}
      onChange={handleSuggestionClick}
      loading={loading}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Address"
          variant="outlined"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          error={!!error}
          helperText={error}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
};

export default AutoCompleteAddress;
