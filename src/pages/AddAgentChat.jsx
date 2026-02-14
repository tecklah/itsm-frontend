import { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { v4 as uuidv4 } from 'uuid';
import { CHAT_REQUEST_URL } from '../common/constants';

export default function AddAgentChat() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [pendingInterrupt, setPendingInterrupt] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Generate session_id when component mounts
  useEffect(() => {
    const newSessionId = uuidv4();
    setSessionId(newSessionId);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleDecision = async (decision) => {
    setLoading(true);

    try {
      const response = await fetch(CHAT_REQUEST_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          type: 'interrupt',
          decision: decision,
          session_id: sessionId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to process decision');
      }

      // Clear the pending interrupt
      setPendingInterrupt(null);

      // Add agent response to messages
      const agentMessage = {
        role: 'agent',
        content: result.message || result.content || 'Decision processed',
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, agentMessage]);
    } catch (error) {
      const errorMessage = {
        role: 'system',
        content: `Error: ${error.message}`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!inputMessage.trim()) {
      return;
    }

    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await fetch(CHAT_REQUEST_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          question: inputMessage,
          username: localStorage.getItem('username') || '',
          session_id: sessionId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send message');
      }

      // Check if response is an interrupt
      if (result.type === 'interrupt') {
        setPendingInterrupt(result);
        setLoading(false);
        return;
      }

      const agentMessage = {
        role: 'agent',
        content: result.message || result.content || 'No response',
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, agentMessage]);
    } catch (error) {
      const errorMessage = {
        role: 'system',
        content: `Error: ${error.message}`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        height: 'calc(100vh - 100px)',
        display: 'flex',
        flexDirection: 'column',
        py: 2,
      }}
    >
      <Typography variant="h4" component="h1" sx={{ mb: 3, textAlign: 'left' }}>
        Chat with SmartDesk AI
      </Typography>

      {/* Messages Container */}
      <Paper
        sx={{
          flex: 1,
          p: 3,
          backgroundColor: '#1a1a1a',
          overflowY: 'auto',
          mb: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {messages.length === 0 && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              color: '#666',
            }}
          >
            <Typography variant="body1">
              Start a conversation with SmartDesk AI...
            </Typography>
          </Box>
        )}

        {messages.map((msg, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              mb: 1,
            }}
          >
            <Paper
              sx={{
                p: 2,
                maxWidth: '70%',
                backgroundColor:
                  msg.role === 'user'
                    ? '#1976d2'
                    : msg.role === 'system'
                    ? '#d32f2f'
                    : '#333',
                color: '#fff',
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  mb: 0.5,
                  color: msg.role === 'user' ? '#bbdefb' : '#999',
                  fontWeight: 'bold',
                }}
              >
                {msg.role === 'user' ? 'You' : msg.role === 'system' ? 'System' : 'SmartDesk AI'}
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {msg.content}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  mt: 0.5,
                  color: '#999',
                  fontSize: '0.7rem',
                }}
              >
                {new Date(msg.timestamp).toLocaleTimeString()}
              </Typography>
            </Paper>
          </Box>
        ))}

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1 }}>
            <Paper
              sx={{
                p: 2,
                backgroundColor: '#333',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <CircularProgress size={20} />
              <Typography variant="body2" sx={{ color: '#fff' }}>
                SmartDesk AI is thinking...
              </Typography>
            </Paper>
          </Box>
        )}

        {/* Interrupt Approval UI */}
        {pendingInterrupt && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1 }}>
            <Paper
              sx={{
                p: 3,
                maxWidth: '80%',
                backgroundColor: '#2c2c2c',
                color: '#fff',
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
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
                {pendingInterrupt.description}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                {pendingInterrupt.allowed_decisions.map((decision) => (
                  <Button
                    key={decision}
                    variant="contained"
                    onClick={() => handleDecision(decision)}
                    disabled={loading}
                    sx={{
                      backgroundColor: decision.toUpperCase() === 'APPROVE' ? '#4caf50 !important' : '#f44336 !important',
                      color: '#fff !important',
                      '&:hover': {
                        backgroundColor: decision.toUpperCase() === 'APPROVE' ? '#45a049 !important' : '#da190b !important',
                      },
                    }}
                  >
                    {decision}
                  </Button>
                ))}
              </Box>
            </Paper>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Paper>

      {/* Input Form */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: 'flex',
          gap: 2,
        }}
      >
        <TextField
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type your message..."
          fullWidth
          variant="outlined"
          disabled={loading}
          multiline
          maxRows={4}
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
          color="primary"
          disabled={loading || !inputMessage.trim()}
          endIcon={<SendIcon />}
          size="large"
          sx={{
            minWidth: '120px',
            height: '56px',
            backgroundColor: '#1976d2 !important',
            color: '#fff !important',
            '&:hover': {
              backgroundColor: '#1565c0 !important',
            },
          }}
        >
          Send
        </Button>
      </Box>
    </Box>
  );
}
