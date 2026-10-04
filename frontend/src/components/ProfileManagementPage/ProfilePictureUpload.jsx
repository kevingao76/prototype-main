import React from 'react';
import { Avatar, Box, IconButton, Typography, Grid } from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';

const ProfilePictureUpload = ({ profileImage, handleProfilePictureChange, editMode }) => {
  return (
    <>
      <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
        <Avatar
          src={profileImage}
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
                Upload or change your company logo/picture
              </Typography>
            </Box>
          </label>
        </Grid>
      )}
    </>
  );
};

export default ProfilePictureUpload;
