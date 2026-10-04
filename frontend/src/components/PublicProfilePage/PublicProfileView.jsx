import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  Avatar,
  styled,
  CircularProgress,
  Alert,
  Rating,
  Button,
  Tooltip,
} from '@mui/material';
import PriceCheckIcon from '@mui/icons-material/PriceCheck';
import FastForwardIcon from '@mui/icons-material/FastForward';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RatingModal from './ViewRatingModal';
import ServiceCardFront from '../SupportComponents/ServiceCardFront';
import ServiceCardBack from '../SupportComponents/ServiceCardBack';

const ProfilePaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(4),
  backgroundColor: '#f6f6f6',
  maxWidth: '800px',
  marginLeft: 'auto',
  marginRight: 'auto',
}));

function PublicProfileView() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [ratings, setRatings] = useState([]);
  const [averageRatings, setAverageRatings] = useState(0);
  const [flippedCards, setFlippedCards] = useState({});
  const [givenServiceTypes, setGivenServiceTypes] = useState([]);

  const [accuratePrice, setAccuratePrice] = useState(false);
  const [speedyService, setSpeedyService] = useState(false);
  const [speedyPlanning, setSpeedyPlanning] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`/serviceproviders/byid/${id}`);
        const userData = response.data;
        const serviceTypesIds = [...new Set(userData.subServiceTypes.map((subService) => subService.serviceTypeParent))];
        const serviceTypes = await axios.get(`serviceTypes/getByTitles/${serviceTypesIds}`);
        setGivenServiceTypes(serviceTypes.data);

        if (userData.profileImage) {
          const imageResponse = await axios.get(`/files/get/${userData.profileImage}`, { responseType: 'blob' });
          const imageObjectURL = URL.createObjectURL(imageResponse.data);
          userData.profilePicture = imageObjectURL;
        }

        const thresholds = { accuratePrice: 200, speedyService: 504, speedyPlanning: 48 };
        let totalAccuratePrice = 0;
        let totalSpeedyService = 0;
        let totalSpeedyPlanning = 0;
        let count = 0;
        let priceCount = 0;
        let averageRatings = 0;

        if (userData.analytics) {
          const ratings = await Promise.all(userData.analytics.map(async (analytics) => {
            if(analytics.differenceBetweenInitialAndFinalCost){
              totalAccuratePrice += analytics.differenceBetweenInitialAndFinalCost;
              priceCount++;
            }
            totalSpeedyService += analytics.timeBetweenRequestAndLast;
            totalSpeedyPlanning += analytics.timeBetweenRequestAndFirst;
            averageRatings += analytics.rating.value;
            count++;
            return analytics.rating;
          }));
          setRatings(ratings);
        }

        if (count > 0) {
          const averageAccuratePrice = totalAccuratePrice / priceCount;
          const averageSpeedyService = totalSpeedyService / count;
          const averageSpeedyPlanning = totalSpeedyPlanning / count;
          setAverageRatings((averageRatings / count).toFixed(1));

          setAccuratePrice(averageAccuratePrice <= thresholds.accuratePrice);
          setSpeedyService(averageSpeedyService <= thresholds.speedyService);
          setSpeedyPlanning(averageSpeedyPlanning <= thresholds.speedyPlanning);
        }

        setUserData(userData);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch user data.');
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const handleOpenRatingModal = () => {
    setRatingModalOpen(true);
  };

  const handleCloseRatingModal = () => {
    setRatingModalOpen(false);
  };

  const handleFlipCard = (index) => {
    setFlippedCards((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const imageForSubService = (subService) => {
    const serviceType = givenServiceTypes.find((serviceType) => serviceType.title === subService);
    return serviceType ? serviceType.image : 'default-image.jpg';
  };

  const servicesGroupedByParent = userData.subServiceTypes.reduce((acc, service) => {
    if (!acc[service.serviceTypeParent]) {
      acc[service.serviceTypeParent] = [];
    }
    acc[service.serviceTypeParent].push(service);
    return acc;
  }, {});

  return (
    <Container maxWidth={false} sx={{ backgroundColor: '#f6f6f6', px: 5, py: 5 }}>
      <Button onClick={() => navigate(-1)} startIcon={<ArrowBackIcon />} style={{ marginBottom: '20px' }}>
        Back
      </Button>
      <ProfilePaper>
        <Grid container spacing={3}>
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
            <Avatar
              src={userData.profilePicture}
              alt="Profile Picture"
              sx={{ width: 120, height: 120 }}
            />
            <Box display="flex" justifyContent="space-between" width="100%" maxWidth="120px" mt={2}>
              <Tooltip title="Master of Price Accuracy: Service Providers with this badge know how to estimate their services. In the past their estimations were not much lower than the final price.">
                <PriceCheckIcon sx={{ color: accuratePrice ? 'primary.main' : 'rgba(0, 0, 0, 0.1)' }} />
              </Tooltip>
              <Tooltip title="Master of Speed: Service Providers with this badge will not waste your time. They usually perform their services in less than three weeks after your request.">
                <FastForwardIcon sx={{ color: speedyService ? 'primary.main' : 'rgba(0, 0, 0, 0.1)' }} />
              </Tooltip>
              <Tooltip title="Master of Response: These Service Providers with this badge keep their schedule neat. They usually respond to your requests in less than two days.">
                <EventAvailableIcon sx={{ color: speedyPlanning ? 'primary.main' : 'rgba(0, 0, 0, 0.1)' }} />
              </Tooltip>
            </Box>
          </Grid>
          <Grid item xs={9}>
            <Typography variant="h5" align="left">
              <strong>{userData.companyName}</strong>
            </Typography>
            <Typography variant="body1">
              <strong>Phone: </strong> {userData.phoneNumber}
            </Typography>
            <Typography variant="body1">
              <strong>Address: </strong> {userData.address.street} {userData.address.houseNumber}, {userData.address.zipCode} {userData.address.city}, {userData.address.country}
            </Typography>
            <Box display="flex" alignItems="center">
              <Typography variant="body1">
                <strong>Rating: </strong>
              </Typography>
              <Rating
                name="provider-rating"
                value={averageRatings}
                readOnly
                precision={0.1}
                size="medium"
                sx={{ ml: 1, mr: 1 }}
              />
              <Typography
                variant="body1"
                sx={{
                  cursor: 'pointer',
                  color: 'blue',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
                onClick={handleOpenRatingModal}
              >
                {averageRatings}/5 considering {ratings.length} ratings
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body1">
              <strong>Description: </strong> {userData.description}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body1">
              <strong>Services Offered: </strong>
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(servicesGroupedByParent).map(([serviceTypeParent, subServices], index) => (
                <Grid item xs={12} sm={6} md={4} key={index} onClick={() => handleFlipCard(index)}>
                  <Box
                    sx={{
                      perspective: '1000px',
                    }}
                  >
                    <Box
                      sx={{
                        width: '100%',
                        height: '300px',
                        position: 'relative',
                        transformStyle: 'preserve-3d',
                        transition: 'transform 0.8s',
                        transform: flippedCards[index] ? 'rotateY(180deg)' : 'rotateY(0deg)',
                      }}
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          width: '100%',
                          height: '100%',
                          backfaceVisibility: 'hidden',
                        }}
                      >
                        <ServiceCardFront
                          image={imageForSubService(serviceTypeParent) || 'default-image.jpg'}
                          title={serviceTypeParent}
                          description={
                            <>
                              Offers {subServices.length} services of this type
                              <br />
                              Click here to see more
                            </>
                          }
                        />
                      </Box>
                      <Box
                        sx={{
                          position: 'absolute',
                          width: '100%',
                          height: '100%',
                          backfaceVisibility: 'hidden',
                          transform: 'rotateY(180deg)',
                        }}
                      >
                        <ServiceCardBack
                          title={serviceTypeParent}
                          subServices={subServices}
                        />
                      </Box>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </ProfilePaper>
      <RatingModal open={ratingModalOpen} onClose={handleCloseRatingModal} ratings={ratings} />
    </Container>
  );
}

export default PublicProfileView;
