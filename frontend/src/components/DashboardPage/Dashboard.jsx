import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, Container } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import DescriptionIcon from '@mui/icons-material/Description';
import BuildIcon from '@mui/icons-material/Build';
import SearchIcon from '@mui/icons-material/Search';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import { useNavigate } from 'react-router-dom';
import Joyride from 'react-joyride'; // for onboarding journey
import JoyrideStepsData from './OnboardingData.json'; // data for onboarding journey
import DashboardData from './DashboardData.json'; // data for dashboard
import { handleJoyrideCallback } from '../../utils/handleJoyrideCallback'; // utils for onboarding journy
import { fetchLogIn } from '../AuthContext';
import axios from 'axios';

const iconComponents = {
  NotificationsIcon: <NotificationsIcon sx={{ fontSize: 100, color: 'white', alignSelf: 'flex-end' }} />,
  CalendarTodayIcon: <CalendarTodayIcon sx={{ fontSize: 100, color: 'white', alignSelf: 'flex-end' }} />,
  AccountBoxIcon: <AccountBoxIcon sx={{ fontSize: 100, color: 'white', alignSelf: 'flex-end' }} />,
  DescriptionIcon: <DescriptionIcon sx={{ fontSize: 100, color: 'white', alignSelf: 'flex-end' }} />,
  BuildIcon: <BuildIcon sx={{ fontSize: 100, color: 'white', alignSelf: 'flex-end' }} />,
  SearchIcon: <SearchIcon sx={{ fontSize: 100, color: 'white', alignSelf: 'flex-end' }} />,
  FormatListBulletedIcon: <FormatListBulletedIcon sx={{ fontSize: 100, color: 'white', alignSelf: 'flex-end' }} />,
};

const Dashboard = ({ userType }) => {
  const navigate = useNavigate();
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [hasFinishedOnboarding, setHasFinishedOnboarding] = useState(null);
  const [userId, setUserId] = useState();

  const handleNavigation = (path) => {
    navigate(path);
  };

  const fetchHasFinishedOnboarding = async () => {
    try {
      const response = await fetchLogIn();
      const response2 = response.data.hasCompletedOnboarding;
      setHasFinishedOnboarding(response2);
    } catch (error) {
      console.error('Error fetching provider license:', error);
    }
  };

  const fetchId = async () => {
    const response = await fetchLogIn();
    const id = response.data._id;
    setUserId(id);
  };

  useEffect(() => {
    const fetchOnboardingStatus = async () => {
      await fetchId();
      await fetchHasFinishedOnboarding();
    };
    fetchOnboardingStatus();
  }, []);

  useEffect(() => {
    if (hasFinishedOnboarding === false) {
      setRun(true);
    }
  }, [hasFinishedOnboarding]);


// Is called when the onboarding journey is finished, to make sure the onboarding will only be displayed once
// Sets the variable hasCompletedOnboard = true
  const handleOnboardingCompletion = async () => {
    try {
      const response = await axios.put('/serviceReceivers/finished_onboarding', { serviceReceiverId: userId });
      console.log("Onboarding completion response for receiver:", response.data);
    } catch (error) {
      console.error('User is not a receiver:', error);

      try {
        const alternativeResponse = await axios.put('/serviceProviders/finished_onboarding', { serviceProviderId: userId });
        console.log("Onboarding completion response for provider:", alternativeResponse.data);
      } catch (alternativeError) {
        console.error('User is not a provider (muss er aber lol):', alternativeError);
      }
    }
  };

  const joyrideCallback = (data) => {
    const { status } = data;
    const finishedStatuses = ['finished', 'skipped'];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      handleOnboardingCompletion();
    }
    handleJoyrideCallback(data, setStepIndex, setRun);
  };

  // Fetch data from JSON's to render different contents depening on userType
  const stepsData = userType === 'provider'
    ? JoyrideStepsData.DashboardProviderSteps
    : JoyrideStepsData.DashboardReceiverSteps;

  const cards = userType === 'provider'
    ? DashboardData.ProviderCards
    : DashboardData.ReceiverCards;

  return (
    <Container maxWidth={false} sx={{ backgroundColor: '#f6f6f6', px: 5, py: 5 }}>
      {/* Call Joyride for onboarding */}
      <Joyride
        steps={stepsData}
        continuous
        showSkipButton
        showProgress
        run={run}
        stepIndex={stepIndex}
        styles={{
          options: {
            zIndex: 10000,
          },
          buttonClose: {
            display: 'none',
          },
        }}
        callback={joyrideCallback}
        locale={{
          last: 'Finish Onboarding',
        }}
      />
      <Grid container spacing={3} justifyContent="center" alignItems="center">
        {cards.map((card, index) => (
          <Grid key={index} className={card.className} item xs={12} sm={card.fullWidth ? 10 : 5}>
            <Paper
              sx={{
                p: 2,
                backgroundColor: card.className === 'step1' ? '#1E1E1E' : '#FF743A',
                cursor: 'pointer',
                height: card.className === 'step1' ? 150 : 200,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: card.className === 'step1' ? 'center' : 'space-between',
                alignItems: card.className === 'step1' ? 'center' : 'flex-start',
                textAlign: card.className === 'step1' ? 'center' : 'left',
                borderRadius: 4,
                '&:hover': {
                  backgroundColor: card.className === 'step1' ? '#transparent' : '#FF571A',
                },
              }}
              onClick={() => handleNavigation(card.path)}
            >
              <Box>
                <Typography variant={card.className === 'step1' ? 'h4' : 'h6'} gutterBottom sx={{ color: 'white' }}>
                  {card.title}
                </Typography>
                <Typography variant="body1" sx={{ color: 'white' }}>
                  {card.description}
                </Typography>
              </Box>
              {card.icon && iconComponents[card.icon]}
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Dashboard;
