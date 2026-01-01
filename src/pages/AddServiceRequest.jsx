import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Alert,
  Typography,
  Paper,
  CircularProgress,
  Backdrop,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { CREATE_SERVICE_REQUEST_URL } from '../common/constants';

export default function AddServiceRequest() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    application: '',
    username: localStorage.getItem('username') || '',
  });
  const [alert, setAlert] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!formData.title.trim() || !formData.description.trim() || !formData.application) {
      setAlert({
        severity: 'error',
        message: 'Please fill in all fields',
      });
      return;
    }

    // Submit to backend
    setLoading(true);
    try {
      const response = await fetch(CREATE_SERVICE_REQUEST_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit service request');
      }

      // Check if message is OUT_OF_SCOPE
      const isOutOfScope = result.message === 'OUT_OF_SCOPE';

      setAlert({
        severity: 'success',
        message: isOutOfScope 
          ? 'Service request submitted successfully. Our customer support team will get back to you shortly.' 
          : 'Service request submitted and automatically processed by SmartDesk AI successfully.',
      });

      // Store submitted data including response details
      setSubmittedData({
        id: result.data.id,
        title: result.data.title,
        description: result.data.description,
        application: result.data.application,
        status: result.data.status,
        message: isOutOfScope ? null : result.message,
      });
      
      setFormData({
        title: '',
        description: '',
        application: '',
        username: localStorage.getItem('username') || '',
      });
    } catch (error) {
      setAlert({
        severity: 'error',
        message: error.message || 'Failed to submit service request. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToForm = () => {
    setSubmittedData(null);
    setAlert(null);
  };

  // Display submitted data view
  if (submittedData) {
    return (
      <Box sx={{ py: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBackToForm}
          sx={{ mb: 3, color: '#fff' }}
        >
          Back to Form
        </Button>

        <Typography variant="h4" component="h1" sx={{ mb: 3, textAlign: 'left' }}>
          Submission Details
        </Typography>

        {alert && (
          <Alert severity={alert.severity} sx={{ mb: 2 }} onClose={() => setAlert(null)}>
            {alert.message}
          </Alert>
        )}

        <Paper sx={{ p: 3, backgroundColor: '#333', maxWidth: '500px' }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ color: '#999', mb: 1 }}>
              Service Request ID
            </Typography>
            <Typography variant="body1" sx={{ color: '#fff' }}>
              {submittedData.id}
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ color: '#999', mb: 1 }}>
              Status
            </Typography>
            <Typography variant="body1" sx={{ color: '#fff' }}>
              {submittedData.status}
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ color: '#999', mb: 1 }}>
              Application
            </Typography>
            <Typography variant="body1" sx={{ color: '#fff' }}>
              {submittedData.application}
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ color: '#999', mb: 1 }}>
              Title
            </Typography>
            <Typography variant="body1" sx={{ color: '#fff' }}>
              {submittedData.title}
            </Typography>
          </Box>

          <Box sx={{ mb: submittedData.message ? 3 : 0 }}>
            <Typography variant="subtitle2" sx={{ color: '#999', mb: 1 }}>
              Description
            </Typography>
            <Typography variant="body1" sx={{ color: '#fff', whiteSpace: 'pre-wrap' }}>
              {submittedData.description}
            </Typography>
          </Box>

          {submittedData.message && (
            <Box>
              <Typography variant="subtitle2" sx={{ color: '#999', mb: 1 }}>
                Agent Message
              </Typography>
              <Typography variant="body1" sx={{ color: '#fff', whiteSpace: 'pre-wrap' }}>
                {submittedData.message}
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    );
  }

  // Display form view
  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3, textAlign: 'left' }}>
        Add Service Request
      </Typography>

      {alert && (
        <Alert severity={alert.severity} sx={{ mb: 2 }} onClose={() => setAlert(null)}>
          {alert.message}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: '500px' }}>
        <FormControl fullWidth variant="outlined">
          <InputLabel sx={{ color: '#fff' }}>Application</InputLabel>
          <Select
            name="application"
            value={formData.application}
            onChange={handleInputChange}
            label="Application"
            sx={{
              color: '#fff',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#666',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#999',
              },
              '& .MuiSvgIcon-root': {
                color: '#fff',
              },
            }}
          >
            <MenuItem value="Facility Application">Facility Application</MenuItem>
            <MenuItem value="Exam Result Application">Exam Result Application</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          fullWidth
          variant="outlined"
          placeholder="Enter the title of your service request"
          sx={{
            '& .MuiInputBase-input': {
              color: '#fff',
            },
            '& .MuiInputLabel-root': {
              color: '#fff',
            },
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: '#666',
              },
              '&:hover fieldset': {
                borderColor: '#999',
              },
            },
          }}
        />

        <TextField
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          fullWidth
          variant="outlined"
          multiline
          rows={4}
          placeholder="Enter a detailed description of your request"
          sx={{
            '& .MuiInputBase-input': {
              color: '#fff',
            },
            '& .MuiInputLabel-root': {
              color: '#fff',
            },
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: '#666',
              },
              '&:hover fieldset': {
                borderColor: '#999',
              },
            },
          }}
        />

        <Button
          type="submit"
          variant="contained"
          size="large"
          sx={{ mt: 2 }}
        >
          Submit
        </Button>
      </Box>

      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          flexDirection: 'column',
          gap: 2,
        }}
        open={loading}
      >
        <CircularProgress color="inherit" size={60} />
        <Typography variant="h6">Submitting your request...</Typography>
      </Backdrop>
    </Box>
  );
}