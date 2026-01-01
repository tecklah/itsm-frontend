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

const LIST_SERVICE_REQUEST_URL = 'http://localhost:8000/service-request';

const statusColors = {
  'OPEN': 'default',
  'IN_PROGRESS': 'primary',
  'RESOLVED': 'success',
  'CLOSED': 'default',
  'OUT_OF_SCOPE': 'warning',
};

export default function ListServiceRequest() {
  const [serviceRequests, setServiceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch service requests
  useEffect(() => {
    fetchServiceRequests();
  }, []);

  const fetchServiceRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch(LIST_SERVICE_REQUEST_URL);
      
      if (!response.ok) {
        throw new Error('Failed to fetch service requests');
      }

      const result = await response.json();
      console.log('Fetched service requests:', result);
      setServiceRequests(result || []);
      setAlert(null);
    } catch (error) {
      setAlert({
        severity: 'error',
        message: error.message || 'Failed to load service requests',
      });
      setServiceRequests([]);
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
  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setDetailDialogOpen(true);
  };

  // Handle close detail dialog
  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
    setSelectedRequest(null);
  };

  // Filter service requests based on search term
  const filteredRequests = serviceRequests.filter((request) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      request.title?.toLowerCase().includes(searchLower) ||
      request.description?.toLowerCase().includes(searchLower) ||
      String(request.id || '')?.toLowerCase().includes(searchLower) ||
      request.application?.toLowerCase().includes(searchLower)
    );
  });

  // Paginate filtered results
  const paginatedRequests = filteredRequests.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>Service Requests</h1>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={fetchServiceRequests}
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
      ) : serviceRequests.length === 0 ? (
        <Alert severity="info">No service requests found</Alert>
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
                {paginatedRequests.map((request) => (
                  <TableRow key={request.id} hover>
                    <TableCell>{request.id}</TableCell>
                    <TableCell>{request.title}</TableCell>
                    <TableCell>{request.application}</TableCell>
                    <TableCell>
                      <Chip
                        label={request.status}
                        color={statusColors[request.status] || 'default'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      {request.date_created ? new Date(request.date_created).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<VisibilityIcon />}
                        onClick={() => handleViewDetails(request)}
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
            count={filteredRequests.length}
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
        <DialogTitle>Service Request Details</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, paddingTop: 2 }}>
          {selectedRequest && (
            <>
              <Box>
                <strong>ID:</strong> {selectedRequest.id}
              </Box>
              <Box>
                <strong>Title:</strong> {selectedRequest.title}
              </Box>
              <Box>
                <strong>Application:</strong> {selectedRequest.application}
              </Box>
              <Box>
                <strong>Status:</strong>{' '}
                <Chip
                  label={selectedRequest.status}
                  color={statusColors[selectedRequest.status] || 'default'}
                  variant="outlined"
                />
              </Box>
              <Box>
                <strong>Description:</strong>
                <Box sx={{ marginTop: 1, padding: 1, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                  {selectedRequest.description}
                </Box>
              </Box>
              <Box>
                <strong>Created:</strong>{' '}
                {selectedRequest.date_created
                  ? new Date(selectedRequest.date_created).toLocaleString()
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
