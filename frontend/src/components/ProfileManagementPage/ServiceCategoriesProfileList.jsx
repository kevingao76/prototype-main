import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Checkbox,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Collapse,
} from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

function ServicesProfileList({ editMode, subServiceTypes, onSubServiceTypesChange }) {
    const [openServices, setOpenServices] = useState({});
    const [serviceTypes, setServiceTypes] = useState([]);
    const [selectedSubServiceTypes, setSelectedSubServiceTypes] = useState(subServiceTypes);

    const handleServiceClick = (service) => {
        setOpenServices((prevOpenServices) => ({
            ...prevOpenServices,
            [service]: !prevOpenServices[service],
        }));
    };

    const handleSubServiceChange = (subService) => {
        const updatedSubServiceTypes = selectedSubServiceTypes.some(sub => sub._id === subService._id)
            ? selectedSubServiceTypes.filter(sub => sub._id !== subService._id)
            : [...selectedSubServiceTypes, subService];

        setSelectedSubServiceTypes(updatedSubServiceTypes);
        onSubServiceTypesChange(updatedSubServiceTypes);
    };

    useEffect(() => {
        const fetchTypesAndSubTypes = async () => {
            try {
                const response = await axios.get('/serviceTypes/getAll');
                const serviceTypes = response.data;
                setServiceTypes(serviceTypes);
                setSelectedSubServiceTypes(subServiceTypes);
            } catch (error) {
                console.error('Error fetching inquiries:', error);
            }
        };

        fetchTypesAndSubTypes();
    }, [subServiceTypes]);

    return (
        <List>
            {serviceTypes.map((service) => (
                <div key={service.title}>
                    <ListItem button onClick={() => handleServiceClick(service.title)}>
                        <ListItemText primary={service.title} />
                        {openServices[service.title] ? <ExpandLess /> : <ExpandMore />}
                    </ListItem>
                    <Collapse in={openServices[service.title]} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            {service.subServices.map((subService) => (
                                <div key={subService._id}>
                                    <ListItem sx={{ pl: 4 }}>
                                        <ListItemIcon>
                                            <Checkbox
                                                edge="start"
                                                checked={
                                                    selectedSubServiceTypes.some(sub => sub._id === subService._id)
                                                }
                                                tabIndex={-1}
                                                disableRipple
                                                onChange={() => handleSubServiceChange(subService)}
                                                disabled={!editMode}
                                            />
                                        </ListItemIcon>
                                        <ListItemText primary={subService.name} />
                                    </ListItem>
                                </div>
                            ))}
                        </List>
                    </Collapse>
                </div>
            ))}
        </List>
    );
}

export default ServicesProfileList;
