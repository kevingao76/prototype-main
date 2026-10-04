import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Box, TextField, Button, Typography, IconButton, Grid, InputAdornment, Snackbar, Alert, Divider  } from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import Title from '../SupportComponents/Title';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  maxWidth: '800px',
  height: '80%',
  maxHeight: '80vh',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  overflow: 'auto',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
};

const ModalBox = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  overflow: auto;
`;

const CenteredTextField = styled(TextField)`
  width: 100%;
  margin: 0 auto;
`;

const DateButton = styled(Button)`
  margin: 5px;
  text-transform: none;

  &:hover {
    background-color: #FFE0B2;
  }

  &.selected {
    background-color: #FF8F00;
    color: white;
  }
`;

const calculateEndTime = (startTime, duration) => {
  const [hours, minutes] = startTime.split(':').map(Number);
  const end = new Date();
  end.setHours(hours);
  end.setMinutes(minutes + Number(duration));

  const endHours = String(end.getHours()).padStart(2, '0');
  const endMinutes = String(end.getMinutes()).padStart(2, '0');

  return `${endHours}:${endMinutes}`;
};

// Function to add 2 hours to the provided start time
const addTwoHours = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hours + 2);
  date.setMinutes(minutes);

  const newHours = String(date.getHours()).padStart(2, '0');
  const newMinutes = String(date.getMinutes()).padStart(2, '0');

  return `${newHours}:${newMinutes}`;
};

const combineDateAndTime = (date, time) => {
  const combined = new Date(date);
  const [hours, minutes] = time.split(':').map(Number);
  combined.setHours(hours); // Add 2 hours here
  combined.setMinutes(minutes);
  return combined.toISOString(); // Ensure this returns an ISO string
};

function CreateServiceOfferModal({ open, handleClose, inquiry, handleSnackbar }) {
  const [step, setStep] = useState(0);
  const [workingConditionsData, setWorkingConditionsData] = useState({});
  const [serviceOfferData, setServiceOfferData] = useState({
    serviceOfferId: '',
    viewingConditionsId: '',
    workingConditionsIds: '',
    message: '',
    specials: ''
  });
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [isNextDisabled, setIsNextDisabled] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const handleNext = () => {
    setStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setStep((prevStep) => prevStep - 1);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  useEffect(() => {
    if (!open) {
      setStep(0);
      setWorkingConditionsData({});
      setServiceOfferData({
        serviceOfferId: '',
        viewingConditionsId: '',
        workingConditionsIds: '',
        message: '',
        specials: ''
      });
      setSelectedSlots([]);
    }
  }, [open]);

  const createWorkingConditions = async () => {
    const response = await axios.get("/serviceOffers/getall");
    const serviceOfferId = response.data.filter(offer => offer.serviceRequest._id === inquiry._id)[0]._id;

    const createConditionsPromises = selectedSlots.map(async (slot) => {
      const conditionData = {
        serviceOfferId,
        hourlyRate: workingConditionsData[slot].hourlyRate,
        date: workingConditionsData[slot].date,
        expectedDuration: workingConditionsData[slot].expectedDuration,
        expectedMaterialCost: workingConditionsData[slot].expectedMaterialCost,
        expectedAdditionalCostFactors: workingConditionsData[slot].expectedAdditionalCostFactors,
        specialConditions: workingConditionsData[slot].specialConditions,
      };

      try {
        const response = await axios.post('/serviceConditions/create', conditionData);
        return response.data._id;
      } catch (error) {
        console.error('Error creating Service Condition:', error);
        throw error;
      }
    });

    try {
      const createdConditionIds = await Promise.all(createConditionsPromises);
      return createdConditionIds;
    } catch (error) {
      console.error('Failed to create some service conditions');
      throw error;
    }
  };

  const fillServiceOffer = async (workingConditionIds) => {
    const response = await axios.get("/serviceOffers/getall");
    const serviceOfferId = response.data.filter(offer => offer.serviceRequest._id === inquiry._id)[0]._id;

    const fillServiceOfferData = {
      serviceOfferId,
      viewingConditionsId: '',
      workingConditionsIds: workingConditionIds,
      message: serviceOfferData.message,
      specials: serviceOfferData.specialConditions
    };

    try {
      const response = await axios.put('/serviceOffers/fill', fillServiceOfferData);
      return response.data;
    } catch (error) {
      console.error('Error filling Service Offer:', error);
      throw error;
    }
  };

  const handleCreateOfferClick = async () => {
    try {
      const createdConditionIds = await createWorkingConditions();
      const filledOffer = await fillServiceOffer(createdConditionIds);
      console.log('Service Offer filled:', filledOffer);

      const response2 = await axios.get("/serviceOffers/getall");
      const serviceOfferId = response2.data.filter(offer => offer.serviceRequest._id === inquiry._id)[0]._id;

      const OfferId = { id: serviceOfferId };
      const response = await axios.post('serviceOffers/finalize', OfferId);
      console.log('Offer finalized', response);

      handleSnackbar('Service offer created successfully!', 'success');
      handleClose();
    } catch (error) {
      console.error('Error during offer creation and filling:', error);
      handleSnackbar('Failed to create service offer. Please try again.', 'error');
    }
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlots((prevSlots) => {
      if (prevSlots.includes(slot)) {
        const newSlots = prevSlots.filter((s) => s !== slot);
        const newworkingConditionsData = { ...workingConditionsData };
        delete newworkingConditionsData[slot];
        return newSlots;
      } else {
        setWorkingConditionsData((prevworkingConditionsData) => ({
          ...prevworkingConditionsData,
          [slot]: {
            serviceOfferId: '',
            hourlyRate: '',
            date: slot,
            expectedDuration: '',
            expectedMaterialCost: '',
            expectedAdditionalCostFactors: [],
            specialConditions: '',
            endTime: '',
          },
        }));
        return [...prevSlots, slot];
      }
    });
  };

  const handleInputChange = (slot, field, value) => {
    setWorkingConditionsData((prevworkingConditionsData) => {
      const updatedSlotData = {
        ...prevworkingConditionsData[slot],
        [field]: value,
      };

      if (!/^\d*[.,]?\d*$/.test(value)) {
        updatedSlotData[`${field}Error`] = 'Please enter only numbers here';
      } else {
        updatedSlotData[`${field}Error`] = '';
      }

      if (field === 'startTime' && updatedSlotData.expectedDuration) {
        updatedSlotData.endTime = calculateEndTime(value, updatedSlotData.expectedDuration);
      }

      if (field === 'expectedDuration' && updatedSlotData.startTime) {
        updatedSlotData.endTime = calculateEndTime(updatedSlotData.startTime, value);
      }

      // Combine date and startTime to ensure the date field is correctly set
      if (field === 'startTime') {
        updatedSlotData.date = combineDateAndTime(slot, addTwoHours(value)); // Add 2 hours to the time here
      }

      return {
        ...prevworkingConditionsData,
        [slot]: updatedSlotData,
      };
    });

    validateNextButton(slot);
  };

  const validateNextButton = (slot) => {
    setIsNextDisabled(!validateForm(slot));
  };

  const handleAddCostFactor = (slot) => {
    setWorkingConditionsData((prevworkingConditionsData) => ({
      ...prevworkingConditionsData,
      [slot]: {
        ...prevworkingConditionsData[slot],
        expectedAdditionalCostFactors: [...prevworkingConditionsData[slot].expectedAdditionalCostFactors, { description: '', price: '' }],
      },
    }));
  };

  const handleRemoveCostFactor = (slot, index) => {
    const newFactors = workingConditionsData[slot].expectedAdditionalCostFactors.filter((_, i) => i !== index);
    setWorkingConditionsData((prevworkingConditionsData) => ({
      ...prevworkingConditionsData,
      [slot]: {
        ...prevworkingConditionsData[slot],
        expectedAdditionalCostFactors: newFactors,
      },
    }));
  };

  const handleCostFactorChange = (slot, index, field, value) => {
    if (value < 0) value = 0;
    const newFactors = [...workingConditionsData[slot].expectedAdditionalCostFactors];
    newFactors[index][field] = value;
    setWorkingConditionsData((prevworkingConditionsData) => ({
      ...prevworkingConditionsData,
      [slot]: {
        ...prevworkingConditionsData[slot],
        expectedAdditionalCostFactors: newFactors,
      },
    }));
  };

  const formatDateString = (dateString) => {
    const date = new Date(dateString);

    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();
    return `${day}.${month}.${year}`;
  };

  const validateForm = (slot) => {
    const { hourlyRate, expectedDuration, expectedMaterialCost, startTime, hourlyRateError, expectedDurationError, expectedMaterialCostError } = workingConditionsData[slot] || {};
    return hourlyRate && expectedDuration && expectedMaterialCost && startTime && !hourlyRateError && !expectedDurationError && !expectedMaterialCostError;
  };

  useEffect(() => {
    const currentSlot = selectedSlots[step - 1];
    if (currentSlot) {
      setIsNextDisabled(!validateForm(currentSlot));
    } else {
      setIsNextDisabled(false);
    }
  }, [workingConditionsData, step, selectedSlots]);

  const handleServiceOfferData = (field, value) => {
    setServiceOfferData((prevServiceOfferData) => ({
      ...prevServiceOfferData,
      [field]: value,
    }));
  };

  const getSlotType = (index) => {
    if (inquiry.agreesToInspectionAppointmentIfNeeded && index === 0) {
      return 'Viewing Condition';
    }
    return 'Working Condition';
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <Box position="absolute" top={8} right={8}>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <ModalBox>
          <Box display="flex" justifyContent="center" mb={2}>
            <Title text={'Specify your offer'} />
          </Box>
          {inquiry && (
            <>
              {step === 0 && (
                <>
                  <Box display="flex" flexDirection="column" minHeight="60vh" justifyContent="space-between">
                    <Box mb={4}>
                      <Typography id="offer-modal-title" variant="h6" component="h2" mb={2}>
                        Available Timeslots
                      </Typography>
                      <Box mb={2}>
                        <Typography id="offer-modal-title" variant="body1" color="textSecondary">
                          Has {inquiry.agreesToInspectionAppointmentIfNeeded ? '' : 'NOT'} requested a viewing appointment:
                        </Typography>
                      </Box>
                      <Typography variant="body1" color="textSecondary" mb={2}>
                        {inquiry.agreesToInspectionAppointmentIfNeeded
                          ? 'Please select at least two of the suggested Time Slots by the receiver. The earliest one will be used as the viewing condition, and the others as working conditions.'
                          : 'Please select at least one of the suggested Time Slots by the receiver.'}
                      </Typography>
                      <Box display="flex" flexWrap="wrap" justifyContent="center" mb={4}>
                        {inquiry.dateOptions.map((slot, index) => (
                          <DateButton
                            key={index}
                            variant="outlined"
                            onClick={() => handleSlotSelect(slot)}
                            className={selectedSlots.includes(slot) ? 'selected' : ''}
                            sx={{ m: 1 }}
                          >
                            {index === 0 ? 'Preferred timeslot: ' : `Optional timeslot #${index}: `}
                            {formatDateString(slot)}
                          </DateButton>
                        ))}
                      </Box>
                      <Typography variant="body2" color="textSecondary" mt={18}>
                        If you deem that you will need more than the available timeslots, please make an offer for the viewing and let the receiver know, by filling in the message/special conditions field.
                        Any offer can be adjusted afterward and the needed amount of appointments can be added, after the viewing has taken place.
                      </Typography>
                    </Box>
                    <Box>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="body1" color="textSecondary" mb={2}>
                        Please remember to consider the 3% service fee, which will be taken from the overall price, when setting the cost of your overall offer.
                      </Typography>
                      <Box display="flex" justifyContent="flex-end" mt={2}>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleNext}
                          endIcon={<ArrowForwardIcon />}
                          disabled={
                            inquiry.agreesToInspectionAppointmentIfNeeded
                              ? selectedSlots.length < 2
                              : selectedSlots.length < 1
                          }
                        >
                          Next
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                </>
              )}
              {step > 0 && selectedSlots.length > 0 && selectedSlots.map((slot, slotIndex) => (
                <React.Fragment key={slotIndex}>
                  {step === slotIndex + 1 && (
                    <>
                      <Box>
                        <Typography id="offer-modal-title" variant="h6" component="h2">
                          Selected Date Option: {formatDateString(slot)}
                        </Typography>
                        <Typography variant="body1" color="textSecondary">
                          Condition Type: {getSlotType(slotIndex)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography id="offer-modal-title" variant="h6" component="h2">
                          General information
                        </Typography>
                        <Typography variant="body1" color="textSecondary">
                          Please enter some general data for your offer.
                        </Typography>
                      </Box>
                      <CenteredTextField
                        label="Hourly Rate *"
                        variant="outlined"
                        type="text"
                        value={workingConditionsData[slot]?.hourlyRate || ''}
                        onChange={(e) => handleInputChange(slot, 'hourlyRate', e.target.value)}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">€</InputAdornment>,
                          inputProps: { min: 0 }
                        }}
                        error={!!workingConditionsData[slot]?.hourlyRateError}
                        helperText={workingConditionsData[slot]?.hourlyRateError}
                      />

                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <TextField
                            label="Start Time *"
                            type="time"
                            value={workingConditionsData[slot]?.startTime || ''}
                            onChange={(e) => handleInputChange(slot, 'startTime', e.target.value)}
                            InputLabelProps={{
                              shrink: true,
                            }}
                            fullWidth
                            required
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            label="End Time"
                            type="time"
                            value={workingConditionsData[slot]?.endTime || ''}
                            InputLabelProps={{
                              shrink: true,
                            }}
                            disabled
                            fullWidth
                          />
                        </Grid>
                      </Grid>
                      <CenteredTextField
                        label="Expected Duration *"
                        variant="outlined"
                        value={workingConditionsData[slot]?.expectedDuration || ''}
                        onInput={(e) => handleInputChange(slot, 'expectedDuration', e.target.value)}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">minutes</InputAdornment>,
                          inputProps: { min: 0 }
                        }}
                      />
                      <CenteredTextField
                        label="Expected Material Cost*"
                        variant="outlined"
                        value={workingConditionsData[slot]?.expectedMaterialCost || ''}
                        onInput={(e) => handleInputChange(slot, 'expectedMaterialCost', e.target.value)}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">€</InputAdornment>,
                          inputProps: { min: 0 }
                        }}
                      />
                      <Box>
                        <Typography id="offer-modal-title" variant="h6" component="h2">
                          Expected Additional Cost Factors
                        </Typography>
                        <Typography variant="body1" color="textSecondary">
                          Please enter additional cost factors here. You can add as many as you want, but please consider that travel costs are automatically calculated. <br />
                          If you intend to handle them manually, please set the flat rate per kilometer in your profile to 0 and only then add it here.
                        </Typography>
                      </Box>
                      {workingConditionsData[slot]?.expectedAdditionalCostFactors?.map((factor, index) => (
                        <Grid container spacing={2} alignItems="center" key={index}>
                          <Grid item xs={6}>
                            <TextField
                              label="Description"
                              variant="outlined"
                              fullWidth
                              value={factor.description}
                              onChange={(e) => handleCostFactorChange(slot, index, 'description', e.target.value)}
                            />
                          </Grid>
                          <Grid item xs={4}>
                            <TextField
                              label="Price"
                              variant="outlined"
                              fullWidth
                              value={factor.price}
                              onInput={(e) => handleCostFactorChange(slot, index, 'price', e.target.value)}
                              InputProps={{
                                endAdornment: <InputAdornment position="end">€</InputAdornment>,
                                inputProps: { min: 0 }
                              }}
                            />
                          </Grid>
                          <Grid item xs={2} container justifyContent="center">
                            <IconButton onClick={() => handleRemoveCostFactor(slot, index)} color="error">
                              <DeleteIcon />
                            </IconButton>
                          </Grid>
                        </Grid>
                      ))}
                      <Button variant="outlined" color="primary" startIcon={<AddIcon />} onClick={() => handleAddCostFactor(slot)}>
                        Add Cost Factor
                      </Button>

                      <Box>
                        <Typography id="offer-modal-title" variant="h6" component="h2">
                          Special Conditions
                        </Typography>
                        <Typography variant="body1" color="textSecondary">
                          Here you can specify special conditions for this timeslot.
                        </Typography>
                      </Box>
                      <CenteredTextField
                        label="Important Information for specifically this appointment"
                        variant="outlined"
                        multiline
                        rows={4}
                        value={workingConditionsData[slot]?.specialConditions || ''}
                        onChange={(e) => handleInputChange(slot, 'specialConditions', e.target.value)}
                      />

                      <Box display="flex" justifyContent="space-between" mt={2}>
                        <Button variant="outlined" color="secondary" onClick={handleBack} startIcon={<ArrowBackIcon />}>
                          Back
                        </Button>
                        {slotIndex < selectedSlots.length - 1 ? (
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={handleNext}
                            endIcon={<ArrowForwardIcon />}
                            disabled={isNextDisabled}
                          >
                            Next
                          </Button>
                        ) : (
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={handleNext}
                            endIcon={<ArrowForwardIcon />}
                            disabled={isNextDisabled}
                          >
                            Further Information
                          </Button>
                        )}
                      </Box>
                    </>
                  )}
                </React.Fragment>
              ))}
              {step === selectedSlots.length + 1 && (
                <>
                  <Box>
                    <Typography id="offer-modal-title" variant="h6" component="h2">
                      Further information
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                      Send a personal message to the receiver.
                    </Typography>
                  </Box>
                  <TextField
                    label="Special Conditions"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={2}
                    value={serviceOfferData.specials}
                    onChange={(e) => handleServiceOfferData('specials', e.target.value)}
                  />
                  <TextField
                    label="Message"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={4}
                    value={serviceOfferData.message}
                    onChange={(e) => handleServiceOfferData('message', e.target.value)}
                  />
                  <Box display="flex" justifyContent="space-between" mt={2}>
                    <Button variant="outlined" color="secondary" onClick={handleBack} startIcon={<ArrowBackIcon />}>
                      Back
                    </Button>
                    <Button variant="contained" color="primary" onClick={handleCreateOfferClick}>
                      Send Offer
                    </Button>
                  </Box>
                </>
              )}
            </>
          )}
        </ModalBox>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
        >
          <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </Modal>
  );
}

export default CreateServiceOfferModal;
