import React from 'react';
import { Button, Menu, MenuItem, Checkbox, FormControlLabel } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledFilterButton = styled(Button)(({ theme }) => ({
    backgroundColor: '#1976d2',
    color: 'white',
    '&:hover': {
        backgroundColor: '#1565c0',
    },
}));

const FilterButton = ({ filterAnchorEl, handleFilterMenuClick, handleFilterMenuClose, statusOptions, selectedFilter, handleFilterChange }) => (
    <>
        <StyledFilterButton onClick={handleFilterMenuClick}>Filter</StyledFilterButton>
        <Menu anchorEl={filterAnchorEl} open={Boolean(filterAnchorEl)} onClose={handleFilterMenuClose}>
            {statusOptions.map(option => (
                <MenuItem key={option}>
                    <FormControlLabel
                        control={<Checkbox checked={selectedFilter.includes(option)} onChange={() => handleFilterChange(option)} />}
                        label={option}
                    />
                </MenuItem>
            ))}
        </Menu>
    </>
);

export default FilterButton;
