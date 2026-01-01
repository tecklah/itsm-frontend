import { Link } from 'react-router';
import { Box, Typography } from '@mui/material';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import LinkIcon from '@mui/icons-material/Link';
import ContentPaste from '@mui/icons-material/ContentPaste';
import Cloud from '@mui/icons-material/Cloud';

const SectionHeader = ({ title }) => (
  <Box sx={{ px: 2, py: 1.5, mt: 1 }}>
    <Typography
      variant="caption"
      sx={{
        color: '#999',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        fontSize: '0.7rem',
      }}
    >
      {title}
    </Typography>
  </Box>
);

export default function LeftNav() {
  return (
    <Paper sx={{ width: 320, maxWidth: '100%', height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#1a1a1a', color: '#fff' }}>
      <MenuList sx={{ flex: 1 }}>
        <SectionHeader title="Service Requests" />
        <MenuItem component={Link} to="/addservicerequest">
          <ListItemIcon>
            <LinkIcon fontSize="small" sx={{ color: '#fff' }} />
          </ListItemIcon>
          <ListItemText>Add Service Request</ListItemText>
        </MenuItem>
        <MenuItem component={Link} to="/listservicerequest">
          <ListItemIcon>
            <LinkIcon fontSize="small" sx={{ color: '#fff' }} />
          </ListItemIcon>
          <ListItemText>List All Service Requests</ListItemText>
        </MenuItem>
        
        <Divider sx={{ backgroundColor: '#333', my: 1 }} />
        
        <SectionHeader title="Incident Tickets" />
        <MenuItem component={Link} to="/addincidentticket">
          <ListItemIcon>
            <ContentPaste fontSize="small" sx={{ color: '#fff' }} />
          </ListItemIcon>
          <ListItemText>Add Incident Ticket</ListItemText>
        </MenuItem>
        <MenuItem component={Link} to="/listincidentticket">
          <ListItemIcon>
            <Cloud fontSize="small" sx={{ color: '#fff' }} />
          </ListItemIcon>
          <ListItemText>List All Incident Tickets</ListItemText>
        </MenuItem>
      </MenuList>
    </Paper>
  );
}