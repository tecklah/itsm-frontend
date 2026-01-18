import { useState, useEffect } from 'react';
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
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { v4 as uuidv4 } from 'uuid';
import { CREATE_INCIDENT_TICKET_URL, INCIDENT_TICKET_MAKE_DECISION_URL } from '../common/constants';

export default function AddIncidentTicket() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    application: '',
    username: localStorage.getItem('username') || '',
    enable_ai_assistant: true,
  });
  const [alert, setAlert] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [pendingInterrupt, setPendingInterrupt] = useState(null);
  const [initialRequestData, setInitialRequestData] = useState(null);

  // Generate session_id when component mounts
  useEffect(() => {
    const newSessionId = uuidv4();
    setSessionId(newSessionId);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked,
    });
  };

  const handleDecision = async (decision) => {
    setLoading(true);

    try {
      const response = await fetch(INCIDENT_TICKET_MAKE_DECISION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'interrupt',
          decision: decision,
          session_id: sessionId,
          id: initialRequestData?.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to process decision');
      }

      // Clear the pending interrupt
      setPendingInterrupt(null);

      // Extract the actual message text from nested structure
      let messageText = null;
      if (result.message && typeof result.message === 'object' && result.message.message) {
        messageText = result.message.message;
      } else if (typeof result.message === 'string') {
        messageText = result.message;
      }

      // Show success message
      setAlert({
        severity: 'success',
        message: initialRequestData?.enable_ai_assistant
          ? 'Incident ticket submitted and automatically processed by SmartDesk AI successfully.'
          : 'Incident ticket submitted successfully.',
      });

      // Store submitted data including response details
      // Use the latest data from database returned in the response
      setSubmittedData({
        id: result.data.id,
        title: result.data.title,
        description: result.data.description,
        application: result.data.application,
        status: result.data.status,
        message: messageText || 'Action processed successfully',
      });

      // Clear the initial request data
      setInitialRequestData(null);

      // Reset form
      setFormData({
        title: '',
        description: '',
        application: '',
        username: localStorage.getItem('username') || '',
        enable_ai_assistant: true,
      });
    } catch (error) {
      setAlert({
        severity: 'error',
        message: error.message || 'Failed to process decision. Please try again.',
      });
    } finally {
      setLoading(false);
    }
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
      const response = await fetch(CREATE_INCIDENT_TICKET_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          session_id: sessionId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit incident ticket');
      }

      // Check if response contains an interrupt
      if (result.message && result.message.type === 'interrupt') {
        setPendingInterrupt(result.message);
        // Store the initial incident ticket data for later use
        setInitialRequestData({
          id: result.data.id,
          title: result.data.title,
          description: result.data.description,
          application: result.data.application,
          status: result.data.status,
          enable_ai_assistant: formData.enable_ai_assistant,
        });
        setLoading(false);
        return;
      }

      // Extract the actual message text
      const isMessageObject = result.message && typeof result.message === 'object' && result.message.type === 'message';
      let messageText = null;
      if (isMessageObject) {
        messageText = result.message.message;
      } else if (typeof result.message === 'string') {
        messageText = result.message;
      }
      
      // Check if message contains OUT_OF_SCOPE
      const isOutOfScope = messageText && messageText.includes('OUT_OF_SCOPE');

      setAlert({
        severity: 'success',
        message: isOutOfScope 
          ? 'Incident ticket submitted successfully. Our customer support team will get back to you shortly.' 
          : formData.enable_ai_assistant
          ? 'Incident ticket submitted and automatically processed by SmartDesk AI successfully.'
          : 'Incident ticket submitted successfully.',
      });

      // Store submitted data including response details
      setSubmittedData({
        id: result.data.id,
        title: result.data.title,
        description: result.data.description,
        application: result.data.application,
        status: result.data.status,
        message: messageText,
      });
      
      setFormData({
        title: '',
        description: '',
        application: '',
        username: localStorage.getItem('username') || '',
        enable_ai_assistant: true,
      });
    } catch (error) {
      setAlert({
        severity: 'error',
        message: error.message || 'Failed to submit incident ticket. Please try again.',
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
              Incident Ticket ID
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
        Add Incident Ticket
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
          placeholder="Enter the title of your incident ticket"
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
          placeholder="Enter a detailed description of your incident ticket"
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

        <FormControlLabel
          control={
            <Checkbox
              name="enable_ai_assistant"
              checked={formData.enable_ai_assistant}
              onChange={handleCheckboxChange}
              sx={{
                color: '#fff',
                '&.Mui-checked': {
                  color: '#1976d2',
                },
              }}
            />
          }
          label="Enable AI Assistant"
          sx={{
            color: '#fff',
            '& .MuiFormControlLabel-label': {
              color: '#fff',
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

      {/* Interrupt Approval UI */}
      {pendingInterrupt && (
        <Paper
          sx={{
            p: 3,
            mt: 3,
            maxWidth: '500px',
            backgroundColor: '#2c2c2c',
            border: '2px solid #ff9800',
          }}
        >
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mb: 1,
              color: '#ff9800',
              fontWeight: 'bold',
              textTransform: 'uppercase',
            }}
          >
            Action Requires Approval
          </Typography>
          <Typography variant="body1" sx={{ color: '#fff', whiteSpace: 'pre-wrap', mb: 2 }}>
            {pendingInterrupt.args.message || pendingInterrupt.description}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            {pendingInterrupt.allowed_decisions.map((decision) => (
              <Button
                key={decision}
                variant="contained"
                onClick={() => handleDecision(decision)}
                disabled={loading}
                sx={{
                  backgroundColor: decision === 'approve' ? '#4caf50 !important' : '#f44336 !important',
                  color: '#fff !important',
                  '&:hover': {
                    backgroundColor: decision === 'approve' ? '#45a049 !important' : '#da190b !important',
                  },
                  textTransform: 'uppercase',
                }}
              >
                {decision}
              </Button>
            ))}
          </Box>
        </Paper>
      )}

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