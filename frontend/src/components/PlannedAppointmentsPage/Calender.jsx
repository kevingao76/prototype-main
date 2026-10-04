import React, { useState, useEffect } from 'react';
import { Box, Container, Switch, FormControlLabel, Tooltip, IconButton, CircularProgress, Typography } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import FullCalendar from '@fullcalendar/react'; // import fullcalendar library
import dayGridPlugin from '@fullcalendar/daygrid'; // import plugin to display days for fullcalender
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import googleCalendarPlugin from '@fullcalendar/google-calendar';
import { fetchProviderBookings, fetchReceiverBookings } from '../../utils/CalendarUtils';
import EventModal from './CalendarEventModal';
import Title from '../SupportComponents/Title';
import axios from 'axios';
import { fetchLogIn } from '../AuthContext';

const Calendar = ({ userType }) => {
  const [events, setEvents] = useState([]);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedConditions, setSelectedConditions] = useState(null);
  const [googleCalendarEvents, setGoogleCalendarEvents] = useState([]);
  const [googleCalendarId, setGoogleCalendarId] = useState('');
  const [userId, setUserId] = useState();
  const [showGoogleCalendar, setShowGoogleCalendar] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleEventClick = (clickInfo) => {
    const event = clickInfo.event;
    const conditions = event.extendedProps.conditions;
    setSelectedEvent(event);
    setSelectedConditions(conditions);
    setEventModalOpen(true);
  };

  const handleCloseEventModal = () => {
    setEventModalOpen(false);
    setSelectedEvent(null);
    setSelectedConditions(null);
  };

  const handleGoogleCalendarToggle = async (event) => {
    const checked = event.target.checked;
    setShowGoogleCalendar(checked);

    if (checked && googleCalendarId) {
      const googleEventsSource = {
        googleCalendarId: googleCalendarId,
      };
      setGoogleCalendarEvents([googleEventsSource]);
    } else {
      setGoogleCalendarEvents([]);
    }

    // Re-fetch bookings when Google Calendar toggle changes
    await fetchBookings();
  };

  const fetchId = async () => {
    try {
      const response = await fetchLogIn();
      const id = response.data._id;
      setUserId(id);
      return id;
    } catch (error) {
      console.error('Error fetching user ID:', error);
    }
  };

  const fetchGoogleCalendar = async () => {
    try {
      const id = await fetchId();
      if (id) {
        const response = await axios.get(`/serviceproviders/byid/${id}`);
        setGoogleCalendarId(response.data.googleCalendar);
        if (response.data.googleCalendar && showGoogleCalendar) {
          setGoogleCalendarEvents([
            {
              googleCalendarId: response.data.googleCalendar,
            },
          ]);
        }
      }
    } catch (error) {
      console.error('Error fetching Google Calendar ID:', error);
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    if (userType === 'provider') {
      const bookings = await fetchProviderBookings(selectedConditions);
      setEvents(bookings);
    } else if (userType === 'receiver') {
      const bookings = await fetchReceiverBookings(selectedConditions);
      setEvents(bookings);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (userType === 'provider') {
      fetchGoogleCalendar();
    }
    fetchBookings();
  }, [userType]);

  useEffect(() => {
    if (showGoogleCalendar && userType === 'provider') {
      fetchGoogleCalendar();
    }
  }, [showGoogleCalendar]);

  return (
    <Container maxWidth={false} sx={{ backgroundColor: '#f6f6f6', py: 5, px: 5 }}>
      <Box sx={{ mb: 5 }}>
        <Box textAlign="center">
          <Title text="Planned Appointments" textAlign="center" />
        </Box>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" sx={{ py: 2 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Box sx={{ maxWidth: 1200, mx: 'auto', mb: 5, height: 600, py: 2 }}>
              <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin, listPlugin, googleCalendarPlugin]}
                initialView="dayGridMonth"
                events={events}
                eventClick={handleEventClick}
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,dayGridWeek,dayGridDay,listWeek',
                }}
                googleCalendarApiKey="AIzaSyBXSRytlh6rSEM87v2LU2qJiFGvYSC7zWw"
                eventSources={googleCalendarEvents}
                height="100%"
              />
            </Box>
            {userType === 'provider' && (
              <Box textAlign="center">
                <FormControlLabel
                  control={
                    <Switch
                      checked={showGoogleCalendar}
                      onChange={handleGoogleCalendarToggle}
                      color="primary"
                      disabled={!googleCalendarId}
                    />
                  }
                  label={
                    <Box display="flex" alignItems="center">
                      Show Google Calendar Events
                      <Tooltip arrow title="If you want to add or change your calendar ID, please update them in your profile management">
                        <IconButton>
                          <InfoIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                />
              </Box>
            )}
          </>
        )}
      </Box>
      <EventModal
        open={eventModalOpen}
        onClose={handleCloseEventModal}
        event={selectedEvent}
        conditions={selectedConditions}
        userType={userType} // Pass userType to EventModal
      />
      {!loading && (
        <Box display="flex" justifyContent="center" alignItems="center" mt={4}>
          <Box display="flex" alignItems="center" mx={2}>
            <Box sx={{ width: 12, height: 12, backgroundColor: 'blue', borderRadius: '50%', mr: 1 }} />
            <Typography variant="body2">Google Calendar Events</Typography>
          </Box>
          <Box display="flex" alignItems="center" mx={2}>
            <Box sx={{ width: 12, height: 12, backgroundColor: 'green', borderRadius: '50%', mr: 1 }} />
            <Typography variant="body2">Payment Pending</Typography>
          </Box>
          <Box display="flex" alignItems="center" mx={2}>
            <Box sx={{ width: 12, height: 12, backgroundColor: 'orange', borderRadius: '50%', mr: 1 }} />
            <Typography variant="body2">Job Agreed or Work in Progress</Typography>
          </Box>
          <Box display="flex" alignItems="center" mx={2}>
            <Box sx={{ width: 12, height: 12, backgroundColor: 'red', borderRadius: '50%', mr: 1 }} />
            <Typography variant="body2">Cancelled</Typography>
          </Box>
          { userType === 'receiver' && (
            <Box display="flex" alignItems="center" mx={2}>
            <Box sx={{ width: 12, height: 12, backgroundColor: 'yellow', borderRadius: '50%', mr: 1 }} />
            <Typography variant="body2">Offer Sent</Typography>
          </Box>
          )}
        </Box>
      )}
    </Container>
  );
};

export default Calendar;
