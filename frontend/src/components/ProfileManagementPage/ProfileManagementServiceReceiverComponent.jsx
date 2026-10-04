import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  CircularProgress,
  Alert as MuiAlert,
  styled,
  Snackbar,
  Box,
  Avatar,
  IconButton,
  FormControlLabel,
  FormGroup,
  ButtonGroup,
  InputAdornment,
  Checkbox
} from '@mui/material';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { fetchReceiverData, validateReceiverData } from '../../utils/UserDataUtils';
import Title from '../SupportComponents/Title';
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
    firstName: '',
    lastName: '',
    email: '',
    password1: '',
    password2: '',
    phone: '',
    address: '',
    preferredPaymentMethod: '',
    profileImage: '',
    hasEnabledAds: false,
  });

  const [file, setFile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const topRef = useRef(null);


  //Fetches receiver data when the component mounts.
  useEffect(() => {
    fetchReceiverData(setUserData, setLoading, setError);
  }, []);

  /**
   * This function checks if the password meets the following criteria:
   * - Contains at least one number.
   * - Contains at least one special character from the set [!@#$%^&*].
   * - Has a minimum length of 8 characters.
   *
   * @returns {boolean} - Returns true if the password meets the criteria, otherwise false.
   */
  const validatePassword = (password) => {
    const passwordPattern = /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    return passwordPattern.test(password);
  };

  /**
   * This function checks if the email address follows a general pattern for valid email addresses:
   * - Begins with alphanumeric characters, periods, underscores, or hyphens.
   * - Followed by the '@' symbol.
   * - Contains a domain name with alphanumeric characters and periods.
   * - Ends with a top-level domain (TLD) that is 2 to 6 characters long.
   *
   * @returns {boolean} - Returns true if the email address meets the criteria, otherwise false.
   */
  const validateEmail = (email) => {
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailPattern.test(email);
  };

  //Handles changes in form input fields and updates state accordingly.
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

    if (name === 'email') {
      setErrors((prevErrors) => ({
        ...prevErrors,
        email: validateEmail(value) ? '' : 'Email is not valid',
      }));
    }

    if (name === 'address') {
      setErrors((prevErrors) => ({
        ...prevErrors,
        address: parseAddress(value, {}) ? '' : 'Invalid address format'
      }));
    }
  };

  //Handles changes to the phone number input field and updates state accordingly.
  const handlePhoneChange = (value) => {
    setUserData((prevData) => ({
      ...prevData,
      phone: value,
    }));
  };

  //Handles changes to the address input field and updates state accordingly.
  const handleAddressChange = (newAddress) => {
    setUserData((prevData) => ({
      ...prevData,
      address: newAddress,
    }));
  };

  //enables edit mode for profile
  const handleEdit = () => {
    setEditMode(true);
  };

  //handles cancellation and makes sure that the last user data reset the form
  const handleCancel = () => {
    setEditMode(false);
    setError('');
    setErrors({});
    fetchReceiverData(setUserData, setLoading, setError);
  };

  //toggles password visibility
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  //Prevents the default action for the mouse down event on the password visibility toggle button.
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  /**
   * Handles the save action for updating user profile data.
   *
   * This function validates the user data, parses the address, constructs the payload, uploads the profile image if present,
   * and updates the service receiver's profile. If successful, it exits edit mode and shows a success message.
   * If there's an error, it sets appropriate error messages.
   */
  const handleSave = async () => {
    if (!validateReceiverData(userData, setErrors)) return;

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

    let payload = {
      serviceReceiverId: userData.id,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phoneNumber: userData.phone,
      address: address,
      hasEnabledAds: userData.hasEnabledAds
    };
    console.log('Payload:', payload);

    if (userData.password1) {
      payload = {
        ...payload,
        password: userData.password1,
      };
    }
    if (userData.preferredPaymentMethod) {
      payload = {
        ...payload,
        preferredPaymentMethod: userData.preferredPaymentMethod,
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
      const response = await axios.put('/serviceReceivers/update', payload);
      console.log('Update successful:', response.data);
      setError('');
      setEditMode(false);
      setSuccessMessage(true);
    } catch (error) {
      console.error('Error updating service receiver:', error);
      if (error.response && error.response.data && error.response.data.error && error.response.data.error.includes('E11000')) {
        setError('The email address you have entered is already in use. Please choose a different email.');
        setErrors((prevErrors) => ({ ...prevErrors, email: 'The email address is already in use.' }));
      } else {
        setError('Failed to update service receiver.');
      }
      topRef.current.scrollIntoView({ behavior: 'smooth' }); // Scroll to the top when an error occurs
    }
    fetchReceiverData(setUserData, setLoading, setError);
  };

  //Handles the profile picture change event.
  const handleProfilePictureChange = (event) => {
    const file = event.target.files[0];

    // Validate file type (only images are allowed)
    if (file && !file.type.startsWith('image/')) {
      setSnackbarMessage('Only image files are allowed.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    // Validate file size (3MB = 3 * 1024 * 1024 bytes)
    const maxSizeInBytes = 3 * 1024 * 1024;
    if (file && file.size > maxSizeInBytes) {
      setSnackbarMessage('File size should not exceed 3MB.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setUserData({ ...userData, profileImage: reader.result });
      };
      reader.readAsDataURL(file);
    }
    setFile(file);
  };

  //Handles the snackbar message closing when someone "clicked away"
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
    setSnackbarMessage('');
    setSnackbarSeverity('info');
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ textAlign: 'center', marginTop: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth={false} sx={{ backgroundColor: '#f6f6f6', px: 5, py: 5 }}>
      <Box ref={topRef} textAlign="center" >
        <Title text="Profile Management" textAlign="center" />
      </Box>
      <ProfilePaper>
        <Grid container spacing={3}>
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Avatar
              src={userData.profileImage}
              alt="Profile Picture"
              sx={{ width: 120, height: 120 }}
            />
          </Grid>
          {editMode && (
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="profile-picture-upload"
                type="file"
                onChange={handleProfilePictureChange}
              />
              <label htmlFor="profile-picture-upload">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <IconButton color="primary" component="span">
                    <PhotoCamera />
                  </IconButton>
                  <Typography variant="body2" color="textSecondary">
                    Upload or change your profile picture
                  </Typography>
                </Box>
              </label>
            </Grid>
          )}
          <Grid item xs={12} sm={6}>
            <TextField
              label="First Name"
              name="firstName"
              value={userData.firstName}
              onChange={handleChange}
              fullWidth
              disabled={!editMode}
              {...(errors.firstName && { error: true, helperText: errors.firstName })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Last Name"
              name="lastName"
              value={userData.lastName}
              onChange={handleChange}
              fullWidth
              disabled={!editMode}
              {...(errors.lastName && { error: true, helperText: errors.lastName })}
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
              {...(errors.email && { error: true, helperText: errors.email })}
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
      <Snackbar open={successMessage} autoHideDuration={3000} onClose={handleSnackbarClose}>
        <AlertSnackbar onClose={handleSnackbarClose} severity="success">
          Profile updated successfully!
        </AlertSnackbar>
      </Snackbar>
      <Snackbar open={(error !== '')} autoHideDuration={3000} onClose={handleSnackbarClose}>
        <AlertSnackbar onClose={handleSnackbarClose} severity="error">
          {error}
        </AlertSnackbar>
      </Snackbar>
      <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={handleSnackbarClose}>
        <AlertSnackbar onClose={handleSnackbarClose} severity={snackbarSeverity}>
          {snackbarMessage}
        </AlertSnackbar>
      </Snackbar>
    </Container >
  );
}

export default ProfileManagement;
