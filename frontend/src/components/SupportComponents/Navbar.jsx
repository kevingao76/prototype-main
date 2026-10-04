import React, { useContext, useEffect, useState } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  List,
  ListItem,
  styled,
  ListItemButton,
  ListItemText,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Typography
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Craftify_Logo from '../../assets/Craftify_Logo.jpg';
import { Link as ScrollLink } from 'react-scroll';
import { AuthContext } from '../AuthContext';
import { fetchProviderData } from '../../utils/UserDataUtils';
import menuData from '../../data/NavbarData.json';

const StyledToolbar = styled(Toolbar)({
  display: 'flex',
  justifyContent: 'space-between',
});

const ListMenu = styled(List)(({ theme }) => ({
  display: 'none',
  [theme.breakpoints.up("sm")]: {
    display: "flex",
  },
}));

const Navbar = ({ userType }) => {
  const navigate = useNavigate();
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
  const handleCloseUserMenu = () => setAnchorElUser(null);

  const { logout } = useContext(AuthContext);

  useEffect(() => {
      fetchProviderData(setUserData, setLoading, setError);
  }, []);

  useEffect(() => {
    if (userData.profileImage) {
      localStorage.setItem('profileImage', userData.profileImage);
    }
  }, [userData]);

  const profileImage = localStorage.getItem('profileImage');

  const items = menuData.menuItems[userType] || [];
  const settings = menuData.userSettings[userType] || [];

  const logoClickPath = userType === 'provider' ? '/serviceProvider/dashboard' :
    userType === 'receiver' ? '/serviceReceiver/dashboard' : '/';

  const handleLogout = () => {
    handleCloseUserMenu();
    logout();
    console.log("Logged out")
    navigate('/');
  };

  return (
    <AppBar component="nav" position="sticky" sx={{ backgroundColor: '#FF743A' }} elevation={0}>
      <StyledToolbar>
        <Box
          component="div"
          sx={{ height: 80, width: 80, display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          onClick={() => navigate(logoClickPath)}
        >
          <Box component="img" src={Craftify_Logo} alt="Logo" sx={{ height: 80, width: 80 }} />
        </Box>
        <ListMenu>
          {items.map(({ text, to, scroll }) => (
            <ListItem key={text}>
              {scroll ? (
                <ScrollLink to={to} smooth={true} duration={500} spy={true} exact="true" offset={-70}
                  style={{ color: 'white', cursor: 'pointer', textDecoration: 'none' }}>
                  <ListItemButton sx={{ "&:hover": { backgroundColor: 'transparent', color: '#1e2a5a' } }}>
                    <ListItemText primary={text} />
                  </ListItemButton>
                </ScrollLink>
              ) : (
                <ListItemButton component={RouterLink} to={to}
                  sx={{ color: 'white', '&:hover': { backgroundColor: 'transparent', color: '#1e2a5a' } }}>
                  <ListItemText primary={text} />
                </ListItemButton>
              )}
            </ListItem>
          ))}
          {(userType === 'provider' || userType === 'receiver') && (
            <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center' }}>
              <IconButton onClick={handleOpenUserMenu}>
                <Avatar src={profileImage} />
              </IconButton>
              <Menu sx={{ mt: '45px' }} id="menu-appbar" anchorEl={anchorElUser}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                keepMounted transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                open={Boolean(anchorElUser)} onClose={handleCloseUserMenu}>
                {settings.map(({ text, to }) => (
                  <MenuItem
                    key={text}
                    onClick={text === 'Log Out' ? handleLogout : handleCloseUserMenu}
                  >
                    <RouterLink to={to} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <Typography textAlign="center">{text}</Typography>
                    </RouterLink>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          )}
          {(userType === 'home' || userType === '') && (
            <>
              <ListItem>
                <ListItemButton component={RouterLink} to="/signup"
                  sx={{ color: 'white', backgroundColor: 'black', borderRadius: '16px', "&:hover": { backgroundColor: '#333' } }}>
                  <ListItemText primary="Register" />
                </ListItemButton>
              </ListItem>
              <ListItem>
                <ListItemButton component={RouterLink} to="/login"
                  sx={{ color: '#FF743A', backgroundColor: 'white', borderRadius: '16px', "&:hover": { backgroundColor: '#f0f0f0', color: '#FF743A' } }}>
                  <ListItemText primary="Login" />
                </ListItemButton>
              </ListItem>
            </>
          )}
        </ListMenu>
      </StyledToolbar>
    </AppBar>
  );
};

export default Navbar;
