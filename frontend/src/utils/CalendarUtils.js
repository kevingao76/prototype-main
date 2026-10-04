import axios from 'axios';
import { fetchLogIn } from "../components/AuthContext";

const fetchServiceStatus = async (conditionId) => {
    try {
        // Find service offer with this service condition id
        const response = await axios.get('/serviceOffers/getAll');
        const matchedOffer = response.data.find(offer =>
            offer.workingConditions.some(condition => condition._id === conditionId)
        );
        if (matchedOffer) {
            // Fetch receiver id
            const fetchedServiceStatus = matchedOffer.serviceRequest.serviceStatus;
            return fetchedServiceStatus;
        }
    } catch (error) {
        console.error('Error fetching service offer or receiver:', error);
        return null;
    }
};

export const fetchProviderBookings = async (conditions) => {
    try {
        // Fetch data from logged in service provider
        const logInResponse = await fetchLogIn();
        const serviceProvider = logInResponse.data._id;
        const serviceConditions = await axios.get(`/serviceProviders/condition_by_provider_id/${serviceProvider}`);

        // Fetch receiver details and service status for each service condition
        const receiverAndStatusPromises = serviceConditions.data.map(async (condition) => {
            const response = await axios.get(`/serviceConditions/OfferByConditionId/${condition._id}`);
            const matchedOffer = response.data;
            

            if (matchedOffer) {
                const receiver = matchedOffer.serviceRequest.serviceReceiver;
                const serviceStatus = matchedOffer.serviceRequest.serviceStatus;
                return { condition, receiver, serviceStatus };
            }

            return { condition, receiver: null, serviceStatus: null };
        });

        const conditionsWithReceiversAndStatus = await Promise.all(receiverAndStatusPromises);

        // Map to event format
        const events = conditionsWithReceiversAndStatus.map(({ condition, receiver, serviceStatus }) => {
            // Skip the event if the service status is 'offer sent'
            if (serviceStatus === 'Offer Sent' ) {
                return null;
            }

            // Determine background color based on service status
            let backgroundColor = 'blue';
            if (serviceStatus === 'Cancelled') {
                backgroundColor = 'red';
            } else if (serviceStatus === 'Job Agreed' || serviceStatus === 'Work in Progress') {
                backgroundColor = 'orange';
            } else if (serviceStatus === "Payment Pending") {
                backgroundColor = 'green';
            } else if (serviceStatus === 'Completed') {
                backgroundColor = 'gray';
            }

            return {
                title: `${receiver.firstName} ${receiver.lastName}`,
                date: condition.date,
                conditions: condition,
                backgroundColor: backgroundColor
            };
        }).filter(event => event !== null); // Filter out null events

        return events;

    } catch (error) {
        console.error('Error fetching bookings:', error);
        return [];
    }
};

export const fetchReceiverBookings = async (conditions) => {
    try {
        // Fetch data from logged in service provider
        const logInResponse = await fetchLogIn();
        const serviceReceiver = logInResponse.data._id;
        const serviceConditions = await axios.get(`/serviceReceivers/condition_by_receiver_id/${serviceReceiver}`);

        // Fetch receiver details and service status for each service condition
        const serviceConditionsWithStatusPromises = serviceConditions.data.map(async (condition) => {
            const response = await axios.get(`/serviceConditions/OfferByConditionId/${condition._id}`);
            const matchedOffer = response.data;

            if (matchedOffer) {
                const provider = matchedOffer.serviceRequest.serviceProvider;
                const serviceStatus = matchedOffer.serviceRequest.serviceStatus;
                return { condition, provider, serviceStatus };
            }

            return { condition, provider: null, serviceStatus: null };
        });


        const serviceConditionsWithStatus = await Promise.all(serviceConditionsWithStatusPromises);

        // Get current date
        const currentDate = new Date();

        // Map to event format
        const events = serviceConditionsWithStatus.map(condition => {
            // Determine background color based on service status
            let backgroundColor = 'blue';
            if (condition.serviceStatus === 'Cancelled') {
                backgroundColor = 'red';
            } else if (condition.serviceStatus === 'Job Agreed' || condition.serviceStatus === 'Work in Progress') {
                backgroundColor = 'orange';
            } else if (condition.serviceStatus === "Payment Pending") {
                backgroundColor = 'green';
            } else if (condition.serviceStatus === 'Completed') {
                backgroundColor = 'gray';
            } else if(condition.serviceStatus === 'Offer Sent') {
                backgroundColor = 'yellow';
            }

            return {
                title: condition.provider ? condition.provider.companyName : condition._id,
                date: condition.condition.date,
                conditions: condition.condition,
                backgroundColor: backgroundColor
            };
        }).filter(event => event !== null);

        return events;

    } catch (error) {
        console.error('Error fetching bookings:', error);
        return [];
    }
};
