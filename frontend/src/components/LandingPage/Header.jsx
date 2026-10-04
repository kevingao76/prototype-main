import React from 'react'
import { Box, Button, styled, Typography } from "@mui/material";
import { Link } from 'react-router-dom'
import Craftsmen from '../../assets/Header.png'
import Logo from '../../assets/Craftify_Logo.jpg'

const Header = () => {

    // Defining custom style of MUI elements
    const CustomBox = styled(Box)(({ theme }) => ({
        minHeight: '80vh',
        display: 'flex',
        justifyContent: 'center',
        gap: theme.spacing(2),
        paddingTop: theme.spacing(10),
        backgroundColor: '#FF743A',
        [theme.breakpoints.down('md')]: {
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
        }
    }));

    const BoxText = styled(Box)(({ theme }) => ({
        flex: '2',
        paddingLeft: theme.spacing(8),
        [theme.breakpoints.down('md')]: {
            flex: '2',
            textAlign: 'center',
            paddingLeft: theme.spacing(2),
            paddingRight: theme.spacing(2),
        },
    }));

    // Returning JSX structure of component
    return (
        <CustomBox id='header' component='header'>
            <BoxText component='section'>
                <Box sx={{ flex: 1, display: 'flex', justifyContent: 'left', alignItems: 'left', paddingLeft: '20px' }}>
                    <img src={Logo} alt="Craftify Logo"
                        style={{ maxWidth: '50%', maxHeight: '50%', width: 'auto', height: 'auto' }} />
                </Box>
                <Typography
                    variant='h2'
                    component='h1'
                    sx={{
                        fontWeight: 700,
                        color: '#fff',
                    }}
                >
                    Find Local Craftsman Services
                </Typography>
                <Typography
                    variant='h4'
                    component='p'
                    sx={{
                        py: 2,
                        lineHeight: 1.6,
                        color: '#fff',
                    }}
                >
                    Fast. Transparent. Secure.
                </Typography>
                <Box>
                    <Button
                        component={Link}
                        to={'/signup'}
                        variant='contained'
                        sx={{
                            mr: 2,
                            px: 4,
                            py: 1,
                            fontSize: '0.9rem',
                            textTransform: 'capitalize',
                            borderRadius: 0,
                            borderColor: '#14192d',
                            color: '#FF743A',
                            backgroundColor: 'black',
                            borderRadius: '16px',
                            "&:hover": {
                                backgroundColor: '#f0f0f0',
                                color: '#FF743A',

                            }
                        }}
                    >
                        register
                    </Button>
                    <Button
                        component={Link}
                        to={'/login'}
                        variant='outlined'
                        sx={{
                            px: 4,
                            py: 1,
                            fontSize: '0.9rem',
                            textTransform: 'capitalize',
                            borderRadius: 0,
                            color: '#FF743A',
                            backgroundColor: 'white',
                            borderRadius: '16px',
                            "&:hover": {
                                backgroundColor: 'black',
                                color: '#FF743A',
                            }
                        }}
                    >
                        login
                    </Button>
                </Box>
            </BoxText>
            <Box sx={theme => ({
                [theme.breakpoints.down('md')]: {
                    flex: '1',
                    paddingTop: '30px',
                    alignSelf: 'center',
                },
                [theme.breakpoints.up('md')]: {
                    flex: '2',
                    alignSelf: 'flex-end',
                },
            })}
            >
                <img
                    src={Craftsmen}
                    alt="Craftsmen"
                    style={{
                        width: "70%",
                        marginBottom: -15,
                    }}
                />
            </Box>
        </CustomBox>
    )
}

export default Header