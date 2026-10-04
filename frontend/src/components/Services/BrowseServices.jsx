import React, {useState, useMemo, useEffect} from 'react';
import axios from 'axios';
import {
  Container,
  CardMedia,
  Grid,
  Box,
  Card,
  CardContent,
  Typography,
  CardActionArea,
  TextField,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import {Link} from 'react-router-dom';
import {styled} from '@mui/system';
import SearchIcon from '@mui/icons-material/Search';
import Title from '../SupportComponents/Title';

const SearchField = styled(TextField)(() => ({
  marginBottom: '20px',
  width: '100%',
  maxWidth: '600px',
  borderRadius: '25px',
  boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
  '& .MuiInputBase-root': {
    borderRadius: '25px'
  }
}));

function ServicesPanelCard({image, title, description}) {
  return (<Card component={Link} to={`/service-details/${encodeURIComponent(title)}`} sx={{
      width: '400px',
      height: '350px',
      borderRadius: '16px',
      margin: '20px',
      display: 'flex',
      flexDirection: 'column',
      textDecoration: 'none'
    }}>
      <CardActionArea sx={{flexGrow: 1, flexDirection: 'column', alignItems: 'stretch'}}>
        <CardMedia
          component="img"
          height="200"
          image={image}
          alt={title}
          sx={{objectFit: 'cover'}}
        />
        <CardContent sx={{flex: '1 0 auto'}}>
          <Box sx={{display: 'flex', alignItems: 'center'}}>
            <Box>
              <Typography variant="h6" component="div" textAlign={'center'}>
                {title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {description}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>);
}

function ServiceCategories() {
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceTypes, setServiceTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  //Handles search bar input
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value.toLowerCase());
  };


  const filteredServices = useMemo(() => {
    return serviceTypes.filter(service => {
      const name = service.name ? service.name.toLowerCase() : '';
      const description = service.description ? service.description.toLowerCase() : '';
      return name.includes(searchQuery.toLowerCase()) || description.includes(searchQuery.toLowerCase());
    });
  }, [searchQuery, serviceTypes]);

  useEffect(() => {
    const fetchTypesAndSubTypes = async () => {
      try {
        const response = await axios.get('/serviceTypes/getAll');
        setServiceTypes(response.data);
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTypesAndSubTypes();
  }, []);

  return (<Container id='services' maxWidth={false} sx={{backgroundColor: '#f6f6f6', py: 4}}>
      <Box textAlign="center" my={2}>
        <Title text={'Discover Different Services'} textAlign={'center'}/>
        <Typography variant="body1" color="textSecondary" my={2}>
          Click on a Card to specify your service requirement and book an appointment with a Craftsman.
        </Typography>
        <SearchField
          label="Search"
          variant="outlined"
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (<InputAdornment position="start">
                <SearchIcon/>
              </InputAdornment>)
          }}
        />
      </Box>

      {loading ? (<Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress/>
        </Box>) : (<Grid container spacing={4} justifyContent="center" my={2}>
          {filteredServices.map((service, index) => (<Grid item key={index}>
              <ServicesPanelCard
                image={service.image}
                title={service.title}
                description={service.description}
                link={service.link}
              />
            </Grid>))}
        </Grid>)}
    </Container>);
}

export default ServiceCategories;
