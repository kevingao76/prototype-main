import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  CircularProgress,
  Alert as MuiAlert,
  Slider,
  styled,
  Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
  ButtonGroup,
  InputAdornment,
  IconButton,
  Link
} from '@mui/material';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import Title from '../SupportComponents/Title';
import ServicesProfileList from './ServiceCategoriesProfileList';
import axios from 'axios';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { fetchProviderData, validateProviderData } from '../../utils/UserDataUtils';
import SnackbarMessage from '../SupportComponents/SnackbarMessage';
import ProfilePictureUpload from './ProfilePictureUpload';
import { parseAddress } from '../../utils/addressUtils';

const ProfilePaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(4),
  backgroundColor: '#f6f6f6',
  maxWidth: '800px',
  marginLeft: 'auto',
  marginRight: 'auto'
}));

const AlertSnackbar = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function ProfileManagement() {
  const [userData, setUserData] = useState({
    id: '',
    companyName: '',
    email: '',
    password1: '',
    password2: '',
    phone: '',
    address: '',
    serviceRadius: 0,
    profileImage: '',
    hasEnabledAds: false,
    travelKilometerConstant: 0,
    description: '',
    subServiceTypes: [],
    license: '',
    paymentInformation: '',
    googleCalendarId: '',
  });
  const [file, setFile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showPaymentInformation, setShowPaymentInformation] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  const topRef = useRef(null);

  useEffect(() => {
    fetchProviderData(setUserData, setLoading, setError);
  }, []);

  useEffect(() => {
    if (userData.license) {
      fetchProviderLicense(userData.license, setUserData, setError);
    }
  }, [userData.license]);

  const fetchProviderLicense = async (license, setUserData, setError) => {
    try {
      const response = await axios.get(`/files/get/${license}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      setUserData((prevData) => ({
        ...prevData,
        licenseUrl: url
      }));
    } catch (error) {
      console.error('Error fetching provider license:', error);
      setError('Failed to fetch provider license.');
    }
  };

  const validatePassword = (password) => {
    const passwordPattern = /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    return passwordPattern.test(password);
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (name === 'password1') {
      setErrors((prevErrors) => ({
        ...prevErrors,
        password1: validatePassword(value) ? '' : 'Password must be at least 8 characters and contain at least one special character and one number',
      }));
    }

    if (name === 'password2') {
      setErrors((prevErrors) => ({
        ...prevErrors,
        password2: value === userData.password1 ? '' : 'Passwords do not match',
      }));
    }
  };

  const handlePhoneChange = (value) => {
    setUserData((prevData) => ({
      ...prevData,
      phone: value,
    }));
  };

  const handleRangeChange = (event, newValue) => {
    setUserData({ ...userData, serviceRadius: newValue });
  };

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditMode(false);
    setError('');
    setErrors({});
    fetchProviderData(setUserData, setLoading, setError);
  };

  const formattedSubServiceTypes = (subServiceTypes) => {
    const formattedSubServiceTypes = [];
    for (const subServiceType of subServiceTypes) {
      formattedSubServiceTypes.push({ parentName: subServiceType.serviceTypeParent, name: subServiceType.name });
    }
    return formattedSubServiceTypes;
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowPaymentInformation = () => {
    setShowPaymentInformation(!showPaymentInformation);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleMouseDownPaymentInformation = (event) => {
    event.preventDefault();
  };

  const handleSubServiceTypesChange = (newSubServiceTypes) => {
    setUserData((prevData) => ({
      ...prevData,
      subServiceTypes: newSubServiceTypes,
    }));
  };

  const handleSave = async () => {
    const validation = validateProviderData(userData); // Use the imported validateProviderData function
    setErrors(validation.errors);

    let address = ''
    try{
      address = parseAddress(userData.address, {});
    } catch (error) {
      console.error('Error parsing address:', error);
      setError('Invalid address format. Please enter a valid address.');
      setErrors((prevErrors) => ({ ...prevErrors, address: 'Invalid address format.' }));
      return;
    }
    console.log('Parsed address:', address);

    if (!validation.isValid) return;

    let payload = {
      serviceProviderId: userData.id,
      companyName: userData.companyName,
      description: userData.description,
      email: userData.email,
      serviceRadius: userData.serviceRadius,
      hasEnabledAds: userData.hasEnabledAds,
      travelKilometerConstant: userData.travelKilometerConstant,
      phoneNumber: userData.phone,
      profileImage: userData.profilePicture,
      address: address,
      subServiceTypes: formattedSubServiceTypes(userData.subServiceTypes),
      paymentInformation: userData.paymentInformation,
      googleCalendar: userData.googleCalendarId, // Updated key name
    };

    if (userData.password1) {
      payload = {
        ...payload,
        password: userData.password1,
      };
    }
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await axios.post('/files/upload', formData);

      if (res.data && res.data.fileId) {
        payload.profileImage = res.data.fileId;
      } else {
        console.error('No fileId in response:', res);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
    try {
      console.log("pay", payload)
      const response = await axios.put('/serviceProviders/update', payload);
      console.log('Update successful:', response.data);
      setError('');
      setEditMode(false);
      setSuccessMessage(true);
    } catch (error) {
      console.error('Error updating service provider:', error);
      if (error.response && error.response.data && error.response.data.error && error.response.data.error.includes('E11000')) {
        setError('The email address you have entered is already in use. Please choose a different email.');
        setErrors((prevErrors) => ({ ...prevErrors, email: 'The email address is already in use.' }));
      } else {
        setError('Failed to update service provider.');
      }
      topRef.current.scrollIntoView({ behavior: 'smooth' }); // Scroll to the top when an error occurs
    }

    await fetchProviderData(setUserData, setLoading, setError);
  };

  const handleProfilePictureChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        setUserData((prevData) => ({
          ...prevData,
          profileImage: reader.result
        }));
      };
      reader.readAsDataURL(selectedFile);
    }
    setFile(selectedFile);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSuccessMessage(false);
    setError('');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }
  return (
    <Container sx={{ backgroundColor: '#f6f6f6', px: 5, py: 5, minHeight: '100vh' }}>
      <Box ref={topRef} textAlign="center" >
        <Title text="Profile Management" textAlign="center" />
      </Box>
      <ProfilePaper>
        <Grid className="step1" container spacing={3}>
          <ProfilePictureUpload
            profileImage={userData.profileImage}
            handleProfilePictureChange={handleProfilePictureChange}
            editMode={editMode}
          />
          <Grid item xs={12}>
            <TextField
              label="Company Name"
              name="companyName"
              value={userData.companyName}
              onChange={handleChange}
              fullWidth
              disabled={!editMode}
              {...(errors.companyName && { error: true, helperText: errors.companyName })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Email"
              name="email"
              value={userData.email}
              onChange={handleChange}
              fullWidth
              disabled={!editMode}
              error={Boolean(errors.email)}
              helperText={errors.email}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            {editMode ? (
              <PhoneInput
                country={'de'}
                value={userData.phone}
                onChange={handlePhoneChange}
                inputProps={{
                  name: 'phone',
                  required: true,
                  autoFocus: true,
                }}
                containerStyle={{
                  marginBottom: '10px',
                  width: '100%',
                  position: 'relative'
                }}
                inputStyle={{
                  width: '100%',
                  height: '56px',
                  padding: '0 14px',
                  borderRadius: '4px',
                  border: '1px solid #c4c4c4',
                  paddingLeft: '58px',
                  backgroundColor: 'transparent'
                }}
                buttonStyle={{
                  backgroundColor: 'transparent',
                  borderColor: '#c4c4c4',
                  borderRadius: '4px 0 0 4px',
                  height: '56px',
                  width: '56px',
                  position: 'absolute',
                }}
              />
            ) : (
              <TextField
                label="Phone"
                name="phone"
                value={userData.phone}
                onChange={handleChange}
                fullWidth
                disabled={!editMode}
                {...(errors.phone && { error: true, helperText: errors.phone })}
              />
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Password"
              name="password1"
              type={showPassword ? 'text' : 'password'}
              value={userData.password1}
              onChange={handleChange}
              fullWidth
              disabled={!editMode}
              error={Boolean(errors.password1)}
              {...(errors.password1 && { error: true, helperText: errors.password1 })}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Repeated Password"
              name="password2"
              type={showPassword ? 'text' : 'password'}
              value={userData.password2}
              onChange={handleChange}
              fullWidth
              disabled={!editMode}
              error={Boolean(errors.password2)}
              {...(errors.password2 && { error: true, helperText: errors.password2 })}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Address"
              name="address"
              value={userData.address}
              onChange={handleChange}
              fullWidth
              disabled={!editMode}
              {...(errors.address && { error: true, helperText: errors.address })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Payment Information"
              name="paymentInformation"
              type={showPaymentInformation ? 'text' : 'password'}
              value={userData.paymentInformation}
              onChange={handleChange}
              fullWidth
              disabled={!editMode}
              error={Boolean(errors.paymentInformation)}
              {...(errors.paymentInformation && { error: true, helperText: errors.paymentInformation })}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle paymentInformation visibility"
                      onClick={handleClickShowPaymentInformation}
                      onMouseDown={handleMouseDownPaymentInformation}
                      edge="end"
                    >
                      {showPaymentInformation ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Flat rate per kilometer"
              name="travelKilometerConstant"
              value={userData.travelKilometerConstant}
              onChange={handleChange}
              type="number"
              fullWidth
              inputProps={{ step: "0.01" }}
              disabled={!editMode}
              {...(errors.travelKilometerConstant && { error: true, helperText: errors.travelKilometerConstant })}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Description"
              name="description"
              value={userData.description}
              onChange={handleChange}
              fullWidth
              multiline
              rows={4}
              disabled={!editMode}
              {...(errors.description && { error: true, helperText: errors.description })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Google Calendar ID"
              name="googleCalendarId"
              value={userData.googleCalendarId}
              onChange={handleChange}
              fullWidth
              disabled={!editMode}
              error={Boolean(errors.googleCalendarId)}
              helperText={errors.googleCalendarId}
            />
          </Grid>
          <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body1" gutterBottom sx={{ marginRight: 2 }}>
              Your License:
            </Typography>
            {userData.licenseUrl ? (
              <Link href={userData.licenseUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="contained" color="primary">
                  Download License
                </Button>
              </Link>
            ) : (
              <Typography variant="body2" color="textSecondary">
                No license available.
              </Typography>
            )}
          </Grid>
          <Grid item xs={12}>
            <FormGroup row>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={userData.hasEnabledAds}
                    onChange={handleChange}
                    name="hasEnabledAds"
                    color="primary"
                    disabled={!editMode}
                  />
                }
                label="Do you want to see ads?"
              />
            </FormGroup>
          </Grid>
        </Grid>
        <Grid>
          <Grid className="step2" item xs={12}>
            <ServicesProfileList
              editMode={editMode}
              subServiceTypes={userData.subServiceTypes}
              onSubServiceTypesChange={handleSubServiceTypesChange}
            />
          </Grid>
          <Grid className="step3" item xs={12}>
            <Typography gutterBottom>
              Service Range (km): {userData.serviceRadius}
            </Typography>
            <Slider
              value={userData.serviceRadius || 0} // Ensure value is always defined
              onChange={handleRangeChange}
              aria-labelledby="service-range-slider"
              valueLabelDisplay="auto"
              step={1}
              marks
              min={1}
              max={100}
              disabled={!editMode}
            />
          </Grid>
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            {editMode ? (
              <ButtonGroup>
                <Button variant="contained" color="primary" onClick={handleSave}>
                  Save
                </Button>
                <Button variant="outlined" color="primary" onClick={handleCancel}>
                  Cancel
                </Button>
              </ButtonGroup>
            ) : (
              <Button variant="outlined" color="primary" onClick={handleEdit}>
                Edit
              </Button>
            )}
          </Grid>
        </Grid>
      </ProfilePaper>
      <SnackbarMessage open={successMessage} onClose={handleSnackbarClose} message="Profile updated successfully!" severity="success" />
      <SnackbarMessage open={error !== ''} onClose={handleSnackbarClose} message={error} severity="error" />
    </Container>
  );
}

export default ProfileManagement;
