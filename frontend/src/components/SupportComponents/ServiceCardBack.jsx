import React from 'react';
import { Box, Card, CardActionArea, CardContent, Typography, List, ListItem } from '@mui/material';

// Backside of a flippable service card used on the landing, profile & browse services pages
// Receivers an image, title and description to be displayed 
function ServiceCardBack({ title, subServices = [] }) {
  
  return (
    <Card sx={{ width: '100%', height: '300px', borderRadius: '16px', margin: '5px', display: 'flex', flexDirection: 'column' }}>
      <CardActionArea sx={{ flexGrow: 1, flexDirection: 'column' }}>
        <CardContent sx={{ flex: '1 0 auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', margin: '25px'}}>
            <Box>
              <Typography variant="h6" component="div" textAlign={'left'}>
                {title}
              </Typography>
              <List sx={{ listStyleType: 'disc' }}>
                {subServices?.map((service, index) => (
                  <ListItem key={index} sx={{ display: 'item' }}>
                    <Typography variant="body2" color="text.secondary">
                      {service?.name}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default ServiceCardBack;
