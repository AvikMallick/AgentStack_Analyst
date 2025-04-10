import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Typography,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Storage as StorageIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';

export default function ConnectionsSidebar({ connections = [], onConnectionSelect, onAddConnection }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6">Connections</Typography>
        <IconButton onClick={onAddConnection} color="primary" size="small">
          <AddIcon />
        </IconButton>
      </Box>

      <Divider />

      {/* Connections List */}
      <List sx={{ flex: 1, overflow: 'auto', paddingTop: 0 }}>
        {connections.map((connection) => (
          <ListItem key={connection.id} disablePadding>
            <ListItemButton
              selected={connection.isSelected}
              onClick={() => onConnectionSelect(connection.id)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'primary.light',
                  color: 'primary.contrastText',
                },
              }}
            >
              <ListItemIcon>
                {connection.status === 'connected' ? (
                  <CheckCircleIcon color="success" />
                ) : connection.status === 'error' ? (
                  <ErrorIcon color="error" />
                ) : (
                  <StorageIcon color="action" />
                )}
              </ListItemIcon>
              <ListItemText
                primary={connection.connection_name}
                secondary={connection.database_name}
                primaryTypographyProps={{
                  noWrap: true,
                }}
                secondaryTypographyProps={{
                  noWrap: true,
                  sx: { opacity: 0.7 },
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
        {connections.length === 0 && (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No connections yet
            </Typography>
          </Box>
        )}
      </List>
    </Box>
  );
} 