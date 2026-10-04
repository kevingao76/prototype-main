import React, { useState, useEffect, useContext } from 'react';
import {
    Container,
    Box,
    Button,
    Checkbox,
    Divider,
    FormControlLabel,
    TextField,
    Typography,
    Snackbar,
    Alert,
    Grid,
    IconButton,
    Autocomplete,
    useMediaQuery,
    useTheme
} from '@mui/material';
import PhoneInput from 'react-phone-input-2';
import { AuthContext } from '../AuthContext';
import 'react-phone-input-2/lib/style.css';
import SignUpJourney from '../../assets/signUpJourney.png';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteIcon from '@mui/icons-material/Delete';
import { useGeoapify } from '../../utils/useGeoapifyAPI';
import { parseAddress } from '../../utils/addressUtils';
import Title from '../SupportComponents/Title';
import SignUpSuccessModal from './SignUpSuccessModal';
import axios from "axios";
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { InputAdornment } from '@mui/material';


export default function SignUpForm({ isServiceProvider }) {
    const [formValues, setFormValues] = useState({
        firstName: '',
        lastName: '',
        companyName: '',
        phoneNumber: '',
        email: '',
        address: '',
        country: '',
        city: '',
        street: '',
        houseNumber: '',
        zipCode: '',
        password: '',
        confirmPassword: '',
        hasEnabledAds: false,
        serviceProvider: isServiceProvider,
        license: null,
    });

    const [touchedFields, setTouchedFields] = useState({});
    const [isFormValid, setIsFormValid] = useState(false);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [pdfFile, setPdfFile] = useState(null);
    const [pdfError, setPdfError] = useState('');
    const { registerServiceReceiver, registerServiceProvider } = useContext(AuthContext);
    const [openModal, setOpenModal] = useState(false);
    const { setAutocompleteSuggestions, autocompleteSuggestions, addressError, fetchAutocompleteSuggestions, validateAddress } = useGeoapify();
    const theme = useTheme();
    const isMediumOrLarger = useMediaQuery(theme.breakpoints.up('lg'));
    const [showPassword, setShowPassword] = useState(false);


  const handleChange = (event) => {
        const { name, value, checked, type } = event.target;
        setFormValues({
            ...formValues,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleBlur = (event) => {
        const { name } = event.target;
        setTouchedFields({
            ...touchedFields,
            [name]: true,
        });
    };

    const handlePhoneChange = (value) => {
        setFormValues({
            ...formValues,
            phoneNumber: value,
        });
    };

    const handlePdfChange = (event) => {
        const file = event.target.files[0];
        if (file && file.type === 'application/pdf') {
            setPdfFile(file);
            setPdfError('');
        } else {
            setPdfFile(null);
            setPdfError('Please upload a valid PDF file.');
        }
    };

    const handlePdfDelete = () => {
        setPdfFile(null);
    };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (event) => {
        event.preventDefault();
        if (isServiceProvider && pdfFile) {
            if (pdfFile.type !== "application/pdf") {
                setSnackbarMessage('Only PDF files are allowed.');
                setSnackbarSeverity('error');
                setOpenSnackbar(true);
                return;
            }

            // Validate file size (3MB = 3 * 1024 * 1024 bytes)
            const maxSizeInBytes = 3 * 1024 * 1024;
            if (pdfFile.size > maxSizeInBytes) {
                setSnackbarMessage('File size should not exceed 3MB.');
                setSnackbarSeverity('error');
                setOpenSnackbar(true);
                return;
            }
            const formData = new FormData();
            formData.append('file', pdfFile);
            try {
                const res = await axios.post('/files/upload', formData);
                console.log("Response ", res);
                if (res.data && res.data.fileId) {
                    formValues.license = res.data.fileId;
                } else {
                    console.error('No fileId in response:', res);
                }
            } catch (error) {
                console.error('Error uploading PDF file:', error);
                setSnackbarMessage('An error occurred while uploading the PDF file.');
                setSnackbarSeverity('error');
                setOpenSnackbar(true);
                return;
            }
        }

        if (isFormValid) {
            try {
                parseAddress(formValues.address, formValues);
                if (isServiceProvider) {
                    const res = await registerServiceProvider(formValues);
                    if (res.status !== 200 && res.status !== 201) {
                        throw new Error(res.response.data.errors);
                    }
                    console.log(res.status);
                } else {
                    const res = await registerServiceReceiver(formValues);
                    console.log(res);
                    if (res.status !== 200 && res.status !== 201) {
                        throw new Error(res.response.data.errors);
                    }
                    console.log(res.status);
                }
                setSnackbarMessage('Registration successful! Please check your email to verify your account.');
                setSnackbarSeverity('success');
                setOpenSnackbar(true);
                setOpenModal(true);
                setFormValues({
                    firstName: '',
                    lastName: '',
                    companyName: '',
                    phoneNumber: '',
                    email: '',
                    address: '',
                    country: '',
                    city: '',
                    street: '',
                    houseNumber: '',
                    zipCode: '',
                    password: '',
                    confirmPassword: '',
                    hasEnabledAds: false,
                    serviceProvider: isServiceProvider,
                    license: null,
                });
                setPdfFile(null);
            } catch (error) {
                console.log("signupError", error);
                console.log(error.toString())
                if (error != null) {
                    setSnackbarMessage(error.toString());
                } else {
                    setSnackbarMessage('An error occurred. Please try again later.');
                }
                setSnackbarSeverity('error');
                setOpenSnackbar(true);
            }
        }
    };

    useEffect(() => {
        const allFieldsValid = Object.keys(formValues).every((key) => {
            return validateField(formValues[key], key);
        });

        const passwordsMatch = formValues.password === formValues.confirmPassword;
        setIsFormValid(allFieldsValid && !addressError && passwordsMatch);
    }, [formValues, addressError]);

    const validateField = (value, name) => {
        if (name === 'email') {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailPattern.test(value);
        } else if (name === 'phoneNumber') {
            return value.trim() !== '';
        } else if (name === 'password') {
            const passwordPattern = /^(?=.*[0-9])(?=.*[!@#$%^&*()\-_=+{}[\]~`<>?,./])[A-Za-z\d!@#$%^&*()\-_=+{}[\]~`<>?,./]{8,}$/;
            return passwordPattern.test(value.trim());
        } else if (name === 'confirmPassword') {
            return value.trim() !== '';
        }
        return true;
    };

    const handleAddressChange = (event, newValue) => {
        setFormValues({
            ...formValues,
            address: newValue,
        });
        fetchAutocompleteSuggestions(newValue);
    };

    const handleSuggestionClick = (event, value) => {
        if (value) {
            setFormValues({
                ...formValues,
                address: value,
            });
            setAutocompleteSuggestions([]);
        }
    };

    useEffect(() => {
        if (formValues.address) {
            validateAddress(formValues.address);
        }
    }, [formValues.address]);

    return (
        <Container maxWidth={false} sx={{ backgroundColor: '#f6f6f6', py: 4 }}>
            <Grid container spacing={2} alignItems="flex-start" justifyContent="center" >
                <Grid item xs={12} md={6}>
                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            justifyContent: 'center',
                            padding: '20px',
                        }}
                    >
                        <Title text={'Set up your account'} textAlign={'center'} />
                        <Typography variant="body1" color="textSecondary" my={2}>
                            {isServiceProvider
                                ? 'Start offering your craftsmen skills today by creating an account'
                                : 'Browse service providers, contact them, and book appointments by creating an account today.'}
                        </Typography>
                        {isServiceProvider && (
                            <TextField
                                label="Company Name *"
                                name="companyName"
                                type="text"
                                variant="outlined"
                                value={formValues.companyName}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={touchedFields.companyName && !validateField(formValues.companyName, 'companyName')}
                                helperText={touchedFields.companyName && !validateField(formValues.companyName, 'companyName') ? 'This field is required' : ''}
                                sx={{ marginBottom: '10px', width: '600px' }}
                            />
                        )}
                        {!isServiceProvider && (
                            <>
                                <TextField
                                    label="First Name *"
                                    name="firstName"
                                    type="text"
                                    variant="outlined"
                                    value={formValues.firstName}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={touchedFields.firstName && !validateField(formValues.firstName, 'firstName')}
                                    helperText={touchedFields.firstName && !validateField(formValues.firstName, 'firstName') ? 'This field is required' : ''}
                                    sx={{ marginBottom: '10px', width: '600px' }}
                                />
                                <TextField
                                    label="Last Name *"
                                    name="lastName"
                                    type="text"
                                    variant="outlined"
                                    value={formValues.lastName}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={touchedFields.lastName && !validateField(formValues.lastName, 'lastName')}
                                    helperText={touchedFields.lastName && !validateField(formValues.lastName, 'lastName') ? 'This field is required' : ''}
                                    sx={{ marginBottom: '10px', width: '600px' }}
                                />
                            </>
                        )}
                        <PhoneInput
                            country={'de'}
                            value={formValues.phoneNumber}
                            onChange={handlePhoneChange}
                            inputProps={{
                                name: 'phoneNumber',
                                required: true,
                                autoFocus: true,
                                onBlur: handleBlur,
                            }}
                            containerStyle={{
                                marginBottom: '10px',
                                width: '600px',
                                positions: 'relative'
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
                        <TextField
                            label="Email Address *"
                            name="email"
                            type="email"
                            variant="outlined"
                            value={formValues.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touchedFields.email && !validateField(formValues.email, 'email')}
                            helperText={touchedFields.email && !validateField(formValues.email, 'email') ? 'Please enter a valid email address' : ''}
                            sx={{ marginBottom: '10px', width: '600px' }}
                        />
                        <Autocomplete
                            freeSolo
                            options={autocompleteSuggestions.map((option) => option.properties.formatted)}
                            onInputChange={handleAddressChange}
                            onChange={handleSuggestionClick}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Address *"
                                    name="address"
                                    variant="outlined"
                                    value={formValues.address}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={touchedFields.address && addressError !== ''}
                                    helperText={touchedFields.address && addressError ? addressError : ''}
                                    sx={{ marginBottom: '10px', width: '600px' }}
                                />
                            )}
                        />
                        <TextField
                            label="Password *"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            variant="outlined"
                            value={formValues.password}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touchedFields.password && !validateField(formValues.password, 'password')}
                            helperText={touchedFields.password && !validateField(formValues.password, 'password') ? 'Password must be at least 8 characters and contain at least one special character and one number' : ''}
                            sx={{ marginBottom: '10px', width: '600px' }}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    onClick={handleClickShowPassword}
                                    edge="end"
                                  >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                        />
                        <TextField
                            label="Confirm Password *"
                            name="confirmPassword"
                            type={showPassword ? 'text' : 'password'}
                            variant="outlined"
                            value={formValues.confirmPassword}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touchedFields.confirmPassword && !validateField(formValues.confirmPassword, 'confirmPassword')}
                            helperText={touchedFields.confirmPassword && !validateField(formValues.confirmPassword, 'confirmPassword') ? 'This field is required' : ''}
                            sx={{ marginBottom: '10px', width: '600px' }}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    onClick={handleClickShowPassword}
                                    edge="end"
                                  >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                        />
                      {formValues.password && formValues.confirmPassword && (
                        <Typography variant="body2" color={formValues.password === formValues.confirmPassword ? 'green' : 'red'}>
                          {formValues.password === formValues.confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                        </Typography>
                      )}
                        {pdfError && (
                            <Typography variant="body2" color="error">
                                {pdfError}
                            </Typography>
                        )}
                        {isServiceProvider && (
                            <Box sx={{ marginBottom: '10px', width: '600px' }}>
                                <Button
                                    variant="outlined"
                                    component="label"
                                    sx={{
                                        width: '100%',
                                        height: '56px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '16px',
                                        border: '1px solid #c4c4c4',
                                        marginBottom: '10px',
                                        backgroundColor: '#fff',
                                        '&:hover': {
                                            borderColor: '#000',
                                        },
                                        textTransform: 'none',
                                    }}
                                >
                                    <UploadFileIcon sx={{ marginRight: '10px' }} />
                                    Upload PDF
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        hidden
                                        onChange={handlePdfChange}
                                    />
                                </Button>
                                {pdfFile && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', marginTop: '5px' }}>
                                        <Typography variant="body2">
                                            Selected file: {pdfFile.name}
                                        </Typography>
                                        <IconButton onClick={handlePdfDelete} sx={{ marginLeft: '10px' }}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>
                                )}
                            </Box>
                        )}
                        <FormControlLabel
                            control={
                                <Checkbox
                                    name="hasEnabledAds"
                                    checked={formValues.hasEnabledAds}
                                    onChange={handleChange}
                                />
                            }
                            label="Agree to receive information about new services via mail"
                            sx={{ marginBottom: '10px' }}
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            sx={{
                                color: 'white',
                                backgroundColor: '#4B72C2',
                            }}
                            disabled={!isFormValid}
                        >
                            Create Account
                        </Button>

                        <Snackbar
                            open={openSnackbar}
                            autoHideDuration={6000}
                            onClose={() => setOpenSnackbar(false)}
                            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                        >
                            <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
                                {snackbarMessage}
                            </Alert>
                        </Snackbar>

                        <Divider sx={{ marginY: '10px', width: '600px' }} />
                        <Box sx={{ display: 'centered', justifyContent: 'space-between', marginTop: '10px', width: '600px' }}>
                            <Typography variant="body2">
                                Already have an account? <a href="/login" style={{ color: '#4B72C2', textDecoration: 'none' }}>Login</a>
                            </Typography>
                            <Typography variant="body2">
                                {isServiceProvider
                                    ? 'Looking for services?'
                                    : 'Want to register your business?'}{' '}
                                <a href={isServiceProvider ? '/signup' : '/signupProvider'} style={{ color: '#4B72C2', textDecoration: 'none' }}>
                                    {isServiceProvider ? 'Register here' : 'Register here'}
                                </a>
                            </Typography>
                        </Box>
                    </Box>
                </Grid>
                {isMediumOrLarger && (
                    <Grid item xs={12} md={6}>
                        <Box
                            sx={{
                                height: '80vh',
                                backgroundImage: `url(${SignUpJourney})`,
                                backgroundSize: 'contain',
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat',
                            }}
                        />
                    </Grid>
                )}
            </Grid>
            <SignUpSuccessModal
                open={openModal}
                onClose={() => setOpenModal(false)}
            />
        </Container>
    );
}
