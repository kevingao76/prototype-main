import React, { useEffect, useState } from 'react';
import { Paper, Box, Typography, CircularProgress, Button, Tooltip, Container } from '@mui/material';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import { fetchLogIn } from "../AuthContext";
import Title from '../SupportComponents/Title';
import SnackbarMessage from '../SupportComponents/SnackbarMessage';
import CreateServiceOfferModal from './CreateOfferModal';
import DeclineRequestModal from './DeclineModal';
import {
  Send as SendIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  Build as BuildIcon,
  Payment as PaymentIcon,
  DoneAll as DoneAllIcon,
  Cancel as CancelIcon,
  SaveAs,
  EditNote,
  PendingActions
} from '@mui/icons-material';
import SortByButton from './SortByButton';
import FilterButton from './FilterButton';
import SummaryModal from '../Services/InquirySummaryModal';
import StartWorkModal from './LockInModal';
import FinishWorkModal from './JobCompletionModal';
import CancelModal from './CancelModal';
import OfferModal from './UpdateOfferModal';

const InquiryPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: 'white',
  color: 'black',
  position: 'relative',
}));

const Service = styled(Box)`
  display: flex;
  align-items: center;
`;

const ServiceImage = styled('img')`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  margin-right: 20px;
`;

const ServiceDetails = styled(Box)`
  flex-grow: 1;
`;

const ServiceStatus = styled(Box)`
  display: flex;
  align-items: center;
  margin-top: 10px;
`;

const ViewButton = styled(Button)`
  margin-right: 10px;
  padding: 10px 20px;
  border-radius: 4px;
  background-color: #ccc;
  color: black;
  &:hover {
    background-color: #b3b3b3;
  }
`;

const ActionButton = styled(Button)`
  margin-right: 10px;
  padding: 10px 20px;
  border-radius: 4px;
  background-color: #4CAF50;
  color: white;
  &:hover {
    background-color: #45a049;
  }
`;

const StatusIcons = styled(Box)`
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
`;

const CancelButton = styled(Button)`
  margin-right: 10px;
  padding: 10px 20px;
  border-radius: 4px;
  background-color: #FF0000;
  color: white;
  &:hover {
    background-color: #CC0000;
  }
`;

const statusIcons = {
  'Request Initiated': <SaveAs />,
  'Request Sent': <SendIcon />,
  'Offer Filled': <EditNote />,
  'Offer Sent': <PendingActions />,
  'Job Agreed': <AssignmentTurnedInIcon />,
  'Work in Progress': <BuildIcon />,
  'Payment Pending': <PaymentIcon />,
  'Completed': <DoneAllIcon />,
  'Cancelled': <CancelIcon />
};

const statusOptions = ['Request Initiated', 'Request Sent', 'Offer Filled', 'Offer Sent', 'Job Agreed', 'Work in Progress', 'Payment Pending', 'Completed', 'Cancelled'];

const InquiriesProvider = () => {
  const [inquiriesProvider, setInquiriesProvider] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [selectedSort, setSelectedSort] = useState('Most Recent');
  const [sortOrder, setSortOrder] = useState('Descending');
  const [selectedFilter, setSelectedFilter] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [receiverData, setReceiverData] = useState();
  const [isStartWorkModalOpen, setIsStartWorkModalOpen] = useState(false);
  const [isFinishWorkModalOpen, setIsFinishWorkModalOpen] = useState(false);
  const [isCancelModalOpen, setCancelModalOpen] = useState(false);
  const [kilometerConstant, setKilometerConstant] = useState(null);
  const [openCreateOffer, setOpenCreateOffer] = useState(false);
  const [openDeclineRequest, setOpenDeclineRequest] = useState(false);
  const [filteredOffers, setFilteredOffers] = useState([]);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState({});
  const [serviceOffers, setServiceOffers] = useState([]);
  const [serviceBookings, setServiceBookings] = useState([]);
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [profileImages, setProfileImages] = useState({});

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    const fetchKilometerConstant = async () => {
      try {
        const response = await fetchLogIn();
        const kilometerConstant = response.data.travelKilometerConstant;
        setKilometerConstant(kilometerConstant);
      } catch (error) {
        console.error('Error fetching travel kilometer constant:', error);
      }
    };

    fetchKilometerConstant();
  }, []);

  const fetchBookings = async () => {
    try {
      const logInResponse = await fetchLogIn();
      const serviceProviderId = logInResponse.data._id;
      setLoggedInUserId(serviceProviderId);

      const [inquiriesProviderResponse, offersResponse, bookingsResponse] = await Promise.all([
        axios.get('/serviceRequests/getAll'),
        axios.get('/serviceOffers/getAll'),
        axios.get('/serviceBookings/getAll')
      ]);

      const filteredOfferIds = offersResponse.data
        .filter(offer => offer.serviceRequest.serviceProvider === serviceProviderId);

      const inquiriesProvider = inquiriesProviderResponse.data;
      setServiceOffers(offersResponse.data);
      setServiceBookings(bookingsResponse.data);
      const userInquiriesProvider = inquiriesProvider.filter(inquiry => inquiry.serviceProvider._id === serviceProviderId);
      setInquiriesProvider(userInquiriesProvider);
      const receivers = userInquiriesProvider.map((inquiry) => inquiry.serviceReceiver);
      const relevantReceivers = removeDuplicates(receivers, 'profileImage');
      await fetchProfileImages(relevantReceivers);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfileImages = async (receivers) => {
    const profileImagesPromises = receivers.map(async (receiver) => {
      if (receiver.profileImage) {
        const profileImageId = receiver.profileImage;
        try {
          const response = await axios.get(`/files/get/${profileImageId}`, { responseType: 'blob' });
          const imageUrl = URL.createObjectURL(response.data);
          return { [receiver._id]: imageUrl };
        } catch (error) {
          console.error('Error fetching profile image:', error);
          return { [receiver._id]: null };
        }
      }
    });

    const profileImagesArray = await Promise.all(profileImagesPromises);
    const profileImagesObject = profileImagesArray.reduce((acc, curr) => ({ ...acc, ...curr }), {});
    setProfileImages(profileImagesObject);
  };

  const removeDuplicates = (array, attribute) => {
    const seen = new Set();
    return array.reduce((acc, item) => {
      const attrValue = item[attribute];
      if (!seen.has(attrValue)) {
        seen.add(attrValue);
        acc.push(item);
      }
      return acc;
    }, []);
  };

  const handleSortMenuClick = (event) => {
    setSortAnchorEl(event.currentTarget);
  };

  const handleFilterMenuClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterChange = (status) => {
    setSelectedFilter(prevFilters => {
      if (prevFilters.includes(status)) {
        return prevFilters.filter(f => f !== status);
      } else {
        return [...prevFilters, status];
      }
    });
  };

  const filterInquiriesProvider = (inquiriesProvider, filters) => {
    if (filters.length === 0) return inquiriesProvider;  // Return all inquiriesProvider if no filters are selected
    return inquiriesProvider.filter(inquiry => filters.includes(inquiry.serviceStatus));
  };

  const handleSortMenuClose = () => {
    setSortAnchorEl(null);
  };

  const handleFilterMenuClose = () => {
    setFilterAnchorEl(null);
  };

  const handleStartWorkConfirm = async (inquiryId) => {
    const selectedServiceBooking = serviceBookings.find(booking => booking.serviceOffer.serviceRequest._id === inquiryId);
    try {
      let res = {};
      try {
        res = await axios.put('/serviceBookings/setWorkInProgress', { serviceBookingId: selectedServiceBooking._id });
      } catch (error) {
        console.log('Error starting work:', error.response.data.message);
        handleSnackbar(String(error.response.data.message), 'error');
      }
      if (res.status === 200) {
        handleSnackbar('Work started successfully', 'success');
        fetchBookings();
      }
    } catch (error) {
      console.error('Error starting work:', error);
      handleSnackbar('Unknown error when starting work', 'error');
    }
    setSelectedInquiry(null);
    setIsStartWorkModalOpen(false);
  };

  const handleStartWorkClose = () => {
    setSelectedInquiry(null);
    setIsStartWorkModalOpen(false);
  };

  const handleConfirmCancel = () => {
    setCancelModalOpen(false);
  };

  const handleCancelClose = () => {
    setCancelModalOpen(false);
  };

  const handleFinishWorkClick = (inquiry) => {
    console.log(`reached handleFinishWorkClick with inquiryId: ${JSON.stringify(inquiry)}`);
    setSelectedInquiry(inquiry);
    setIsFinishWorkModalOpen(true);
  };
  const handleFinishWorkClose = () => {
    setSelectedInquiry(null);
    setIsFinishWorkModalOpen(false);
  };

  const handleSortOrderChange = () => {
    setSortOrder((prevOrder) => (prevOrder === 'Ascending' ? 'Descending' : 'Ascending'));
  };

  const handleFinishWorkConfirm = () => {
    console.log(`reached handleFinishWorkConfirm with inquiryId: ${selectedInquiry}`);
    finalizeBooking(selectedInquiry);
    setSelectedInquiry(null);
    setIsFinishWorkModalOpen(false);
  };

  const handleOpenCreateOffer = (inquiry) => {
    if (kilometerConstant && kilometerConstant > 0) {
      setSelectedInquiry(inquiry);
      setOpenCreateOffer(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleCloseCreateOffer = () => {
    setOpenCreateOffer(false);
    setSelectedInquiry(null);
    fetchBookings();
  };

  const handleOpenDeclineRequest = (inquiry) => {
    setSelectedInquiry(inquiry);
    setOpenDeclineRequest(true);
  };

  const handleCloseDeclineRequest = () => {
    setOpenDeclineRequest(false);
    setSelectedInquiry(null);
    fetchBookings();
  };

  const finalizeBooking = async (selectedInquiry) => {
    try {
      setLoading(true);
      const response = await axios.get(`serviceBookings/getBookingsByRequests/${[selectedInquiry._id]}`);
      const booking = response.data[0];

      if (!booking) {
        handleSnackbar('Your selection returned no booking. Something in the process must have failed.', 'error');
        setLoading(false);
        return;
      }

      await axios.put('/serviceBookings/finalize', { serviceBookingId: booking._id, finishedWithoutComplications: true });
      handleSnackbar('Booking finalized successfully', 'success');
    } catch (error) {
      handleSnackbar('Error finalizing booking', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleShowOffer = async (requestId) => {
    try {
      const offersResponse = await axios.get('/serviceOffers/getAll');
      const offer = offersResponse.data.find(offer => offer.serviceRequest._id === requestId);

      const responseReceiver = await axios.get(`serviceRequests/byid/${requestId}`);
      setReceiverData(responseReceiver.data);

      if (offer) {
        const response = await axios.get(`/serviceoffers/byid/${offer._id}`);
        setSelectedOffer(response.data);
        setIsOfferModalOpen(true);
      } else {
        console.error('Offer not found');
      }
    } catch (error) {
      console.error('Error fetching offer:', error);
    }
  };

  const openModal = (inquiry) => {
    let state = 'request';
    const selectedServiceBooking = serviceBookings.find(booking => booking.serviceOffer.serviceRequest._id === inquiry._id) ?? {};
    state = selectedServiceBooking ? 'booking' : state;
    const selectedServiceOffer = serviceOffers.find(offer => offer.serviceRequest._id === inquiry._id) ?? {};
    state = selectedServiceOffer ? 'booking' : state;
    const data = {
      preRequest: {},
      request: inquiry,
      offer: selectedServiceOffer,
      booking: selectedServiceBooking,
      currentState: inquiry.serviceStatus === undefined ? 'Pre Request' : inquiry.serviceStatus,
    };
    setModalData(data);
    setSelectedInquiry(inquiry);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedInquiry(null);
  };

  const handleSaveOffer = async (updatedOffer) => {
    try {
      await axios.put(`/serviceOffers/update/${updatedOffer._id}`, updatedOffer);
      setSelectedOffer(updatedOffer);
      setIsOfferModalOpen(false);
    } catch (error) {
      console.error('Error saving offer:', error);
    }
  };

  const checkStatus = async (inquiryId) => {
    const selectedServiceBooking = serviceBookings.find(booking => booking.serviceOffer.serviceRequest._id === inquiryId);
    const response = await axios.get(`/serviceBookings/checkInvoiceStatus/${selectedServiceBooking._id}`);
    if (response.data.status === 'paid') {
        handleSnackbar('Payment has been made', 'success');
    } else {
        handleSnackbar('Payment is still pending', 'info');
    }
  }

  const handleSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const renderButtonsBasedOnStatus = (inquiry) => {
    const status = inquiry.serviceStatus;
    const viewInquiryButton = <ViewButton onClick={() => openModal(inquiry)}>View Details</ViewButton>;
    const cancelButton = <CancelButton variant="outlined" color="error" onClick={() => handleOpenDeclineRequest(inquiry)}>Cancel</CancelButton>
    switch (status) {
      case 'Request Initiated':
        return;
      case 'Request Sent':
        return (
          <>
            {viewInquiryButton}
            <ActionButton onClick={() => handleOpenCreateOffer(inquiry)} disabled={!kilometerConstant || kilometerConstant === 0}>Create Offer</ActionButton>
            {cancelButton}
          </>
        );
      case 'Offer Filled':
        return (
          <>
            {viewInquiryButton}
            <ActionButton onClick={() => handleShowOffer(inquiry._id)}>Edit Offer</ActionButton>
            {cancelButton}
          </>
        );
      case 'Offer Sent':
        return (
          <>
            {viewInquiryButton}
            <ActionButton onClick={() => handleShowOffer(inquiry._id)}>Edit Offer</ActionButton>
            {cancelButton}
          </>
        );
      case 'Job Agreed':
        return (
          <>
            {viewInquiryButton}
            <ActionButton onClick={() => handleStartWorkConfirm(inquiry._id)}>Lock In Appointment</ActionButton>
            <ActionButton onClick={() => handleFinishWorkClick(inquiry)}>Confirm Job Completion</ActionButton>
            <ActionButton onClick={() => handleShowOffer(inquiry._id)}>Adjust Offer</ActionButton>
            {cancelButton}
          </>
        );
      case 'Work in Progress':
        return (
          <>
            {viewInquiryButton}
            <ActionButton onClick={() => handleFinishWorkClick(inquiry)}>Confirm Job Completion</ActionButton>
            {cancelButton}
          </>
        );
      case 'Payment Pending':
        return (
          <>
            {viewInquiryButton}
            <ActionButton onClick={() => checkStatus(inquiry._id)}>Check Payment Status</ActionButton>
          </>
        );
      case 'Completed':
        return (
          <>
            {viewInquiryButton}
          </>
        );
      case 'Cancelled':
        return (
          <>
            {viewInquiryButton}
          </>
        );
      default:
        return null;
    }
  };

  const getStatusIconColor = (status, currentStatus) => {
    if (currentStatus === 'Cancelled') {
      return status === 'Cancelled' ? 'red' : 'grey';
    }

    const statusOrder = [
      'Request Initiated',
      'Request Sent',
      'Offer Filled',
      'Offer Sent',
      'Job Agreed',
      'Work in Progress',
      'Payment Pending',
      'Completed',
      'Cancelled'
    ];

    const currentStatusIndex = statusOrder.indexOf(currentStatus);
    const statusIndex = statusOrder.indexOf(status);

    if (statusIndex <= currentStatusIndex) {
      return 'green';
    }

    return 'grey';
  };

  const sortInquiriesProvider = (inquiriesProvider, sort, order) => {
    const sorted = [...inquiriesProvider];
    const statusOrder = statusOptions;
    if (sort === 'Most Recent') {
      sorted.sort((a, b) => new Date(b.timestampIssued) - new Date(a.timestampIssued));
    } else if (sort === 'Status') {
      sorted.sort((a, b) => statusOrder.indexOf(a.serviceStatus) - statusOrder.indexOf(b.serviceStatus));
    }
    return order === 'Descending' ? sorted.reverse() : sorted;
  };

  const filteredInquiriesProvider = filterInquiriesProvider(inquiriesProvider, selectedFilter);
  const sortedInquiriesProvider = sortInquiriesProvider(filteredInquiriesProvider, selectedSort, sortOrder);

  return (
    <Box sx={{ backgroundColor: '#f6f6f6', px: 5, py: 5 }}>
      <Container>
        <Box textAlign="center">
          <Title text="Your Inquiries" textAlign="center" />
        </Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ py: 2 }}>
          <SortByButton
            selectedSort={selectedSort}
            sortOrder={sortOrder}
            sortAnchorEl={sortAnchorEl}
            handleSortMenuClick={handleSortMenuClick}
            handleSortMenuClose={handleSortMenuClose}
            handleSortOrderChange={handleSortOrderChange}
          />
          <FilterButton
            filterAnchorEl={filterAnchorEl}
            handleFilterMenuClick={handleFilterMenuClick}
            handleFilterMenuClose={handleFilterMenuClose}
            statusOptions={statusOptions}
            selectedFilter={selectedFilter}
            handleFilterChange={handleFilterChange}
          />
        </Box>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center">
            <CircularProgress />
          </Box>
        ) : (
          sortedInquiriesProvider.length === 0 ? (
            <Typography variant="h6" align="center" color="textSecondary">
              There currently are no Inquiries
            </Typography>
          ) : (
            sortedInquiriesProvider.map((inquiry) => (
              <InquiryPaper key={inquiry._id}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" width="100%">
                  <Box flex={1}>
                    <Service>
                      <ServiceImage src={profileImages[inquiry.serviceReceiver._id]} alt={inquiry.serviceReceiver.lastName} />
                      <ServiceDetails>
                        <Typography variant="h6">{inquiry.serviceReceiver.lastName}</Typography>
                        <Typography variant="body2">Current Status: {inquiry.serviceStatus}</Typography>
                        <ServiceStatus>
                          {renderButtonsBasedOnStatus(inquiry)}
                        </ServiceStatus>
                        <StatusIcons>
                          {Object.keys(statusIcons).map((key) => (
                            <Tooltip key={key} title={key} arrow>
                              <Box
                                style={{ color: getStatusIconColor(key, inquiry.serviceStatus), position: 'relative' }}
                              >
                                {statusIcons[key]}
                              </Box>
                            </Tooltip>
                          ))}
                        </StatusIcons>
                      </ServiceDetails>
                    </Service>
                  </Box>
                </Box>
              </InquiryPaper>
            ))
          )
        )}
        <OfferModal
          open={isOfferModalOpen}
          handleClose={() => setIsOfferModalOpen(false)}
          offer={selectedOffer}
          handleSave={handleSaveOffer}
          receiverData={receiverData}
        />
        <StartWorkModal
          open={isStartWorkModalOpen}
          handleClose={handleStartWorkClose}
          handleConfirm={handleStartWorkConfirm}
        />
        <FinishWorkModal
          open={isFinishWorkModalOpen}
          handleClose={handleFinishWorkClose}
          handleConfirm={handleFinishWorkConfirm}
        />
        <CancelModal
          open={isCancelModalOpen}
          handleClose={handleCancelClose}
          handleConfirm={handleConfirmCancel}
        />
        {selectedInquiry && (
          <SummaryModal
            open={modalOpen}
            handleClose={closeModal}
            data={modalData}
          />
        )}
      </Container>
      <CreateServiceOfferModal open={openCreateOffer} handleClose={handleCloseCreateOffer} inquiry={selectedInquiry} offers={filteredOffers} handleSnackbar={handleSnackbar} />
      <DeclineRequestModal open={openDeclineRequest} handleClose={handleCloseDeclineRequest} inquiry={selectedInquiry} handleSnackbar={handleSnackbar} />
      <SnackbarMessage
        open={snackbarOpen}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        severity={snackbarSeverity}
      />
    </Box>
  );
};

export default InquiriesProvider;
