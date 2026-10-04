// PdfUpload.jsx
import React from 'react';
import { Box, Button, Typography, IconButton } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteIcon from '@mui/icons-material/Delete';

const PdfUploadButton = ({ pdfFile, setPdfFile, pdfError, setPdfError }) => {
  const handlePdfChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      setPdfError('');
    } else {
      setPdfFile(null);
      setPdfError('Please upload a valid PDF file.');
    }
  };

  const handlePdfDelete = () => {
    setPdfFile(null);
  };

  return (
    <Box sx={{ marginBottom: '10px', width: '600px' }}>
      <Button
        variant="outlined"
        component="label"
        sx={{
          width: '100%',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '16px',
          border: '1px solid #c4c4c4',
          marginBottom: '10px',
          backgroundColor: '#fff',
          '&:hover': {
            borderColor: '#000',
          },
          textTransform: 'none',
        }}
      >
        <UploadFileIcon sx={{ marginRight: '10px' }} />
        Upload PDF
        <input
          type="file"
          accept="application/pdf"
          hidden
          onChange={handlePdfChange}
        />
      </Button>

      <Typography variant="body2" sx={{ textAlign: 'center' }}>
        If you have multiple certificates, please upload them as one PDF.
      </Typography>
      {pdfError && (
        <Typography variant="body2" color="error">
          {pdfError}
        </Typography>
      )}
      {pdfFile && (
        <Box sx={{ display: 'flex', alignItems: 'center', marginTop: '5px' }}>
          <Typography variant="body2">
            Selected file: {pdfFile.name}
          </Typography>
          <IconButton onClick={handlePdfDelete} sx={{ marginLeft: '10px' }}>
            <DeleteIcon />
          </IconButton>
        </Box>
      )}
    </Box>
  );
};

export default PdfUploadButton;
