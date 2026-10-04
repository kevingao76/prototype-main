import React from 'react';
import { Box, Card, CardActionArea, CardMedia, CardContent, Typography } from '@mui/material';

// Frontside of a flippable service card used on the landing, profile & browse services pages
// Receivers an image, title and description to be displayed 
function ServiceCardFront({ image, title, description }) {

    return (
        <Card id="services" sx={{ width: '100%', height: '300px', borderRadius: '16px', margin: '5px', display: 'flex', flexDirection: 'column' }}>
            <CardActionArea sx={{ flexGrow: 1, flexDirection: 'column', alignItems: 'stretch' }}>
                <CardMedia component="img" height="140" src={image} alt={title} sx={{ objectFit: 'cover' }} />
                <CardContent sx={{ flex: '1 0 auto' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box>
                            <Typography variant="h6" component="div" textAlign={'center'}>
                                {title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" textAlign={'center'}>
                                {description}
                            </Typography>
                        </Box>
                    </Box>
                </CardContent>
            </CardActionArea>
        </Card>
    );
}

export default ServiceCardFront;
