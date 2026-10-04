import React, {useEffect, useState} from 'react';
import {Box, Typography, Button, Menu, MenuItem, CircularProgress, Rating} from '@mui/material';
import styled from '@emotion/styled';
import {useLocation, useNavigate} from 'react-router-dom';
import axios from 'axios';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import {fetchLogIn} from '../AuthContext';
import RatingModal from '../PublicProfilePage/ViewRatingModal';
import {handleStringFromAddress} from '../../utils/addressUtils';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';


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

const FilterButton = styled(Button)`
  margin: 5px;
  color: #FF6F00;
  border: 1px solid #FF6F00;
  text-transform: none;

  &:hover {
    background-color: #FFE0B2;
  }
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


const ServiceProviderOverview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {selectedSubServiceId, input, title, selectedLocation} = location.state || {};
  const [selectedSubService, setSelectedSubService] = useState(null);
  const [craftsmen, setCraftsmen] = useState([]);
  const [filteredCraftsmen, setFilteredCraftsmen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('Most relevant');
  const [anchorEl, setAnchorEl] = useState(null);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [ratings, setRatings] = useState([]);
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    //Fetches craftsmen data based on the selected sub-service and location.
    const fetchCraftsmen = async () => {
      try {
        const user = await fetchLogIn();

        const selectedSubService = await axios.get(`/subServiceTypes/${selectedSubServiceId}`);
        setSelectedSubService(selectedSubService.data.name);

        const response = await axios.get(`/serviceProviders/getWithConditions/${selectedSubServiceId}/${selectedLocation}`);
        const craftsmenData = response.data;
        console.log("Craftsmen Data: ", craftsmenData);

        const fetchedRatings = [];

        const updatedCraftsmenData = await Promise.all(craftsmenData.map(async (craftsman) => {
          if (craftsman.profileImage) {
            const imageResponse = await axios.get(`/files/get/${craftsman.profileImage}`, {responseType: 'blob'});
            const imageObjectURL = URL.createObjectURL(imageResponse.data);
            craftsman.profileImage = imageObjectURL;
          }

          if (craftsman.analytics) {
            const ratingsValue = craftsman.analytics.map(analytics => analytics.rating.value);
            const averageRating = ratingsValue.reduce((acc, rating) => acc + rating, 0) / ratingsValue.length;
            craftsman = {...craftsman, averageRating: averageRating, numberOfRatings: ratingsValue.length};
          } else {
            craftsman = {...craftsman, averageRating: 0, numberOfRatings: 0};
          }


          return craftsman;
        }));
        console.log(`fetched Ratings: ${JSON.stringify(fetchedRatings)}`);

        setCraftsmen(updatedCraftsmenData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching craftsmen:', error);
        setLoading(false);
      }
    };

    fetchCraftsmen();
  }, [selectedSubServiceId]);

  //Filters craftsmen based on the selected sub-service and updates the filtered craftsmen state.
  useEffect(() => {
    if (craftsmen.length > 0 && selectedSubService) {
      const filtered = craftsmen.filter(craftsman => craftsman.subServiceTypes.some(subService => subService.name === selectedSubService));
      setFilteredCraftsmen(filtered);
    }
  }, [craftsmen, selectedSubService]);

  //Sorts filtered craftsmen based on selected sort criteria and updates the filtered craftsmen state.
  useEffect(() => {
    if (filteredCraftsmen.length > 0) {
      handleSort(sortBy, sortOrder);
    }
  }, [sortBy, sortOrder]);

  //Handles the opening of the sorting menu.
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  //Handles the closing of the sorting menu.
  const handleClose = (option) => {
    setAnchorEl(null);
    if (option) {
      setSortBy(option);
      handleSort(option, sortOrder);
    }
  };

  const handleSort = (option, order) => {
    const sortedCraftsmen = [...filteredCraftsmen].sort((a, b) => {
      if (option === 'Most relevant') {
        const ratingA = a.averageRating || 0;
        const ratingB = b.averageRating || 0;
        return order === 'asc' ? ratingA - ratingB : ratingB - ratingA;
      } else if (option === 'Distance') {
        const distanceA = a.distance || 0;
        const distanceB = b.distance || 0;
        return order === 'asc' ? distanceA - distanceB : distanceB - distanceA;
      }
      return 0;
    });
    setFilteredCraftsmen(sortedCraftsmen);
  };

  //Handles the change if the sorting order is adjusted
  const handleSortOrderChange = () => {
    setSortOrder(prevOrder => (prevOrder === 'asc' ? 'desc' : 'asc'));
  };

  //Navigates to the craftsman's profile page and passes the selected sub-service, user input, title, and address as state.
  const handleContactClick = (craftsmanId) => {
    console.log('selectedLocation: ', selectedLocation);
    navigate(`/craftsman/${craftsmanId}`, {
      state: {
        selectedSubService: selectedSubService, input: input, title: title, address: selectedLocation,
      }
    });
    console.log('selectedLocation: ', selectedLocation);
  };

  //Opens a serice provider detail overview
  const handleCompanyNameClick = (id) => {
    navigate(`/viewProfile/${id}`);
  };

  //Handles the opening of the rating modal
  const handleOpenRatingModal = (analytics) => {
    const fetchedRatings = [];
    analytics.forEach(analytics => {
      fetchedRatings.push({value: analytics.rating.value, content: analytics.rating.content});
    });
    setRatings(fetchedRatings);
    setRatingModalOpen(true);
  };

  //Handles closing of rating modal
  const handleCloseRatingModal = () => {
    setRatingModalOpen(false);
  };

  if (loading) {
    return (<Box display="flex" justifyContent="center" alignItems="center" minHeight="78vh">
      <CircularProgress/>
    </Box>);
  }

  return (<Container sx={{minHeight: '78vh'}}>
    <Button onClick={() => navigate(-1)} startIcon={<ArrowBackIcon/>} style={{marginBottom: '20px'}}>
      Back
    </Button>
    <Title variant="h4" gutterBottom>Search Results</Title>
    <Typography variant="body1" gutterBottom>
      Specify the painting service you have in mind as detailed as possible to get the best results.
    </Typography>
    <Section>
      <Title variant="h6">Filters:</Title>
      <Box display="flex" flexWrap="wrap" mb={2} justifyContent="space-between">
        <Box display="flex" alignItems="center">
          <FilterButton
            variant="outlined"
            onClick={handleClick}
          >
            Sort by: {sortBy}
          </FilterButton>
          <Menu
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={() => handleClose(null)}
          >
            {['Most relevant', 'Distance'].map(option => (<MenuItem key={option} onClick={() => handleClose(option)}>
              {option}
            </MenuItem>))}
          </Menu>
          {sortOrder === 'asc' ? (<ArrowUpwardIcon onClick={handleSortOrderChange}
                                                   style={{
                                                     cursor: 'pointer', marginLeft: '10px', color: '#FF6F00'
                                                   }}/>) : (<ArrowDownwardIcon onClick={handleSortOrderChange}
                                                                               style={{
                                                                                 cursor: 'pointer',
                                                                                 marginLeft: '10px',
                                                                                 color: '#FF6F00'
                                                                               }}/>)}
        </Box>
      </Box>
    </Section>
    <Section>
      {filteredCraftsmen.length > 0 ? (filteredCraftsmen.map((craftsman) => (<CraftsmanCard key={craftsman._id}>
        <CraftsmanImage src={craftsman.profileImage || 'default-image-url'} alt={craftsman.companyName}/>
        <CraftsmanInfo>
          <Typography variant="h6" onClick={() => handleCompanyNameClick(craftsman._id)}
                      style={{cursor: 'pointer', color: '#FF6F00'}}>
            {craftsman.companyName}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {craftsman.description}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {handleStringFromAddress(craftsman.address)}
          </Typography>
        </CraftsmanInfo>
        <Box textAlign="right" display="flex" flexDirection="column" alignItems="center">
          <Rating
            name="provider-rating"
            value={craftsman.averageRating || 0}
            readOnly
            precision={0.1}
            size="medium"
            sx={{ml: 1, mr: 1}}
          />
          <Typography
            variant="body2"
            sx={{
              cursor: 'pointer', color: 'blue', '&:hover': {
                textDecoration: 'underline',
              }, textAlign: 'center',
            }}
            onClick={() => handleOpenRatingModal(craftsman.analytics)}
          >
            {craftsman.numberOfRatings ? `${craftsman.averageRating.toFixed(1)}/5 (out of ${craftsman.numberOfRatings} Ratings)` : "No ratings yet"}                </Typography>
          <ContactButton variant="contained" endIcon={<ArrowForwardIcon/>}
                         onClick={() => handleContactClick(craftsman._id)}>
            Contact now!
          </ContactButton>
        </Box>
      </CraftsmanCard>))) : (
        <Typography variant="body1" color="textSecondary">No craftsmen found for the selected service.</Typography>)}
    </Section>
    <RatingModal open={ratingModalOpen} onClose={handleCloseRatingModal} ratings={ratings}/>
  </Container>);
};

export default ServiceProviderOverview;
