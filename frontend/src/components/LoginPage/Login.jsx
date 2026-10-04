import React, { useState, useEffect, useContext } from 'react';
import {Grid, Box, Button, TextField, Typography, Divider, InputAdornment, IconButton} from '@mui/material';
import Craftify_Logo from '../../assets/Craftify_Logo.jpg';
import Craftsmen from '../../assets/Header.png';
import { useNavigate } from "react-router-dom";
import { AuthContext } from '../AuthContext';
import Title from '../SupportComponents/Title'
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Visibility from "@mui/icons-material/Visibility";

const boxStyle = {
  position: "relative",
  width: "100%",
  height: "100%",
  bgcolor: "background.paper",
  boxShadow: 24,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

export default function LoginPage() {
  const navigate = useNavigate();

  const [formValues, setFormValues] = useState({
    email: '',
    password: '',
  });

  const { login } = useContext(AuthContext);

  const [touchedFields, setTouchedFields] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);


  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  const handleBlur = (event) => {
    const { name } = event.target;
    setTouchedFields({
      ...touchedFields,
      [name]: true,
    });
  };

  useEffect(() => {
    const allFieldsValid = Object.keys(formValues).every((key) => {
      return validateField(formValues[key], key);
    });
    setIsFormValid(allFieldsValid);
  }, [formValues]);

  const validateField = (value, name) => {
    if (name === 'email') {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailPattern.test(value);
    }
    return value.trim() !== '';
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    try {
      const response = await login(formValues);
      console.log("Login : ", response.status);
      if (response.status === 200) {
        // Save profile image to local storage
        const profileImage = response.data.profileImage;
        console.log("hier",  response)
        if (profileImage) {
          localStorage.setItem('profileImage', profileImage);
        }

        if (response.data.logIn.isServiceProvider) {
          navigate('/serviceProvider/dashboard');
        } else {
          navigate('/serviceReceiver/dashboard');
        }
      } else {
        console.log("Login failed with status:", response);
        const errorData = await response.message;
        setErrorMessage(errorData.message || 'Login failed');
      }
    } catch (error) {
      console.error("Error during login:", error);
      setErrorMessage('An error occurred while trying to log in');
    }
  };

  return (
    <>
      <div
        style={{
          backgroundColor: '#f6f6f6',
          backgroundSize: 'cover',
          height: '100vh',
          width: '100vw',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box sx={boxStyle}>
          <Grid container sx={{ height: '100%' }}>
            <Grid item xs={12} lg={6} sx={{ display: { xs: 'none', lg: 'block' } }}>
              <Box
                style={{
                  backgroundSize: 'cover',
                  backgroundColor: '#FF743A',
                  height: '100%',
                  color: '#f5f5f5',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Box component="img" src={Craftify_Logo} alt="Logo" sx={{
                  height: 200, width: 200, cursor: 'pointer',
                  '&:hover': { backgroundColor: 'black' },
                }}
                  onClick={() => navigate('/')} />
                <img
                  src={Craftsmen}
                  alt="Craftsmen"
                  style={{
                    width: '70%',
                  }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} lg={6}>
              <Box
                sx={{
                  marginTop: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <Title
                  text={'Login into your account'}
                  textAlign={'center'}
                />
                <Typography variant="body1" color="textSecondary" my={2}>
                  Enter your email and password to login
                </Typography>
                {errorMessage && (
                  <Typography variant="body1" color="error" sx={{ marginBottom: '20px' }}>
                    {errorMessage}
                  </Typography>
                )}
                <form onSubmit={handleSubmit}>
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
                    sx={{ marginBottom: '20px', width: '100%' }}
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
                    helperText={touchedFields.password && !validateField(formValues.password, 'password') ? 'This field is required' : ''}
                    sx={{ marginBottom: '20px', width: '100%' }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Button
                    variant="contained"
                    type="submit"
                    sx={{
                      color: 'white',
                      backgroundColor: '#4B72C2',
                      width: '100%',
                      marginBottom: '20px'
                    }}
                    disabled={!isFormValid}
                  >
                    Login
                  </Button>
                  <Divider sx={{ width: '100%' }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', width: '600px' }}>
                    <Typography variant="body2">
                      Don't have an account? <a href="/signup" style={{ color: '#4B72C2', textDecoration: 'none' }}>Sign up here</a>
                    </Typography>
                    <Typography variant="body2">
                      <a href="/" style={{ color: '#4B72C2', textDecoration: 'none' }}>Back home</a>
                    </Typography>
                  </Box>
                </form>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </div>
    </>
  );
}
