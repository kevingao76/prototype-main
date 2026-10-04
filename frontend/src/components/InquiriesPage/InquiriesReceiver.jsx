import React, {useEffect, useState} from 'react';
import {Paper, Box, Typography, Button, CircularProgress, Tooltip, Container} from '@mui/material';
import {styled} from '@mui/material/styles';
import {
  Send as SendIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  Build as BuildIcon,
  Payment as PaymentIcon,
  DoneAll as DoneAllIcon,
  Cancel as CancelIcon,
  EditNote,
  PendingActions,
  SaveAs,
} from '@mui/icons-material';
import axios from 'axios';
import SummaryModal from '../Services/InquirySummaryModal';
import {fetchLogIn} from '../AuthContext';
import ReviewModal from "./CreateRatingModal";
import SnackbarMessage from '../SupportComponents/SnackbarMessage';
import Title from '../SupportComponents/Title';
import SortByButton from './SortByButton';
import FilterButton from './FilterButton';
import {useNavigate} from "react-router-dom";
import CancelModal from './CancelModal';
import DeclineRequestModal from './DeclineModal';

const InquiryPaper = styled(Paper)(({theme}) => ({
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
  'Request Initiated': <SaveAs/>,
  'Request Sent': <SendIcon/>,
  'Offer Filled': <EditNote/>,
  'Offer Sent': <PendingActions/>,
  'Job Agreed': <AssignmentTurnedInIcon/>,
  'Work in Progress': <BuildIcon/>,
  'Payment Pending': <PaymentIcon/>,
  'Completed': <DoneAllIcon/>,
  'Cancelled': <CancelIcon/>
};

const statusOptions = ['Request Initiated', 'Request Sent', 'Offer Filled', 'Offer Sent', 'Job Agreed', 'Work in Progress', 'Payment Pending', 'Completed', 'Cancelled'];

const Inquiries = () => {
  const [userInquiries, setUserInquiries] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [selectedSort, setSelectedSort] = useState('Most Recent');
  const [sortOrder, setSortOrder] = useState('Descending');
  const [selectedFilter, setSelectedFilter] = useState([]);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [serviceOffers, setServiceOffers] = useState([]);
  const [serviceBookings, setServiceBookings] = useState([]);
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [profileImages, setProfileImages] = useState({});
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [isCancelModalOpen, setCancelModalOpen] = useState(false);
  const [openDeclineRequest, setOpenDeclineRequest] = useState(false);

  useEffect(() => {
    fetchInquiries();
  }, []);

  /**
     * Fetches inquiries, offers, and bookings for the logged-in user.
     *
     * It retrieves the logged-in user's information using `fetchLogIn` and extracts the user ID.
     * Using this ID, it makes parallel requests to fetch all service requests (inquiries),
     * service offers, and service bookings. After fetching the data, it filters the inquiries
     * to only include those made by the logged-in user. It sets the state with the filtered
     * inquiries, service offers, and service bookings. Additionally, it fetches profile images
     * for the relevant service providers associated with the user's inquiries.
     *
     * @async
     * @function fetchInquiries
     * @returns {Promise<void>} Resolves when data fetching and state updates are complete.
     * @throws Will log an error message to the console if fetching data fails.
     */
  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const loginResponse = await fetchLogIn();
      const receiverId = loginResponse.data._id;
      setLoggedInUserId(receiverId);

      const [inquiriesResponse, offersResponse, bookingsResponse] = await Promise.all([axios.get('/serviceRequests/getAll'), axios.get('/serviceOffers/getAll'), axios.get('/serviceBookings/getAll')]);
      const inquiries = inquiriesResponse.data;
      setServiceOffers(offersResponse.data);
      setServiceBookings(bookingsResponse.data);

      const userInquiries = inquiries.filter(inquiry => inquiry.serviceReceiver._id === receiverId);
      setUserInquiries(userInquiries);
      const providers = userInquiries.map((inquiry) => inquiry.serviceProvider);
      const relevantProviders = removeDuplicates(providers, 'profileImage');
      await fetchProfileImages(relevantProviders);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetches profile images for a list of service providers.
   *
   * This function takes an array of service providers and attempts to fetch
   * their profile images using their profile image IDs. It returns an array of objects where
   * each object maps a provider ID to the corresponding image URL.
   *
   * @async
   * @function fetchProfileImages
   * @param {Array} providers - The list of service providers to fetch profile images for.
   * @returns {Promise<Array<Object>>} A promise that resolves to an array of objects mapping provider IDs to image URLs.
   * @throws Will log an error message to the console if fetching a profile image fails.
   */
  const fetchProfileImages = async (providers) => {
    const profileImagesPromises = providers.map(async (provider) => {
      const profileImageId = provider.profileImage;
      try {
        const response = await axios.get(`/files/get/${profileImageId}`, {responseType: 'blob'});
        const imageUrl = URL.createObjectURL(response.data);
        return {[provider._id]: imageUrl};
      } catch (error) {
        console.error('Error fetching profile image:', error);
        return {[provider._id]: null};
      }
    });

    const profileImagesArray = await Promise.all(profileImagesPromises);
    const profileImagesObject = profileImagesArray.reduce((acc, curr) => ({...acc, ...curr}), {});
    setProfileImages(profileImagesObject);
  };

  /**
   * Removes duplicate objects from an array based on a specified attribute.
   * It returns a new array that contains only the first occurrence of each unique attribute value.
   *
   * @function removeDuplicates
   * @param {Array} array - The array of objects to remove duplicates from.
   * @param {string} attribute - The attribute to check for duplicates.
   * @returns {Array} A new array with duplicates removed.
   */
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

  //Snackbar closing
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  //Snackbar opening
  const handleSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  //Handle click event for opening the sort menu
  const handleSortMenuClick = (event) => {
    setSortAnchorEl(event.currentTarget);
  };

  //Apply sorting after close
  const handleSortMenuClose = (option) => {
    if (option) {
      setSelectedSort(option);
    }
    setSortAnchorEl(null);
  };

  //Handle the change of the sort order
  const handleSortOrderChange = () => {
    setSortOrder((prevOrder) => (prevOrder === 'Ascending' ? 'Descending' : 'Ascending'));
  };

  //Handle filter click opening
  const handleFilterMenuClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  //handle closing of filter
  const handleFilterMenuClose = () => {
    setFilterAnchorEl(null);
  };

  //Handles the update of a selected filter state by adding or removing a specific status.
  const handleFilterChange = (status) => {
    setSelectedFilter(prevFilters => {
      if (prevFilters.includes(status)) {
        return prevFilters.filter(f => f !== status);
      } else {
        return [...prevFilters, status];
      }
    });
  };

  //opens a little provider detail view
  const handleCompanyNameClick = (id) => {
    navigate(`/viewProfile/${id}`);
  };

  //Searches for possible analytics values for the available bookings. Function returns true if it found one otherwise false
  const checkIfInquiryHasAnalytics = (inquiry) => {
    const serviceBooking = serviceBookings.find(booking => booking.serviceOffer.serviceRequest._id === inquiry._id);
    return serviceBooking && serviceBooking.analytics;
  };

  /**
   * Sorts the given inquiries array according to the specified sort criteria
   * ('Most Recent' or 'Status') and order ('Ascending' or 'Descending'). It returns a new array
   * of sorted inquiries.
   *
   * @param {Array} inquiries - The array of inquiries to sort.
   * @param {string} sort - The criteria to sort by ('Most Recent' or 'Status').
   * @param {string} order - The order to sort in ('Ascending' or 'Descending').
   * @returns {Array} A new array of sorted inquiries.
   */
  const sortInquiries = (inquiries, sort, order) => {
    const sorted = [...inquiries];
    const statusOrder = statusOptions;

    if (sort === 'Most Recent') {
      sorted.sort((a, b) => new Date(b.timestampIssued) - new Date(a.timestampIssued));
    } else if (sort === 'Status') {
      sorted.sort((a, b) => statusOrder.indexOf(a.serviceStatus) - statusOrder.indexOf(b.serviceStatus));
    }

    return order === 'Descending' ? sorted.reverse() : sorted;
  };

  //Filters all inquiries based on the selected filter, if no selected filter it returns all inquiries.
  const filterInquiries = (inquiries, filters) => {
    if (filters.length === 0) return inquiries;
    return inquiries.filter(inquiry => filters.includes(inquiry.serviceStatus));
  };

  //Opens "view inquiry" modal with detailed information about the selected inquiry
  const openModal = (inquiry) => {
    const selectedServiceBooking = serviceBookings.find(booking => booking.serviceOffer.serviceRequest._id === inquiry._id) ?? {};
    const selectedServiceOffer = serviceOffers.find(offer => offer.serviceRequest._id === inquiry._id) ?? {};
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

  //Closes "view inquiry" modal
  const closeModal = () => {
    setModalOpen(false);
    setSelectedInquiry(null);
  };

  //Opens review modal for rating submission
  const openReviewModal = (inquiry) => {
    setSelectedInquiry(inquiry);
    setReviewModalOpen(true);
  };

  //Closes review modal
  const closeReviewModal = () => {
    handleSnackbar('Review submitted successfully', 'success');
    setReviewModalOpen(false);
    setSelectedInquiry(null);
  };

  /**
   * This function finds the related service booking for the given inquiry ID,
   * retrieves the document ID for the invoice, and fetches the PDF file. It
   * then creates a temporary link element to facilitate the download of the
   * PDF file.
   *
   * @param {string} inquiryId - The ID of the inquiry.
   * @returns {Promise<void>} A promise that resolves when the PDF has been downloaded.
   */
  const downloadPdf = async (inquiryId) => {
    const selectedServiceBooking = serviceBookings.find(booking => booking.serviceOffer.serviceRequest._id === inquiryId);
    const documentId = selectedServiceBooking.payment.bill;
    const response = await axios.get(`/files/get/${documentId}`, {responseType: 'blob'});
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'invoice.pdf');
    document.body.appendChild(link);
    link.click();
  };

  //This function leads based on the selected inquiry to the payment window
  const handleLink = async (inquiryId, type) => {
    const selectedServiceBooking = serviceBookings.find(booking => booking.serviceOffer.serviceRequest._id === inquiryId);
    const url = selectedServiceBooking.payment[`${type}`];
    window.open(url, '_blank');
  }

  const handleOpenDeclineRequest = (inquiry) => {
    setSelectedInquiry(inquiry);
    setOpenDeclineRequest(true);
  };

  const handleCloseDeclineRequest = () => {
    setOpenDeclineRequest(false);
    setSelectedInquiry(null);
    fetchInquiries();
  };

  //Checks for payment status if payment is still open or already paid
  const checkStatus = async (inquiryId) => {
    const selectedServiceBooking = serviceBookings.find(booking => booking.serviceOffer.serviceRequest._id === inquiryId);
    const response = await axios.get(`/serviceBookings/checkInvoiceStatus/${selectedServiceBooking._id}`);
    if (response.data.status == 'paid') {
      handleSnackbar('Payment has been received', 'success');
    } else {
      handleSnackbar('Payment is still pending', 'info');
    }
  }

  //Finally sends out inquiries which were first saved by a service receiver
  const handleSendSavedInquiry = async (serviceRequestId) => {
    try {
      const response = await axios.post('/serviceRequests/finalize', {
        serviceRequestId,
      });
      console.log('Service request finalized:', response.data);
      closeModal();
    } catch (error) {
      console.error('Error finalizing service request:', error);
    }
  };

  /**
   * This function returns a set of buttons appropriate for the given inquiry's status.
   * Each status has a predefined set of buttons, including actions such as viewing the inquiry,
   * sending the inquiry, canceling the inquiry, accepting offers, downloading invoices, paying,
   * checking payment status, downloading receipts, and leaving reviews.
   *
   * @returns A set of buttons corresponding to the inquiry's status.
   */
  const renderButtonsBasedOnStatus = (inquiry) => {
    const status = inquiry.serviceStatus;
    const viewInquiryButton = <ViewButton onClick={() => openModal(inquiry)}>View Inquiry</ViewButton>;
    const buttons = {
      'Request Initiated': (<>
          {viewInquiryButton}
          <ActionButton onClick={() => handleSendSavedInquiry(inquiry._id)}>Send Saved Inquiry</ActionButton>
          <CancelButton onClick={() => handleOpenDeclineRequest(inquiry)}>Cancel Inquiry</CancelButton>
        </>),
      'Request Sent': (<>
          {viewInquiryButton}
          <CancelButton onClick={() => handleOpenDeclineRequest(inquiry)}>Cancel Inquiry</CancelButton>
        </>),
      'Offer Filled': (<>
          {viewInquiryButton}
          <CancelButton onClick={() => handleOpenDeclineRequest(inquiry)}>Cancel Inquiry</CancelButton>
        </>),
      'Offer Sent': (<>
          {viewInquiryButton}
          <ActionButton onClick={() => handleAcceptOffer(inquiry._id)}>Accept Offer</ActionButton>
          <CancelButton onClick={() => handleOpenDeclineRequest(inquiry)}>Decline Offer</CancelButton>
        </>),
      'Job Agreed': (<>
          {viewInquiryButton}
          <CancelButton onClick={() => handleOpenDeclineRequest(inquiry)}>Retract Agreement</CancelButton>
        </>),
      'Work in Progress': (<>
          {viewInquiryButton}
        </>),
      'Payment Pending': (<>
          {viewInquiryButton}
          <ActionButton onClick={() => downloadPdf(inquiry._id)}>Download Invoice</ActionButton>
          <ActionButton onClick={() => handleLink(inquiry._id, 'invoiceUrl')}>Pay</ActionButton>
          <ActionButton onClick={() => checkStatus(inquiry._id)}>Check Payment Status</ActionButton>
        </>),
      'Completed': (<>
          {viewInquiryButton}
          <ActionButton onClick={() => handleLink(inquiry._id, 'receipt')}>Download Receipt</ActionButton>
          {!checkIfInquiryHasAnalytics(inquiry) && (
            <ActionButton onClick={() => openReviewModal(inquiry)}>Leave Review</ActionButton>)}

        </>),
      'Cancelled': (
        <>
          {viewInquiryButton}
          <Typography variant="body2" color="error">This inquiry has been cancelled.</Typography>
        </>),
      'default': (<>
          {viewInquiryButton}
        </>)
    };

    return buttons[status] || buttons['default'];
  };

  //Determines the color of a status icon based on the status and current status of an inquiry.
  const getStatusIconColor = (status, currentStatus) => {
    const statusOrder = statusOptions;
    const currentStatusIndex = statusOrder.indexOf(currentStatus);
    const statusIndex = statusOrder.indexOf(status);

    if (statusIndex <= currentStatusIndex) {
      return status === 'Cancelled' ? 'red' : 'green';
    }

    return 'grey';
  };

  //Handles the cancellation of a request and sets its status on cancelled
  const handleCancelRequest = async (serviceRequestId) => {
    try {
      setLoading(true);
      const res = await axios.put('/serviceRequests/cancel', {serviceRequestId});
      const updatedInquiries = userInquiries.map(inquiry => inquiry._id === serviceRequestId ? {
        ...inquiry,
        serviceStatus: 'Cancelled'
      } : inquiry);
      setUserInquiries(updatedInquiries);
    } catch (error) {
      console.error('Error cancelling request:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCancel = () => {
    setCancelModalOpen(false);
  };

  const handleCancelClose = () => {
    setCancelModalOpen(false);
  };

  //Handles the accept offer button for a receiver to agree on the proposed offer of the receiver and sets status on job agreed
  const handleAcceptOffer = async (serviceRequestId) => {
    try {
      setLoading(true);
      const serviceBooking = serviceBookings.find(booking => booking.serviceOffer.serviceRequest._id === serviceRequestId);

      if (!serviceBooking) {
        throw new Error('No valid service booking found for the given serviceRequestId.');
      }

      const res = await axios.put('/serviceBookings/agree', {id: serviceBooking._id});
      const updatedInquiries = userInquiries.map(inquiry => inquiry._id === serviceRequestId ? {
        ...inquiry,
        serviceStatus: 'Job Agreed'
      } : inquiry);
      setUserInquiries(updatedInquiries);
    } catch (error) {
      console.error('Error accepting offer:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInquiries = filterInquiries(userInquiries, selectedFilter);
  const sortedInquiries = sortInquiries(filteredInquiries, selectedSort, sortOrder);

  return (<Box sx={{backgroundColor: '#f6f6f6', px: 5, py: 5}}>
      <Container>
        <Box textAlign="center">
          <Title text="Your Inquiries" textAlign="center"/>
        </Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{py: 2}}>
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
        {loading ? (<Box display="flex" justifyContent="center" alignItems="center">
            <CircularProgress/>
          </Box>) : (sortedInquiries.length === 0 ? (<Typography variant="h6" align="center" color="textSecondary">
              There currently are no inquiries.
            </Typography>) : (sortedInquiries.map((inquiry) => (<InquiryPaper key={inquiry._id}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" width="100%">
                  <Box flex={1}>
                    <Service>
                      <ServiceImage
                        src={profileImages[inquiry.serviceProvider._id]}
                        alt={inquiry.serviceProvider.companyName}
                      />
                      <ServiceDetails>
                        <Typography variant="h6" onClick={() => handleCompanyNameClick(inquiry.serviceProvider._id)}
                                    style={{cursor: 'pointer', color: '#FF6F00'}}>
                          {inquiry.serviceProvider.companyName}
                        </Typography>
                        <Typography variant="body2">Current Status: {inquiry.serviceStatus}</Typography>
                        <ServiceStatus>
                          {renderButtonsBasedOnStatus(inquiry)}
                        </ServiceStatus>
                        <StatusIcons>
                          {Object.keys(statusIcons).map((key) => (<Tooltip key={key} title={key} arrow>
                              <Box
                                style={{color: getStatusIconColor(key, inquiry.serviceStatus), position: 'relative'}}
                              >
                                {statusIcons[key]}
                              </Box>
                            </Tooltip>))}
                        </StatusIcons>
                      </ServiceDetails>
                    </Service>
                  </Box>
                </Box>
              </InquiryPaper>))))}
        {selectedInquiry && (<SummaryModal
            open={modalOpen}
            handleClose={closeModal}
            data={modalData}
          />)}
        <ReviewModal
          open={reviewModalOpen}
          handleClose={closeReviewModal}
          handleError={handleSnackbar}
          inquiry={selectedInquiry}
        />
        <CancelModal
          open={isCancelModalOpen}
          handleClose={handleCancelClose}
          handleConfirm={handleConfirmCancel}
        />
      </Container>
      <DeclineRequestModal open={openDeclineRequest} handleClose={handleCloseDeclineRequest} inquiry={selectedInquiry} handleSnackbar={handleSnackbar} />
      <SnackbarMessage
        open={snackbarOpen}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        severity={snackbarSeverity}
      />
    </Box>);
};

export default Inquiries;
