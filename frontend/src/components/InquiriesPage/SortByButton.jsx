import React from 'react';
import { Button, Menu, MenuItem } from '@mui/material';
import { ArrowUpward, ArrowDownward } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledSortByButton = styled(Button)(({ theme }) => ({
    backgroundColor: '#1976d2',
    color: 'white',
    '&:hover': {
        backgroundColor: '#1565c0',
    },
    marginRight: theme.spacing(2),
}));

const SortByButton = ({ selectedSort, sortOrder, sortAnchorEl, handleSortMenuClick, handleSortMenuClose, handleSortOrderChange }) => (
    <>
        <StyledSortByButton onClick={handleSortMenuClick}>
            Sort by: {selectedSort}
            {sortOrder === 'Ascending' ? (
                <ArrowUpward onClick={handleSortOrderChange} />
            ) : (
                <ArrowDownward onClick={handleSortOrderChange} />
            )}
        </StyledSortByButton>
        <Menu anchorEl={sortAnchorEl} open={Boolean(sortAnchorEl)} onClose={() => handleSortMenuClose(null)}>
            {['Most Recent', 'Status'].map(option => (
                <MenuItem key={option} onClick={() => handleSortMenuClose(option)}>
                    {option}
                </MenuItem>
            ))}
        </Menu>
    </>
);

export default SortByButton;
