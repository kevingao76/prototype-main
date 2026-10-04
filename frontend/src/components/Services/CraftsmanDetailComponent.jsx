import React, {useEffect, useState} from 'react';
import {useNavigate, useParams, useLocation} from 'react-router-dom';
import {
  Box, Typography, Button, ToggleButton, ToggleButtonGroup, TextField, IconButton, CircularProgress, Autocomplete
} from '@mui/material';
import styled from '@emotion/styled';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {registerLocale} from 'react-datepicker';
import enGB from 'date-fns/locale/en-GB';
import {format} from "date-fns";
import {fetchLogIn} from "../AuthContext";
import SummaryModal from "./InquirySummaryModal";
import axios from "axios";
import SnackbarMessage from '../SupportComponents/SnackbarMessage';
import {parseAddress, handleStringFromAddress} from '../../utils/addressUtils';

registerLocale('en-GB', enGB);

const Container = styled(Box)`
  background-color: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  max-width: 1000px;
  margin: auto;
`;

const Section = styled(Box)`
  margin-bottom: 20px;
`;

const DateContainer = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 250px;
  margin-top: 4px;
`;

const CraftsmanCard = styled(Box)`
  display: flex;
  align-items: center;
  padding: 20px;
  border: 1px solid #d3d3d3;
  border-radius: 8px;
  margin-bottom: 20px;
  background-color: #f5f5f5;
`;

const CraftsmanImage = styled.img`
  border-radius: 50%;
  width: 80px;
  height: 80px;
  object-fit: cover;
  margin-right: 20px;
`;

const CraftsmanInfo = styled(Box)`
  flex: 1;
`;

const ContactButton = styled(Button)`
  background-color: #FF6F00;
  color: white;

  &:hover {
    background-color: #FF8F00;
  }
`;

const Title = styled(Typography)`
  color: #FF6F00;
`;

/**
 * DateSelectionSection Component
 *
 * This component allows users to select up to three preferred dates, ensuring no duplicate dates are selected and preventing selection of Sundays.
 * It displays the selected dates and allows for their removal.
 *
 * @param {Array} selectedDates - Array of currently selected dates.
 * @param {Function} setSelectedDates - Function to update the selected dates.
 * @param {Function} setErrorMessage - Function to set error messages.
 */
const DateSelectionSection = ({selectedDates, setSelectedDates, setErrorMessage}) => {

  const isSameDay = (date1, date2) => {
    return (date1.getDate() === date2.getDate() && date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear());
  };

  const handleDateChange = (date) => {
    if (selectedDates.some(selectedDate => isSameDay(selectedDate, date))) {
      setErrorMessage('You cannot select the same date twice.');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    if (selectedDates.length < 3) {
      const newDates = [...selectedDates, date].sort((a, b) => a - b);
      setSelectedDates(newDates);
      setErrorMessage('');
    } else {
      setErrorMessage('You can only select up to three dates.');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const handleRemoveDate = (dateToRemove) => {
    const newDates = selectedDates.filter(date => !isSameDay(date, dateToRemove)).sort((a, b) => a - b);
    setSelectedDates(newDates);
  };

  const filterDates = (date) => {
    const day = date.getDay();
    return day !== 0; // Disallow Sunday (0)
  };

  return (<Section>
    <Typography variant="h6">Choose preferred dates</Typography>
    <DatePicker
      inline
      minDate={new Date()}
      selected={null}
      onChange={handleDateChange}
      filterDate={filterDates}
      locale="en-GB"
      calendarStartDay={1} // Monday as the first day of the week
    />

    <Box mt={2}>
      <Typography variant="h6">Selected Dates:</Typography>
      {selectedDates.length === 0 ? (<Typography variant="body2" color="textSecondary">You have to choose at least one
        date</Typography>) : (selectedDates.map((date, index) => (<DateContainer key={index}>
        <Typography>{date.toDateString()}</Typography>
        <IconButton onClick={() => handleRemoveDate(date)} size="small">
          <DeleteIcon fontSize="small"/>
        </IconButton>
      </DateContainer>)))}
    </Box>
  </Section>);
};

const CraftsmanDetailComponent = () => {
  const {id} = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const {selectedSubService, input, title, address} = location.state || {};
  const [craftsman, setCraftsman] = useState(null);
  const [serviceReceiver, setServiceReceiver] = useState(null);
  const [selectedDates, setSelectedDates] = useState([]);
  const [viewingAppointment, setViewingAppointment] = useState('no');
  const [description, setDescription] = useState('');
  const [open, setOpen] = useState(false);
  const [serviceRequestId, setServiceRequestId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [modalData, setModalData] = useState(null);

  useEffect(() => {

    /**
     * fetchCraftsman - Fetches the details of a specific craftsman by their ID and sets the state with the fetched data.
     *
     * This function makes an API request to retrieve the craftsman's data, including their profile image.
     * If the profile image exists, it fetches the image, finally, it updates the state with the complete craftsman data.
     */
    const fetchCraftsman = async () => {
      try {
        const response = await axios.get(`/serviceProviders/byId/${id}`);
        const craftsmanData = response.data;

        console.log("address", address);

        if (craftsmanData.profileImage) {
          const imageResponse = await axios.get(`/files/get/${craftsmanData.profileImage}`, {responseType: 'blob'});
          const imageObjectURL = URL.createObjectURL(imageResponse.data);
          craftsmanData.profilePicture = imageObjectURL;
        }

        setCraftsman(craftsmanData);
      } catch (error) {
        console.error('Error fetching craftsman details:', error);
      }
    };

    //Fetches the profile data of the logged-in service receiver and updates the state with the fetched data.
    const fetchProfile = async () => {
      try {
        const response = await fetchLogIn();
        const receiver = response.data;

        setServiceReceiver(receiver);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchCraftsman();
    fetchProfile();
  }, [id]);

  if (!craftsman) {
    return (<Box display="flex" justifyContent="center" alignItems="center" minHeight="75vh">
      <CircularProgress/>
    </Box>);
  }

  /**
   * validateInputs - Validates the user inputs for the inquiry form.
   *
   * This function checks if the necessary fields are filled out correctly before allowing the inquiry to be sent.
   * It validates if at least one date is selected and if the description is provided.
   */
  const validateInputs = () => {
    let valid = true;
    let errorMessages = [];

    if (selectedDates.length === 0) {
      errorMessages.push('Please select at least one date before sending the inquiry.');
      valid = false;
    }

    if (!description.trim()) {
      errorMessages.push('Description is required.');
      valid = false;
    }

    setErrorMessage(errorMessages.join(' '));
    return valid;
  };

  //handleOpen - Prepares and sets data for opening a modal.
  const handleOpen = () => {
    const data = {
      preRequest: {
        title: title,
        selectedSubService: selectedSubService,
        description,
        location: address,
        viewingAppointment,
        selectedDates,
        input: input,
      }, request: {}, offer: {}, booking: {}, currentState: 'Pre Request',
    };
    console.log('data:', data);
    setModalData(data);
    setOpen(true);
  };

  //Handle modal close
  const handleClose = () => setOpen(false);

  //Saves the specifid inquiry to the your inquiries page
  const handleSaveInquiry = async () => {
    if (!validateInputs()) return;

    try {
      const response = await createServiceRequest(id, selectedDates, selectedSubService, viewingAppointment, serviceReceiver, description, address, input);
      setServiceRequestId(response.data._id);
      console.log('Service request created:', response.data);
      setSuccessMessage('Inquiry saved successfully.');
      navigate('/serviceReceiver/yourInquiries');
    } catch (error) {
      console.error('Error creating service request:', error);
      setErrorMessage(`Failed to save inquiry because of ${error.message}`);
    }
  };

  //Sends the specifid inquiry to the chosen craftsmen for this job
  const handleSendInquiry = async () => {
    if (!validateInputs()) return;

    try {
      const createResponse = await createServiceRequest(id, selectedDates, selectedSubService, viewingAppointment, serviceReceiver, description, address, input);

      console.log('Service request created:', createResponse.data);

      const serviceRequestId = createResponse.data._id;

      const finalizeResponse = await axios.post('/serviceRequests/finalize', {
        serviceRequestId,
      });

      console.log('Service request finalized:', finalizeResponse.data);
      setSuccessMessage('Inquiry sent successfully.');
      navigate('/serviceReceiver/yourInquiries');
    } catch (error) {
      console.error('Error finalizing service request:', error);
      setErrorMessage('Failed to send inquiry.');
    }
  };


  return (<Container sx={{minHeight: '78vh'}}>
    <Button onClick={() => navigate(-1)} startIcon={<ArrowBackIcon/>} style={{marginBottom: '20px'}}>
      Back
    </Button>
    <CraftsmanCard>
      <CraftsmanImage src={craftsman.profilePicture} alt={craftsman.companyName}/>
      <CraftsmanInfo>
        <Typography variant="h6">{craftsman.companyName}</Typography>
        <Typography variant="body2" color="textSecondary">{craftsman.description}</Typography>
        <Typography variant="body2" color="textSecondary">
          {handleStringFromAddress(craftsman.address)}
        </Typography>
      </CraftsmanInfo>
    </CraftsmanCard>
    <Section>
      <Title variant="h6">Inquiry:</Title>
      <Box display="flex" justifyContent="space-between">
        <Box>
          <Typography variant="body1">
            Category of Service: {selectedSubService}
            <br/> Specifications: {String(Object.entries(input).map(([, value]) => `${value}`).join(', ')) === '' ? 'Not specified' : String(Object.entries(input).map(([, value]) => `${value}`).join(', '))}
          </Typography>
        </Box>
      </Box>
    </Section>
    <Section>
      <Title variant="h6">Do you want a viewing appointment prior to starting the job?</Title>
      <ToggleButtonGroup
        value={viewingAppointment}
        exclusive
        onChange={(event, newValue) => setViewingAppointment(newValue)}
      >
        <ToggleButton value="yes">Yes</ToggleButton>
        <ToggleButton value="no">No</ToggleButton>
      </ToggleButtonGroup>
    </Section>
    <Section>
      <TextField
        id="filled-multiline-static"
        label="Description"
        placeholder="Please specify your inquiry e.g. descriptions of the task, materials, etc."
        multiline
        rows={5}
        variant="filled"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        error={!!errorMessage && errorMessage.includes('Description')}
        helperText={errorMessage.includes('Description') ? errorMessage : ''}
        InputLabelProps={{
          shrink: true, style: {
            backgroundColor: 'white', padding: '0 4px', transform: 'translate(14px, -6px) scale(0.75)',
          },
        }}
        sx={{
          width: '100%',
          marginTop: 2,
          backgroundColor: 'white',
          border: '1px solid #d3d3d3',
          borderRadius: '4px',
          '& .MuiFilledInput-root': {
            backgroundColor: 'white', padding: '27px 12px 10px', boxSizing: 'border-box',
          },
          '& .MuiInputLabel-root': {
            backgroundColor: 'white',
            padding: '0 4px',
            transform: 'translate(14px, -6px) scale(0.75)',
            pointerEvents: 'none',
          },
          '& .MuiFilledInput-underline:before': {
            borderBottom: 'none',
          },
          '& .MuiFilledInput-underline:after': {
            borderBottom: 'none',
          },
          '& .MuiFilledInput-underline:hover:before': {
            borderBottom: 'none',
          },
        }}
      />
    </Section>
    <DateSelectionSection selectedDates={selectedDates} setSelectedDates={setSelectedDates}
                          setErrorMessage={setErrorMessage}/>
    <ContactButton variant="contained" onClick={handleOpen}>View Inquiry</ContactButton>

    <SummaryModal
      open={open}
      handleClose={handleClose}
      data={modalData}
      handleSendInquiry={handleSaveInquiry}
      handleFinalizeInquiry={handleSendInquiry}
    />
    <SnackbarMessage
      open={!!successMessage}
      onClose={() => setSuccessMessage('')}
      message={successMessage}
      severity="success"
    />
    <SnackbarMessage
      open={!!errorMessage}
      onClose={() => setErrorMessage('')}
      message={errorMessage}
      severity="error"
    />
  </Container>);
};

export default CraftsmanDetailComponent;

async function createServiceRequest(id, selectedDates, selectedSubService, viewingAppointment, serviceReceiver, description, address, input) {
  const serviceProviderId = id;
  const dateOptions = selectedDates.map(date => format(date, "dd MMM yyyy HH:mm:ss 'GMT'"));
  const subServiceType = selectedSubService;
  const agreesToInspectionAppointmentIfNeeded = viewingAppointment === "yes";
  console.log('address:', address);
  const newAddress = parseAddress(address, {});
  const cleanInput = Object.entries(input).map(([key, value]) => (' ' + value));
  const newDescription = description + ' --- Specifications given: ' + cleanInput;

  const createResponse = await axios.post('/serviceRequests/create', {
    serviceReceiverId: serviceReceiver._id,
    serviceProviderId,
    dateOptions,
    subServiceType,
    description: newDescription,
    location: newAddress,
    agreesToInspectionAppointmentIfNeeded
  });
  return createResponse;
}
