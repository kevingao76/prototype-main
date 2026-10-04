import React, {useState, useEffect, useContext} from 'react';
import axios from 'axios';
import {
  List, ListItem, Typography, Box, CircularProgress, CardContent, CardHeader, Container, Card, Button, IconButton
} from '@mui/material';
import {AuthContext, fetchLogIn} from "../AuthContext";
import CloseIcon from "@mui/icons-material/Close";
import Title from '../SupportComponents/Title';

function SortIcon() {
  return null;
}

export default function NotificationsServiceReceiver() {

  const {loading} = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [showContent, setShowContent] = useState({});
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    /**
     * Initializes the notification fetching process.
     *
     * This function first fetches the logged-in user's information using `fetchLogIn`.
     * If a valid user ID is found, it proceeds to fetch notifications for that user.
     */
    const initializeNotifications = async () => {
      try {
        const loginResponse = await fetchLogIn();
        console.log(loginResponse.data);
        if (loginResponse.data._id) {
          const serviceProviderId = loginResponse.data._id;
          fetchNotifications(serviceProviderId);

          const interval = setInterval(() => {
            fetchNotifications(serviceProviderId);
          }, 20000); // Poll every 20 seconds

          return () => clearInterval(interval);
        } else {
          setFetching(false);
        }
      } catch (error) {
        console.error('Error during login fetch:', error);
        setFetching(false);
      }
    };

    initializeNotifications();
  }, []);

  /**
   * Fetches notifications for the given user ID.
   *
   * @param {string} id - The ID of the user for whom to fetch notifications.
   */
  const fetchNotifications = async (id) => {
    try {
      const response = await axios.get(`/notifications/get/${id}`);

      if (response.data && Array.isArray(response.data)) {
        setNotifications(response.data);
      } else {
        console.warn('Unexpected API response structure:', response.data);
        setNotifications([]);
      }

      setFetching(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setFetching(false);
    }
  };

  //Toggles the visibility of content for a specific notification
  const handleToggleContent = (index) => {
    setShowContent(prevState => ({
      ...prevState, [index]: !prevState[index]
    }));
  };

  //Handles if a change to the sort order is triggered
  const handleSortOrderChange = () => {
    setSortOrder(prevOrder => (prevOrder === 'desc' ? 'asc' : 'desc'));
  };

  //Sorts notifications based on their timestamp
  const sortedNotifications = [...notifications].sort((a, b) => {
    if (sortOrder === 'desc') {
      return new Date(b.timestamp) - new Date(a.timestamp);
    } else {
      return new Date(a.timestamp) - new Date(b.timestamp);
    }
  });

  if (loading || fetching) {
    return <CircularProgress/>;
  }

  return (<Container maxWidth={false} sx={{backgroundColor: '#f6f6f6', px: 5, py: 5}}>
      <Container>
        <Box textAlign="center" mb={3}>
          <Title text="Notifications"/>
        </Box>
        <Box display="flex" justifyContent="flex-end" mb={3}>
          <Button
            variant="outlined"
            startIcon={<SortIcon/>}
            onClick={handleSortOrderChange}
          >
            Sort by Date ({sortOrder === 'desc' ? 'Descending' : 'Ascending'})
          </Button>
        </Box>
        {notifications.length > 0 ? (<List>
            {sortedNotifications.map((notification, index) => (<ListItem key={index} sx={{mb: 2}}>
                <Card sx={{width: '100%'}}>
                  <CardHeader
                    title={notification.subject}
                    subheader={new Date(notification.timestamp).toLocaleString()}
                    action={showContent[index] && (<IconButton onClick={() => handleToggleContent(index)}>
                        <CloseIcon/>
                      </IconButton>)}
                  />
                  <CardContent>
                    {showContent[index] ? (<Typography variant="body1">
                        <div dangerouslySetInnerHTML={{__html: notification.content}}/>
                      </Typography>) : (<Button variant="outlined" onClick={() => handleToggleContent(index)}>
                        Show Content
                      </Button>)}
                  </CardContent>
                </Card>
              </ListItem>))}
          </List>) : (<Box textAlign="center" mt={3}>
            <Typography variant="body1" color="textSecondary">
              No notifications available.
            </Typography>
          </Box>)}
      </Container>
    </Container>);
};
