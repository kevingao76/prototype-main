import React, { useEffect, useState } from 'react';
import { Modal, Box, Typography, TextField, IconButton, Accordion, AccordionSummary, AccordionDetails, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import axios from 'axios';

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '70vw',
    maxHeight: '90vh',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    overflowY: 'auto'
};

const OfferModal = ({ open, handleClose, offer, handleSave, receiverData }) => {
    const [editableOffer, setEditableOffer] = useState(offer || {});
    const [expandedPanel, setExpandedPanel] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);
    const [backupConditions, setBackupConditions] = useState({});
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (offer) {
            setEditableOffer(offer);
        }
    }, [offer]);

    if (!offer) return null;

    const handleInputChange = (event, field, index, subIndex) => {
        const { value } = event.target;
        setEditableOffer((prev) => {
            const updatedConditions = [...prev.workingConditions];
            if (subIndex !== undefined) {
                updatedConditions[index].expectedAdditionalCostFactors[subIndex] = {
                    ...updatedConditions[index].expectedAdditionalCostFactors[subIndex],
                    [field]: value,
                };
            } else {
                updatedConditions[index] = {
                    ...updatedConditions[index],
                    [field]: value,
                };
            }
            return {
                ...prev,
                workingConditions: updatedConditions,
            };
        });
        setErrors((prev) => ({
            ...prev,
            [index]: {
                ...prev[index],
                [field]: '',
            }
        }));
    };

    const handlePanelChange = (panel) => (event, isExpanded) => {
        setExpandedPanel(isExpanded ? panel : false);
    };

    const handleAddWorkingCondition = () => {
        setEditableOffer((prev) => ({
            ...prev,
            workingConditions: [
                ...prev.workingConditions,
                {
                    date: '',
                    hourlyRate: '',
                    expectedDuration: '',
                    expectedMaterialCost: '',
                    expectedOverallCost: '',
                    specialConditions: '',
                    expectedAdditionalCostFactors: [],
                },
            ],
        }));
    };

    const handleAddCostFactor = (index) => {
        setEditableOffer((prev) => {
            const updatedConditions = [...prev.workingConditions];
            updatedConditions[index].expectedAdditionalCostFactors.push({ description: '', price: '' });
            return {
                ...prev,
                workingConditions: updatedConditions,
            };
        });
    };

    const handleRemoveCostFactor = (index, subIndex) => {
        setEditableOffer((prev) => {
            const updatedConditions = [...prev.workingConditions];
            updatedConditions[index].expectedAdditionalCostFactors.splice(subIndex, 1);
            return {
                ...prev,
                workingConditions: updatedConditions,
            };
        });
    };

    const handleEditClick = (index) => {
        setBackupConditions((prev) => ({
            ...prev,
            [index]: { ...editableOffer.workingConditions[index] },
        }));
        setEditingIndex(index);
    };

    const handleDeleteClick = async (index) => {
        try {
            const conditionToDelete = editableOffer.workingConditions[index];
            const offer = await axios.put('/serviceOffers/removeConditions', { serviceOfferId: editableOffer._id, workingConditionsIds: [conditionToDelete._id] });
            console.log("working conditions successfully removed from the offer")
            console.log(offer.data);
        } catch (error) {
            console.error('Error updating working condition:', error);
        }
        handleClose();
    };

    const handleCancelClick = (index) => {
        setEditableOffer((prev) => {
            const updatedConditions = [...prev.workingConditions];
            updatedConditions[index] = { ...backupConditions[index] };
            return {
                ...prev,
                workingConditions: updatedConditions,
            };
        });
        setEditingIndex(null);
    };

    const validateFields = (condition) => {
        let isValid = true;
        const newErrors = {};

        if (!condition.date) {
            newErrors.date = 'Date is required';
            isValid = false;
        }
        if (!condition.hourlyRate) {
            newErrors.hourlyRate = 'Hourly rate is required';
            isValid = false;
        } else if (isNaN(condition.hourlyRate)) {
            newErrors.hourlyRate = 'Hourly rate must be a number';
            isValid = false;
        }
        if (!condition.expectedDuration) {
            newErrors.expectedDuration = 'Expected duration is required';
            isValid = false;
        } else if (isNaN(condition.expectedDuration)) {
            newErrors.expectedDuration = 'Expected duration must be a number';
            isValid = false;
        }
        if (!condition.expectedMaterialCost) {
            newErrors.expectedMaterialCost = 'Expected material cost is required';
            isValid = false;
        } else if (isNaN(condition.expectedMaterialCost)) {
            newErrors.expectedMaterialCost = 'Expected material cost must be a number';
            isValid = false;
        }

        return { isValid, newErrors };
    };

    const handleUpdateClick = async (index) => {
        const updatedCondition = editableOffer.workingConditions[index];
        const { isValid, newErrors } = validateFields(updatedCondition);

        if (!isValid) {
            setErrors((prev) => ({
                ...prev,
                [index]: newErrors,
            }));
            return;
        }

        try {
            if (updatedCondition.hourlyRate === undefined || updatedCondition.date === undefined || updatedCondition.expectedDuration === undefined || updatedCondition.expectedMaterialCost === undefined) {
                throw Error("Please fill in all required fields");
            }
            if (!(updatedCondition._id === undefined)) {
                const updateData = {
                    serviceConditionId: updatedCondition._id,
                    hourlyRate: updatedCondition.hourlyRate,
                    date: updatedCondition.date,
                    expectedDuration: updatedCondition.expectedDuration,
                    expectedMaterialCost: updatedCondition.expectedMaterialCost,
                    expectedAdditionalCostFactors: updatedCondition.expectedAdditionalCostFactors,
                    specialConditions: updatedCondition.specialConditions,
                };
                await axios.put(`/serviceConditions/update/${updatedCondition._id}`, updateData);

                console.log("working conditions successfully updated")
            } else {
                const condition = await axios.post('/serviceConditions/create', {
                    serviceOfferId: editableOffer._id,
                    hourlyRate: updatedCondition.hourlyRate,
                    date: updatedCondition.date,
                    expectedDuration: updatedCondition.expectedDuration,
                    expectedMaterialCost: updatedCondition.expectedMaterialCost,
                    expectedAdditionalCostFactors: updatedCondition.expectedAdditionalCostFactors,
                    specialConditions: updatedCondition.specialConditions,
                });
                console.log("working conditions successfully created")
                console.log(condition.data);
                console.log('what I give ', { serviceOfferId: editableOffer._id, workingConditionsIds: [condition.data._id] });
                const offer = await axios.put('/serviceOffers/addConditions', { serviceOfferId: editableOffer._id, workingConditionsIds: [condition.data._id] });

                console.log("working conditions successfully added to offer")
                console.log(offer);
            }
            setEditingIndex(null);
        } catch (error) {
            console.error('Error updating working condition:', error);
        }
    };

    const { workingConditions = [], specials = '', message = '' } = editableOffer;

    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={{ ...modalStyle }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" gutterBottom>
                        Receiver Details
                    </Typography>
                    <IconButton onClick={handleClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>
                <Box sx={{ overflowY: 'auto', maxHeight: '75vh' }}>
                    <Box display="flex" justifyContent="space-between">
                        <Typography variant="body1" component="span">
                            <strong>Receiver Name:</strong>
                        </Typography>
                        <Typography variant="body1" component="span">
                            {receiverData.serviceReceiver.firstName} {receiverData.serviceReceiver.lastName}
                        </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                        <Typography variant="body1" component="span">
                            <strong>Phone Number:</strong>
                        </Typography>
                        <Typography variant="body1" component="span">
                            {receiverData.serviceReceiver.phoneNumber}
                        </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                        <Typography variant="body1" component="span">
                            <strong>Address:</strong>
                        </Typography>
                        <Typography variant="body1" component="span">
                            {receiverData.location.street} {receiverData.location.houseNumber}, {receiverData.location.zipCode} {receiverData.location.city}, {receiverData.location.country}
                        </Typography>
                    </Box>

                    <Typography variant="h6" gutterBottom>
                        Service Request
                    </Typography>
                    <Box display="flex" justifyContent="space-between">
                        <Typography variant="body1" component="span">
                            <strong>Service Status:</strong>
                        </Typography>
                        <Typography variant="body1" component="span">
                            {receiverData.serviceStatus}
                        </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                        <Typography variant="body1" component="span">
                            <strong>Agrees to Inspection Appointment if Needed:</strong>
                        </Typography>
                        <Typography variant="body1" component="span">
                            {receiverData.agreesToInspectionAppointmentIfNeeded ? 'Yes' : 'No'}
                        </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                        <Typography variant="body1" component="span">
                            <strong>Distance:</strong>
                        </Typography>
                        <Typography variant="body1" component="span">
                            {(receiverData.distance / 1000).toFixed(2)} km
                        </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                        <Typography variant="body1" component="span">
                            <strong>Sub-Service Type:</strong>
                        </Typography>
                        <Typography variant="body1" component="span">
                            {receiverData.subServiceType}
                        </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                        <Typography variant="body1" component="span">
                            <strong>Description:</strong>
                        </Typography>
                        <Typography variant="body1" component="span">
                            {receiverData.description}
                        </Typography>
                    </Box>
                    {workingConditions.map((condition, index) => (
                        <Accordion key={index} expanded={expandedPanel === index} onChange={handlePanelChange(index)}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="body1">
                                    <strong>
                                        Working Condition #{index + 1} - {condition.date ? new Date(condition.date).toLocaleDateString() : 'No Date'}
                                    </strong>
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <TextField
                                    label="Date"
                                    type="date"
                                    value={condition.date || ''}
                                    onChange={(e) => handleInputChange(e, 'date', index)}
                                    fullWidth
                                    disabled={editingIndex !== index}
                                    margin="normal"
                                    InputLabelProps={{ shrink: true }}
                                    error={!!errors[index]?.date}
                                    helperText={errors[index]?.date}
                                />
                                <TextField
                                    label="Hourly Rate"
                                    value={condition.hourlyRate || ''}
                                    onChange={(e) => handleInputChange(e, 'hourlyRate', index)}
                                    fullWidth
                                    disabled={editingIndex !== index}
                                    margin="normal"
                                    error={!!errors[index]?.hourlyRate}
                                    helperText={errors[index]?.hourlyRate}
                                />
                                <TextField
                                    label="Expected Duration"
                                    value={condition.expectedDuration || ''}
                                    onChange={(e) => handleInputChange(e, 'expectedDuration', index)}
                                    fullWidth
                                    disabled={editingIndex !== index}
                                    margin="normal"
                                    error={!!errors[index]?.expectedDuration}
                                    helperText={errors[index]?.expectedDuration}
                                />
                                <TextField
                                    label="Expected Material Cost"
                                    value={condition.expectedMaterialCost || ''}
                                    onChange={(e) => handleInputChange(e, 'expectedMaterialCost', index)}
                                    fullWidth
                                    disabled={editingIndex !== index}
                                    margin="normal"
                                    error={!!errors[index]?.expectedMaterialCost}
                                    helperText={errors[index]?.expectedMaterialCost}
                                />
                                <TextField
                                    label="Special Conditions"
                                    value={condition.specialConditions || ''}
                                    onChange={(e) => handleInputChange(e, 'specialConditions', index)}
                                    fullWidth
                                    disabled={editingIndex !== index}
                                    margin="normal"
                                />

                                {condition.expectedAdditionalCostFactors.map((factor, subIndex) => (
                                    <Box key={subIndex} display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                                        <TextField
                                            label="Description"
                                            value={factor.description || ''}
                                            onChange={(e) => handleInputChange(e, 'description', index, subIndex)}
                                            fullWidth
                                            disabled={editingIndex !== index}
                                            margin="normal"
                                        />
                                        <TextField
                                            label="Price"
                                            type="number"
                                            value={factor.price || ''}
                                            onChange={(e) => handleInputChange(e, 'price', index, subIndex)}
                                            fullWidth
                                            disabled={editingIndex !== index}
                                            margin="normal"
                                        />
                                        {editingIndex === index && (
                                            <IconButton onClick={() => handleRemoveCostFactor(index, subIndex)}>
                                                <CloseIcon />
                                            </IconButton>
                                        )}
                                    </Box>
                                ))}
                                {editingIndex === index && (
                                    <Button variant="contained" onClick={() => handleAddCostFactor(index)}>
                                        Add Cost Factor
                                    </Button>
                                )}
                                {editingIndex === index ? (
                                    <Box display="flex" justifyContent="space-between" mt={2}>
                                        <Button variant="contained" color="primary" onClick={() => handleUpdateClick(index)}>
                                            Update
                                        </Button>
                                        <Button variant="contained" color="secondary" onClick={() => handleCancelClick(index)}>
                                            Cancel
                                        </Button>
                                    </Box>
                                ) : (
                                    <Box>
                                        <Button variant="contained" color="secondary" onClick={() => handleEditClick(index)}>
                                            Adjust
                                        </Button>
                                        <Button
                                            variant="contained"
                                            sx={{
                                                backgroundColor: '#FF0000',
                                                '&:hover': { backgroundColor: '#D00000' },
                                                ml: 2
                                            }}
                                            onClick={() => handleDeleteClick(index)}
                                        >
                                            Remove
                                        </Button>
                                    </Box>
                                )}
                            </AccordionDetails>
                        </Accordion>
                    ))}

                    <Box mt={2}>
                        <Button variant="contained" onClick={handleAddWorkingCondition}>
                            Add Working Condition
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Modal>
    );
};

export default OfferModal;
