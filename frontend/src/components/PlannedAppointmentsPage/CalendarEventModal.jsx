import React, { useEffect, useState } from 'react';
import { Box, Typography, List, ListItem, IconButton, Modal, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { saveAs } from 'file-saver';
import ical from 'ical-generator';
import axios from 'axios';
import Title from '../SupportComponents/Title';
import { handleStringFromAddress } from '../../utils/addressUtils';

const CalendarEventModal = ({ open, onClose, event, conditions, userType }) => {
    const [personInfo, setPersonInfo] = useState(null);
    const [address, setAddress] = useState(null);
    const [serviceStatus, setServiceStatus] = useState();

    const formatDateString = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getUTCDate()).padStart(2, '0');
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const year = date.getUTCFullYear();
        return `${day}.${month}.${year}`;
    };

    const formatPhoneNumber = (phoneNumber) => {
        if (!phoneNumber) return '';
        const cleaned = phoneNumber.replace(/\D/g, '');
        if (cleaned.length <= 2) return `+${cleaned}`;
        const country = cleaned.slice(0, 2);
        const rest = cleaned.slice(2);
        return `+${country} ${rest}`;
    };

    const calculateEndTime = (startDate, duration) => {
        return new Date(startDate.getTime() + duration * 60000);
    };

    const subtractTwoHours = (date) => {
        const newDate = new Date(date);
        newDate.setHours(newDate.getHours() - 2);
        return newDate;
    };

    const handleExport = () => {
        if (!event || !conditions || !personInfo || !address) return;

        const cal = ical({ name: 'My Calendar Event' });

        const startDate = new Date(conditions.date);
        const endDate = calculateEndTime(startDate, conditions.expectedDuration);

        cal.createEvent({
            start: startDate,
            end: endDate,
            summary: userType === 'receiver' ? personInfo.companyName : `${personInfo.firstName} ${personInfo.lastName}`,
            description: `
                Name: ${userType === 'receiver' ? personInfo.companyName : `${personInfo.firstName} ${personInfo.lastName}`}
                Phone Number: ${formatPhoneNumber(personInfo.phoneNumber)}
                Address: ${handleStringFromAddress(address)}
            `,
            location: event.location || '',
        });

        const blob = new Blob([cal.toString()], { type: 'text/calendar' });
        saveAs(blob, 'event.ics');
    };

    const fetchPersonInfo = async (conditionId) => {
        try {
            // Find service offer with this service condition id
            const response = await axios.get(`/serviceConditions/OfferByConditionId/${conditionId}`);
            const matchedOffer = response.data;

            if (matchedOffer) {
                const person = userType === 'provider' ? matchedOffer.serviceRequest.serviceReceiver : matchedOffer.serviceRequest.serviceProvider;

                setPersonInfo(person);
                setAddress(person.address);
            }
        } catch (error) {
            console.error('Error fetching person information:', error);
        }
    };

    const fetchServiceStatus = async (conditionId) => {
        try {
            // Find service offer with this service condition id
            const response = await axios.get(`/serviceConditions/OfferByConditionId/${conditionId}`);
            const matchedOffer = response.data;
            console.log(matchedOffer, "matchedOffer")
            if (matchedOffer) {
                const fetchedServiceStatus = matchedOffer.serviceRequest.serviceStatus;
                setServiceStatus(fetchedServiceStatus);
            }
        } catch (error) {
            console.error('Error fetching service offer or status:', error);
        }
    };

    useEffect(() => {
        if (open && conditions && conditions._id) {
            fetchPersonInfo(conditions._id);
            fetchServiceStatus(conditions._id);
            console.log("Fetched working condition data successfully")
        }
    }, [open, conditions]);

    const startDate = conditions?.date ? subtractTwoHours(new Date(conditions.date)) : null;
    const endDate = startDate ? calculateEndTime(startDate, conditions?.expectedDuration || 0) : null;

    return (
        <Modal
            open={open}
            onClose={onClose}
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
            <Box sx={{
                position: 'relative',
                p: 4,
                backgroundColor: 'white',
                borderRadius: 1,
                maxWidth: 600,
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
                boxShadow: 24
            }}>
                <IconButton
                    onClick={onClose}
                    sx={{ position: 'absolute', top: 8, right: 8 }}
                >
                    <CloseIcon />
                </IconButton>
                {event && conditions && (
                    <>
                        <Box sx={{ py: 1 }}>
                            <Title text={'Details'} textAlign="center" />
                        </Box>
                        <Box mt={2}>
                            <Typography variant="h6">{userType === 'provider' ? 'Service Receiver Details' : 'Service Provider Details'}</Typography>
                            <List>
                                <ListItem>
                                    <Box display="flex" justifyContent="space-between" width="100%">
                                        <Typography variant="body1">{userType === 'receiver' ? 'Company Name:' : 'Name:'}</Typography>
                                        <Typography variant="body2">{userType === 'receiver' ? personInfo?.companyName : `${personInfo?.firstName} ${personInfo?.lastName}`}</Typography>
                                    </Box>
                                </ListItem>
                                <ListItem>
                                    <Box display="flex" justifyContent="space-between" width="100%">
                                        <Typography variant="body1">Phone Number:</Typography>
                                        <Typography variant="body2">{formatPhoneNumber(personInfo?.phoneNumber)}</Typography>
                                    </Box>
                                </ListItem>
                                <ListItem>
                                    <Box display="flex" justifyContent="space-between" width="100%">
                                        <Typography variant="body1">Address:</Typography>
                                        <Typography variant="body2">{address ? `${address.street} ${address.houseNumber}, ${address.zipCode}, ${address.city}, ${address.country}` : 'Loading...'}</Typography>
                                    </Box>
                                </ListItem>
                                <ListItem>
                                    <Box display="flex" justifyContent="space-between" width="100%">
                                        <Typography variant="body1">Status:</Typography>
                                        <Typography variant="body2">{serviceStatus}</Typography>
                                    </Box>
                                </ListItem>
                            </List>
                        </Box>
                        <Box mt={2}>
                            <Typography variant="h6">Working Condition Details</Typography>
                            <List>
                                <ListItem>
                                    <Box display="flex" justifyContent="space-between" width="100%">
                                        <Typography variant="body1">ID</Typography>
                                        <Typography variant="body2">{conditions._id}</Typography>
                                    </Box>
                                </ListItem>
                                <ListItem>
                                    <Box display="flex" justifyContent="space-between" width="100%">
                                        <Typography variant="body1">Time slot</Typography>
                                        <Typography variant="body2">{formatDateString(conditions.date)}, {startDate?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {endDate?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} </Typography>
                                    </Box>
                                </ListItem>
                                <ListItem>
                                    <Box display="flex" justifyContent="space-between" width="100%">
                                        <Typography variant="body1">Expected Duration:</Typography>
                                        <Typography variant="body2">{conditions.expectedDuration} minutes</Typography>
                                    </Box>
                                </ListItem>
                                <ListItem>
                                    <Box display="flex" justifyContent="space-between" width="100%">
                                        <Typography variant="body1">Expected Overall Cost:</Typography>
                                        <Typography variant="body2">
                                            {conditions.expectedOverallCost?.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')} €
                                        </Typography>
                                    </Box>
                                </ListItem>
                                <ListItem>
                                    <Box display="flex" justifyContent="space-between" width="100%">
                                        <Typography variant="body1">Special Conditions:</Typography>
                                        <Typography variant="body2">{conditions.specialConditions ? conditions.specialConditions : 'None'}</Typography>
                                    </Box>
                                </ListItem>
                                {conditions.expectedAdditionalCostFactors && conditions.expectedAdditionalCostFactors.length > 0 && (
                                    <>
                                        <ListItem>
                                            <Typography variant="subtitle1">Additional Cost Factors</Typography>
                                        </ListItem>
                                        {conditions.expectedAdditionalCostFactors.map((factor, index) => (
                                            <ListItem key={index} sx={{ pl: 4 }}>
                                                <Box display="flex" justifyContent="space-between" width="100%">
                                                    <Typography variant="body1">{factor.description}:</Typography>
                                                    <Typography variant="body2">{factor.price?.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')} €</Typography>
                                                </Box>
                                            </ListItem>
                                        ))}
                                    </>
                                )}
                            </List>
                        </Box>
                        <Box mt={2} display="flex" justifyContent="center">
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleExport}
                            >
                                ICS Export
                            </Button>
                        </Box>
                    </>
                )}
            </Box>
        </Modal>
    );
};

export default CalendarEventModal;
