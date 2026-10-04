import React, {useState, useEffect, useCallback} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  Autocomplete
} from '@mui/material';
import styled from '@emotion/styled';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import {parseAddress, handleStringFromAddress} from '../../utils/addressUtils';
import {useGeoapify} from '../../utils/useGeoapifyAPI';
import {fetchLogIn} from "../AuthContext";

const Container = styled(Box)`
  background-color: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  max-width: 800px;
  margin: auto;
`;

const Section = styled(Box)`
  margin-bottom: 20px;
`;

const CategoryButtonGroup = styled(ToggleButtonGroup)`
  display: flex;
  justify-content: space-between;
  border: 1px solid #d3d3d3;
  padding: 10px;
  border-radius: 4px;
`;

const CategoryButton = styled(ToggleButton)`
  flex: 1;
  margin: 5px;
  height: 50px;
  font-size: 14px;
  background-color: white;
  border: 1px solid #d3d3d3;
  color: #000;
  border-radius: 4px;

  &.Mui-selected {
    border-color: #FF6F00; /* Orange frame for selected category */
  }

  &:hover {
    border-color: #FF6F00;
  }
`;

const DimensionInput = styled(TextField)`
  margin: 10px 5px;
  width: 100%;
`;

const InputLabel = styled(Box)`
  margin: 10px 5px;
  min-width: 150px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  color: #FF6F00;
  border: 1px solid #d3d3d3;
  border-radius: 4px;
  text-align: center;
`;

const SubmitButton = styled(Button)`
  background-color: #FF6F00;
  color: white;
  margin-top: 20px;
  text-transform: none;
  white-space: nowrap;

  &:hover {
    background-color: #FF8F00;
  }
`;

const Title = styled(Typography)`
  color: #FF6F00;
`;

const TwoSidedArrow = styled(SwapHorizIcon)`
  margin: 0 10px;
  color: #FF6F00;
`;

const ServiceDetails = () => {
  const navigate = useNavigate();
  const {title} = useParams();
  const [serviceData, setServiceData] = useState(null);
  const [subServices, setSubServices] = useState([]);
  const [input, setInput] = useState({});
  const [selectedSubService, setSelectedSubService] = useState(null);
  const [inputErrors, setInputErrors] = useState({});
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [serviceReceiverAddress, setServiceReceiverAddress] = useState(null);
  const [alternateLocation, setAlternateLocation] = useState('');
  const {
    setAutocompleteSuggestions, autocompleteSuggestions, addressError, fetchAutocompleteSuggestions, validateAddress
  } = useGeoapify();

  useEffect(() => {
    /**
     * Fetches and sets service data by title.
     *
     * This function fetches the service data based on the provided title, updates the
     * service data and sub-service details state, and logs the option values of the
     * first sub-service.
     */
    const fetchServiceData = async () => {
      try {
        const response = await axios.get(`/servicetypes/getByTitle/${encodeURIComponent(title)}`);
        setServiceData(response.data);

        const subServiceDetails = response.data.subServices;

        setSubServices(subServiceDetails);
        setSelectedSubService(subServiceDetails[0]);

        subServiceDetails[0].optionValues.forEach(element => {
          console.log(`Output here ${element}`);
        });
      } catch (error) {
        console.error('Error fetching service data:', error);
      }
    };

    //Fetches service receiver profile information
    const fetchProfile = async () => {
      try {
        const response = await fetchLogIn();
        const receiver = response.data;
        const receiverAddress = receiver.address;
        console.log("Receiver Address", receiverAddress);

        setServiceReceiverAddress(receiverAddress);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
    fetchServiceData();
  }, [title]);

  /**
   * This function creates a memorized version of the validateAddress function to
   * ensure that the function reference remains stable across renders unless the
   * validateAddress function itself changes.
   */
  const memorizedValidateAddress = useCallback((address) => {
    validateAddress(address);
  }, [validateAddress]);


  //Validates the alternate location when it changes.
  useEffect(() => {
    if (alternateLocation) {
      memorizedValidateAddress(alternateLocation);
    }
  }, [alternateLocation, memorizedValidateAddress]);

  //Toggles the selected state of a service type
  const handleTypeChange = (value) => {
    setSelectedTypes((prev) => prev.includes(value) ? prev.filter((type) => type !== value) : [...prev, value]);
  };

  //Updates the selected sub-service category
  const handleCategoryChange = (event, newCategory) => {
    const selected = subServices.find((subService) => subService.name === newCategory);
    if (selected) {
      setSelectedSubService(selected);
    }
  };

  //Handles changes to the inputs, only accepts numerical input
  const handleInputChange = (optionName, value) => {
    if (/^\d*$/.test(value)) {
      setInput((prev) => ({
        ...prev, [optionName]: value,
      }));
      setInputErrors((prevErrors) => ({
        ...prevErrors, [optionName]: value ? '' : 'This field is required.',
      }));
    }
  };

  //updates the state for the alternate location and fetches autocomplete suggestions based on the new input value.
  const handleAddressChange = (event, newValue) => {
    if (newValue === '') {
      setAlternateLocation('');
      setAutocompleteSuggestions([]);
    } else {
      setAlternateLocation(newValue);
      fetchAutocompleteSuggestions(newValue);
    }
  };

  //Handles the suggestion click of the autocomplete suggestion
  const handleSuggestionClick = (event, value) => {
    if (value) {
      setAlternateLocation(value);
      setAutocompleteSuggestions([]);
    }
  };

  //This function checks if the required fields are filled out correctly
  const validateInputs = () => {
    let errors = {};
    if (selectedSubService) {
      if (selectedSubService.optionValues.length > 1) {
        if (selectedTypes.length === 0) {
          errors["types"] = "Please select at least one type.";
        }
      } else {
        selectedSubService.optionValues.forEach((value) => {
          if (!input[value]) {
            errors[value] = 'This field is required.';
          }
        });
      }
    }
    setInputErrors(errors);
    return Object.keys(errors).length === 0;
  };

  //This function validates the inputs and navigates to the service provider overview page with the appropriate state if validation passes
  const handleSubmit = () => {
    if (!validateInputs()) return;
    navigate(`/service-provider-overview/${title}`, {
      state: {
        selectedSubServiceId: selectedSubService._id,
        input: selectedSubService.optionValues.length > 1 ? selectedTypes : input,
        title: title,
        selectedLocation: alternateLocation && alternateLocation !== '' ? alternateLocation : handleStringFromAddress(serviceReceiverAddress),
      }
    });
    console.log("Übergabe Test 1", selectedSubService._id, input, title, alternateLocation, handleStringFromAddress(serviceReceiverAddress));
  };

  if (!serviceData) {
    return (<Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
        <CircularProgress/>
      </Box>);
  }

  return (<Container sx={{minHeight: '75vh'}}>
      <Button onClick={() => navigate(-1)} startIcon={<ArrowBackIcon/>} style={{marginBottom: '20px'}}>
        Back
      </Button>
      <Title variant="h4" gutterBottom>{serviceData?.title || 'Loading...'}</Title>
      <Title variant="h6" gutterBottom>Give us the details about the job:</Title>
      <Typography variant="body1" gutterBottom>
        {serviceData?.description || 'Loading...'}
      </Typography>
      {subServices && subServices.length > 0 ? (<>
          <Section>
            <Title variant="h6">Category:</Title>
            <CategoryButtonGroup value={selectedSubService?.name || ''} exclusive onChange={handleCategoryChange}>
              {subServices.map((subService) => (<CategoryButton key={subService.name} value={subService.name}>
                  {subService.name}
                </CategoryButton>))}
            </CategoryButtonGroup>
          </Section>
          {selectedSubService && (<Section>
              <Title variant="h6">{selectedSubService.name}:</Title>
              <InputLabel>{selectedSubService.description}</InputLabel>
              {selectedSubService.optionValues && selectedSubService.optionValues.length > 1 ? (<Section>
                  <Title variant="h6">Select Types:</Title>
                  {selectedSubService.optionValues.map((value, index) => (<FormControlLabel
                      key={value + "#" + index}
                      control={<Checkbox
                        checked={selectedTypes.includes(value)}
                        onChange={() => handleTypeChange(value)}
                        disabled={!selectedTypes.includes(value) && selectedTypes.length >= 3}
                      />}
                      label={value}
                    />))}
                  {inputErrors["types"] && (<Typography color="error">{inputErrors["types"]}</Typography>)}
                </Section>) : (selectedSubService.optionValues.map((value, index) => (
                  <Box key={selectedSubService.optionName + "#" + index} display="flex" alignItems="center">
                    <InputLabel>{value}</InputLabel>
                    <DimensionInput
                      label={value}
                      variant="outlined"
                      size="small"
                      value={input[value] || ''}
                      onChange={(e) => handleInputChange(value, e.target.value)}
                      error={!!inputErrors[value]}
                      helperText={inputErrors[value]}
                    />
                  </Box>)))}
            </Section>)}
        </>) : (<Typography variant="body2" color="textSecondary">Loading categories...</Typography>)}
      <Section>
        <Autocomplete
          freeSolo
          options={autocompleteSuggestions.map((option) => option.properties.formatted)}
          onInputChange={handleAddressChange}
          onChange={handleSuggestionClick}
          renderInput={(params) => (<TextField
              {...params}
              label="Alternate Location"
              placeholder={`Enter an alternate location, if your location is not ${handleStringFromAddress(serviceReceiverAddress)}`}
              variant="filled"
              value={alternateLocation}
              onChange={(e) => setAlternateLocation(e.target.value)}
              InputLabelProps={{
                shrink: true, style: {
                  backgroundColor: 'white', padding: '0 4px', transform: 'translate(14px, -6px) scale(0.75)',
                },
              }}
              sx={{
                width: '100%', marginTop: 2, backgroundColor: 'white', border: '1px solid #d3d3d3', borderRadius: '4px',
              }}
            />)}
        />

      </Section>
      <SubmitButton variant="contained" endIcon={<ArrowForwardIcon/>} onClick={handleSubmit}>
        Show available
        <br/>
        craftsmen
      </SubmitButton>
    </Container>);
};

export default ServiceDetails;
