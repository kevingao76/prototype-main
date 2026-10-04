import React from 'react';
import {
  Box,
  Typography,
  Button,
  Modal,
  IconButton,
  Link,
  Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { format, addMinutes, subHours } from "date-fns";
import { handleStringFromAddress } from '../../utils/addressUtils';
import Title from '../SupportComponents/Title';
import styled from "@emotion/styled";

const SendButton = styled(Button)`
  background-color: #FF6F00;
  color: white;

  &:hover {
    background-color: #FF8F00;
  }
`;

const SummaryModal = ({
  open,
  handleClose,
  data,
  handleSendInquiry,
  handleFinalizeInquiry
}) => {

  if (!data) {
    return null;
  }

  const renderPreRequest = () => (
    <Box sx={{ mb: 2 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>Pre Request Details</Typography>
      <Divider sx={{ mb: 2 }} />
      <Box sx={{ mb: 1 }}>
        <Typography variant="subtitle1"><strong>Service Type:</strong></Typography>
        <Typography variant="body1" sx={{ ml: 2 }}>{data.preRequest.title} - {data.preRequest.selectedSubService}</Typography>
      </Box>
      <Box sx={{ mb: 1 }}>
        <Typography variant="subtitle1"><strong>Description:</strong></Typography>
        <Typography variant="body1" sx={{ ml: 2 }}>{data.preRequest.description || '-'}</Typography>
      </Box>
      <Box sx={{ mb: 1 }}>
        <Typography variant="subtitle1"><strong>Location:</strong></Typography>
        <Typography variant="body1" sx={{ ml: 2 }}>{data.preRequest.location}</Typography>
      </Box>
      <Box sx={{ mb: 1 }}>
        <Typography variant="subtitle1"><strong>Viewing Appointment:</strong></Typography>
        <Typography variant="body1" sx={{ ml: 2 }}>{data.preRequest.viewingAppointment}</Typography>
      </Box>
      <Box sx={{ mb: 1 }}>
        <Typography variant="subtitle1"><strong>Selected Dates:</strong></Typography>
        <Typography variant="body1" sx={{ ml: 2 }}>{data.preRequest.selectedDates.map(date => format(new Date(date), "dd MMM yyyy HH:mm:ss 'GMT'")).join(', ')}</Typography>
      </Box>
      <Box>
        <Typography variant="subtitle1"><strong>Specifications:</strong></Typography>
        {Object.entries(data.preRequest.input).map(([key, value]) => (
          <Typography key={key} variant="body1" sx={{ ml: 2 }}> - {value}</Typography>
        ))}
      </Box>
    </Box>
  );

  const renderRequest = () => (
    data.request ? (
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>Request Details</Typography>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1"><strong>Service Type:</strong></Typography>
          <Typography variant="body1">{data.request.subServiceType.serviceTypeParent.title} - {data.request.subServiceType.name}</Typography>
        </Box>
        <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1"><strong>Description:</strong></Typography>
          <Typography variant="body1">{data.request.description || '-'}</Typography>
        </Box>
        <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1"><strong>Location:</strong></Typography>
          <Typography variant="body1">{handleStringFromAddress(data.request.location)}</Typography>
        </Box>
        <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1"><strong>Interested in viewing:</strong></Typography>
          <Typography variant="body1">{data.request.agreesToInspectionAppointmentIfNeeded ? "Yes" : "No"}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1"><strong>Selected Dates:</strong></Typography>
          <Typography variant="body1">{data.request.dateOptions.map(date => format(new Date(date), "dd MMM yyyy")).join(', ')}</Typography>
        </Box>
      </Box>
    ) : null
  );

  const renderConditions = () => (
    data.offer ? (
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>Conditions</Typography>
        <Divider sx={{ mb: 2 }} />
        {data.offer.viewingConditions && (
          <Box sx={{ mb: 1 }}>
            <Typography variant="subtitle1"><strong>Viewing Conditions:</strong></Typography>
            <Typography variant="body1" sx={{ ml: 2 }}>Hourly Rate: {data.offer.viewingConditions.hourlyRate}€</Typography>
            <Typography variant="body1" sx={{ ml: 2 }}>Date: {format(new Date(data.offer.viewingConditions.date), "dd MMM yyyy ")}</Typography>
            <Typography variant="body1" sx={{ ml: 2 }}>Expected Duration: {data.offer.viewingConditions.expectedDuration} min</Typography>
            <Typography variant="body1" sx={{ ml: 2 }}>Expected Material Cost: {data.offer.viewingConditions.expectedMaterialCost}€</Typography>
            <Typography variant="body1" sx={{ ml: 2 }}>Expected Travel Cost: {data.offer.viewingConditions.expectedTravelCost}€</Typography>
            <Typography variant="body1" sx={{ ml: 2 }}>Expected Overall Cost for this appointment: {data.offer.viewingConditions.expectedOverallCost}€</Typography>
            <Typography variant="body1" sx={{ ml: 2 }}>Special Conditions: {data.offer.viewingConditions.specialConditions}</Typography>
          </Box>
        )}
        {data.offer.workingConditions ? (
          <Box>
            {data.offer.workingConditions.map((condition, index) => {
              const startDate = subHours(new Date(condition.date), 2);
              const endDate = addMinutes(startDate, condition.expectedDuration);
              return (
                <Box key={index} sx={{ mb: 1 }}>
                  <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1"><strong>Condition {index + 1}:</strong></Typography>
                  </Box>
                  <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1">Appointment on:</Typography>
                    <Typography variant="body1">{format(startDate, "dd MMM yyyy HH:mm")} - {format(endDate, "HH:mm")}</Typography>
                  </Box>
                  <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1">Hourly Rate:</Typography>
                    <Typography variant="body1">{condition.hourlyRate}€</Typography>
                  </Box>
                  <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1">Expected Duration:</Typography>
                    <Typography variant="body1">{condition.expectedDuration} min</Typography>
                  </Box>
                  <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1">Expected Material Cost:</Typography>
                    <Typography variant="body1">{condition.expectedMaterialCost}€</Typography>
                  </Box>
                  <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1">Expected Travel Cost:</Typography>
                    <Typography variant="body1">{condition.expectedTravelCost}€</Typography>
                  </Box>
                  <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1">Additional Costs:</Typography>
                  </Box>
                  {condition.expectedAdditionalCostFactors.length > 0 ? (
                    condition.expectedAdditionalCostFactors.map((cost, costIndex) => (
                      <Box key={costIndex} sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', pl: 4 }}>
                        <Typography variant="body2">{cost.description}:</Typography>
                        <Typography variant="body2">{cost.price.toFixed(2)}€</Typography>
                      </Box>
                    ))
                  ) : (
                    <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', pl: 4 }}>
                      <Typography variant="body2">None</Typography>
                    </Box>
                  )}
                  <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1">Expected Overall Cost for this appointment:</Typography>
                    <Typography variant="body1">{condition.expectedOverallCost.toFixed(2)}€</Typography>
                  </Box>
                  <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1">Special Conditions:</Typography>
                    <Typography variant="body1">{condition.specialConditions}</Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        ) : 'Not created yet.'}
        <Box sx={{ mb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6"><strong>Expected overall costs:</strong></Typography>
            <Typography variant="body1">{data.offer.expectedOverallCost.toFixed(2)}€</Typography>
          </Box>
        </Box>
        <Box>
          <Typography variant="h6"><strong>Communications:</strong></Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="body1" sx={{ ml: 2 }}>{data.offer.message}</Typography>
          <Typography variant="body1" sx={{ ml: 2 }}>Special Terms to consider in general: {data.offer.specials ? data.offer.specials : 'None'}</Typography>
        </Box>
      </Box>
    ) : null
  );

  const renderBooking = () => (
    data.booking ? (
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>Booking Summary</Typography>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ mb: 1 }}>
          <Typography variant="subtitle1"><strong>Final Hours:</strong></Typography>
          <Typography variant="body1" sx={{ ml: 2 }}>{data.booking.finalHours}</Typography>
        </Box>
        <Box sx={{ mb: 1 }}>
          <Typography variant="subtitle1"><strong>Final Costs:</strong></Typography>
          <Typography variant="body1" sx={{ ml: 2 }}>{data.booking.finalOverallCost}</Typography>
        </Box>
        <Box sx={{ mb: 1 }}>
          <Typography variant="subtitle1"><strong>Appointments on:</strong></Typography>
          {data.booking.appointmentsHappened.map((date, index) => (
            <Typography key={index} variant="body1" sx={{ ml: 2 }}>{format(new Date(date), "dd MMM yyyy HH:mm:ss 'GMT'")}</Typography>
          ))}
        </Box>
        <Box sx={{ mb: 1 }}>
          <Typography variant="subtitle1"><strong>Date of finalization:</strong></Typography>
          <Typography variant="body1" sx={{ ml: 2 }}>{data.booking.finishedDate}</Typography>
        </Box>
        <Box>
          <Typography variant="subtitle1"><strong>Invoice:</strong></Typography>
          <Typography variant="body1" sx={{ ml: 2 }}>Invoice Status: {data.booking.payment.invoiceStatus}</Typography>
          <Link href={data.booking.payment.invoiceUrl} target="_blank" rel="noopener" sx={{ ml: 2 }}>To your invoice</Link>
        </Box>
      </Box>
    ) : null
  );

  const renderCancellation = () => (
    data.request ? (
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>Cancellation</Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body1"><strong>This service has been closed by {data.request.receiverDecline ? `${data.request.serviceReceiver.firstName} ${data.request.serviceReceiver.lastName}` : data.request.serviceProvider.companyName}.</strong></Typography>
        <Typography variant="body2" sx={{ ml: 2 }}>{!data.request.declineReason || data.request.declineReason === '' ? "No reasoning was given" : `The stated reason was \"${data.request.declineReason}\"`}</Typography>
      </Box>
    ) : null
  );

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80%',
          maxWidth: 600,
          maxHeight: '80vh',
          bgcolor: 'background.paper',
          border: '2px solid #000',
          boxShadow: 24,
          p: 4,
          overflowY: 'auto',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box textAlign="center" my={2}>
            <Title text={'Overview'} textAlign={'center'} />
          </Box>

          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Typography variant="h6" sx={{ mb: 1 }}>Status: {data.currentState}</Typography>
        <Divider sx={{ mb: 2 }} />

        {data.currentState === 'Pre Request' && renderPreRequest()}
        {['Request Initiated', 'Request Sent', 'Offer Filled', 'Offer Sent', 'Job Agreed', 'Work in Progress'].includes(data.currentState) && renderRequest()}
        {['Offer Filled', 'Offer Sent', 'Job Agreed', 'Work in Progress'].includes(data.currentState) && renderConditions()}
        {['Payment Pending', 'Completed'].includes(data.currentState) && (
          <>
            {renderRequest()}
            {renderConditions()}
            {renderBooking()}
          </>
        )}
        {data.currentState === 'Cancelled' && renderCancellation()}

        {data.currentState === 'Pre Request' && (
          <>
            <Button onClick={handleSendInquiry} variant="contained" color="primary" sx={{ mt: 2, mr: 1 }}>
              Save
            </Button>
            <SendButton onClick={handleFinalizeInquiry} variant="contained" color="secondary" sx={{ mt: 2 }}>
              Send
            </SendButton>
          </>
        )}
      </Box>
    </Modal>
  );
};

export default SummaryModal;
