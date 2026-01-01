import { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  TablePagination,
  TextField,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RefreshIcon from '@mui/icons-material/Refresh';

const LIST_INCIDENT_TICKET_URL = 'http://localhost:8000/incident-ticket';

const statusColors = {
  'OPEN': 'default',
  'IN_PROGRESS': 'primary',
  'RESOLVED': 'success',
  'CLOSED': 'default',
  'OUT_OF_SCOPE': 'warning',
};

export default function ListIncidentTicket() {
  const [incidentTickets, setIncidentTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch incident tickets
  useEffect(() => {
    fetchIncidentTickets();
  }, []);

  const fetchIncidentTickets = async () => {
    setLoading(true);
    try {
      const response = await fetch(LIST_INCIDENT_TICKET_URL);
      
      if (!response.ok) {
        throw new Error('Failed to fetch incident tickets');
      }

      const result = await response.json();
      console.log('Fetched incident tickets:', result);
      setIncidentTickets(result || []);
      setAlert(null);
    } catch (error) {
      setAlert({
        severity: 'error',
        message: error.message || 'Failed to load incident tickets',
      });
      setIncidentTickets([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle view details
  const handleViewDetails = (ticket) => {
    setSelectedTicket(ticket);
    setDetailDialogOpen(true);
  };

  // Handle close detail dialog
  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
    setSelectedTicket(null);
  };

  // Filter incident tickets based on search term
  const filteredTickets = incidentTickets.filter((ticket) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      ticket.title?.toLowerCase().includes(searchLower) ||
      ticket.description?.toLowerCase().includes(searchLower) ||
      String(ticket.id || '')?.toLowerCase().includes(searchLower) ||
      ticket.application?.toLowerCase().includes(searchLower)
    );
  });

  // Paginate filtered results
  const paginatedTickets = filteredTickets.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>Incident Tickets</h1>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={fetchIncidentTickets}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {/* Alert */}
      {alert && (
        <Alert severity={alert.severity} onClose={() => setAlert(null)}>
          {alert.message}
        </Alert>
      )}

      {/* Search */}
      <TextField
        placeholder="Search by title, description, ID, or application..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setPage(0);
        }}
        fullWidth
        variant="outlined"
        size="small"
        sx={{
          '& .MuiOutlinedInput-root': {
            color: 'inherit',
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.23)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.4)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#1976d2',
            },
          },
          '& .MuiOutlinedInput-input::placeholder': {
            opacity: 0.7,
          },
        }}
      />

      {/* Loading State */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', padding: 4 }}>
          <CircularProgress />
        </Box>
      ) : incidentTickets.length === 0 ? (
        <Alert severity="info">No incident tickets found</Alert>
      ) : (
        <>
          {/* Table */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Application</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Created</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedTickets.map((ticket) => (
                  <TableRow key={ticket.id} hover>
                    <TableCell>{ticket.id}</TableCell>
                    <TableCell>{ticket.title}</TableCell>
                    <TableCell>{ticket.application}</TableCell>
                    <TableCell>
                      <Chip
                        label={ticket.status}
                        color={statusColors[ticket.status] || 'default'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      {ticket.date_created ? new Date(ticket.date_created).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<VisibilityIcon />}
                        onClick={() => handleViewDetails(ticket)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredTickets.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{
              color: '#ffffff',
              '& .MuiTablePagination-root': {
                color: '#ffffff',
              },
              '& .MuiTablePagination-toolbar': {
                color: '#ffffff',
              },
              '& .MuiTablePagination-selectLabel': {
                margin: 0,
                color: '#ffffff !important',
              },
              '& .MuiTablePagination-displayedRows': {
                margin: 0,
                color: '#ffffff !important',
              },
              '& .MuiTablePagination-select': {
                color: '#ffffff !important',
              },
              '& .MuiSelect-select': {
                color: '#ffffff !important',
              },
              '& .MuiSelect-outlined': {
                backgroundColor: 'transparent',
                color: '#ffffff !important',
              },
              '& .MuiIconButton-root': {
                color: '#ffffff !important',
              },
              '& .MuiOutlinedInput-root': {
                color: '#ffffff !important',
              },
              '& .MuiOutlinedInput-root .MuiSelect-select': {
                color: '#ffffff !important',
              },
              '& .MuiSvgIcon-root': {
                color: '#ffffff !important',
              },
            }}
          />
        </>
      )}

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onClose={handleCloseDetailDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Incident Ticket Details</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, paddingTop: 2 }}>
          {selectedTicket && (
            <>
              <Box>
                <strong>ID:</strong> {selectedTicket.id}
              </Box>
              <Box>
                <strong>Title:</strong> {selectedTicket.title}
              </Box>
              <Box>
                <strong>Application:</strong> {selectedTicket.application}
              </Box>
              <Box>
                <strong>Status:</strong>{' '}
                <Chip
                  label={selectedTicket.status}
                  color={statusColors[selectedTicket.status] || 'default'}
                  variant="outlined"
                />
              </Box>
              <Box>
                <strong>Description:</strong>
                <Box sx={{ marginTop: 1, padding: 1, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                  {selectedTicket.description}
                </Box>
              </Box>
              {selectedTicket.resolution && (
                <Box>
                  <strong>Resolution:</strong>
                  <Box sx={{ marginTop: 1, padding: 1, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                    {selectedTicket.resolution}
                  </Box>
                </Box>
              )}
              <Box>
                <strong>Created:</strong>{' '}
                {selectedTicket.date_created
                  ? new Date(selectedTicket.date_created).toLocaleString()
                  : 'N/A'}
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetailDialog} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
