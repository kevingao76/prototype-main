import { fetchLogIn } from "../components/AuthContext";
import axios from "axios";
import { handleStringFromAddress } from "./addressUtils";

// fetch provider data
export const fetchProviderData = async (setUserData, setLoading, setError) => {
  setLoading(true);
  try {
    const response = await fetchLogIn();
    const provider = response.data;

    let base64ImageSrc = '';
    const token = localStorage.getItem('logInInfo');
    let bearerToken = "Bearer ";
    bearerToken += token;

    if (provider.profileImage) {
      const binaryImageResponse = await axios.get(`/files/get/${provider.profileImage}`, {
        responseType: 'arraybuffer',
        headers: {
          Authorization: bearerToken
        }
      });
      const base64String = arrayBufferToBase64(binaryImageResponse.data);
      base64ImageSrc = `data:image/jpeg;base64,${base64String}`;
    } else {
      console.log('No profile image available for this provider.');
    }

    const providerAddress = response.data.address;
    setUserData(prevUserData => ({
      ...prevUserData,
      id: provider._id,
      companyName: provider.companyName,
      phone: provider.phoneNumber,
      address: handleStringFromAddress(providerAddress),
      email: provider.logIn.email,
      password1: '',
      password2: '',
      hasEnabledAds: Boolean(provider.hasEnabledAds),
      serviceRadius: provider.serviceRadius || 0,
      travelKilometerConstant: provider.travelKilometerConstant || 0,
      description: provider.description || '',
      subServiceTypes: provider.subServiceTypes || [], // Fetch and set subServiceTypes
      paymentInformation: '',
      profileImage: base64ImageSrc,
      license: provider.license,
      googleCalendarId: provider.googleCalendar
    }));
  } catch (err) {
    console.error(err);
    setError('Failed to fetch user data.');
  } finally {
    setLoading(false);
  }
};

function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Validate provider data
export const validateProviderData = (userData) => {
  let temp = {};
  temp.companyName = userData.companyName ? '' : 'This field is required.';
  temp.email = /$^|.+@.+..+/.test(userData.email) ? '' : 'Email is not valid.';
  temp.phone = userData.phone.length > 9 ? '' : 'Minimum 10 numbers required.';
  temp.address = userData.address ? '' : 'This field is required.';
  temp.password1 = userData.password1 === userData.password2 ? '' : 'Please ensure both password inputs match.';
  temp.paymentInformation = /^(?:acct_[A-Za-z0-9]{16})?$/.test(userData.paymentInformation) ? '' : 'Invalid Stripe account ID.';

  return {
    errors: temp,
    isValid: Object.values(temp).every((x) => x === ''),
  };
};

// Fetches service receiver data
export const fetchReceiverData = async (setUserData, setLoading, setError) => {
  setLoading(true);
  try {
    const response = await fetchLogIn();
    const receiver = response.data;

    let base64ImageSrc = '';
    const token = localStorage.getItem('logInInfo');
    let bearerToken = "Bearer ";
    bearerToken += token;

    if (receiver.profileImage) {
      const binaryImageResponse = await axios.get(`/files/get/${receiver.profileImage}`, {
        responseType: 'arraybuffer',
        headers: {
          Authorization: bearerToken
        }
      });
      const base64String = arrayBufferToBase64(binaryImageResponse.data);
      base64ImageSrc = `data:image/jpeg;base64,${base64String}`;
    } else {
      console.log('No profile image available for this user.');
    }

    const receiverAddress = response.data.address;
    setUserData({
      id: receiver._id,
      firstName: receiver.firstName,
      lastName: receiver.lastName,
      email: receiver.logIn.email,
      phone: receiver.phoneNumber,
      address: handleStringFromAddress(receiverAddress),
      preferredPaymentMethod: receiver.preferredPaymentMethod || '',
      hasEnabledAds: Boolean(receiver.hasEnabledAds),
      profileImage: base64ImageSrc || null,
      password1: '',
      password2: '',
    });
  } catch (err) {
    console.error(err);
    setError('Failed to fetch user data.');
  } finally {
    setLoading(false);
  }
};

// Validate provider data
export const validateReceiverData = (userData, setErrors) => {
  let temp = {};
  temp.firstName = userData.firstName ? '' : 'This field is required.';
  temp.lastName = userData.lastName ? '' : 'This field is required.';
  temp.email = /$^|.+@.+..+/.test(userData.email) ? '' : 'Email is not valid.';
  temp.phone = userData.phone.length > 9 ? '' : 'Minimum 10 numbers required.';
  temp.address = userData.address ? '' : 'This field is required.';
  temp.password1 = userData.password1 === userData.password2 ? '' : 'Please ensure both password inputs match.';
  setErrors(temp);

  return Object.values(temp).every((x) => x === '');
};

export default { fetchProviderData, validateProviderData, fetchReceiverData, validateReceiverData };
