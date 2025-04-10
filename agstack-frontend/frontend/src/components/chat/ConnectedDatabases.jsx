import { useState } from 'react';
import {
  Box,
  Chip,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Tooltip,
  Badge,
  Divider,
} from '@mui/material';
import {
  Storage as StorageIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

const ConnectedDatabases = ({ 
  connections = [], 
  onManageConnections, 
  onRemoveConnection = () => {},
  readOnly = false
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  if (connections.length === 0) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Tooltip title="No connections attached">
          <IconButton 
            size="small" 
            color="primary" 
            onClick={onManageConnections}
            disabled={readOnly}
          >
            <Badge color="warning" variant="dot">
              <StorageIcon fontSize="small" />
            </Badge>
          </IconButton>
        </Tooltip>
        <Typography variant="caption" color="warning.main" sx={{ ml: 1 }}>
          No connections
        </Typography>
        {!readOnly && (
          <Tooltip title="Attach connections">
            <IconButton 
              size="small" 
              color="primary" 
              onClick={onManageConnections}
              sx={{ ml: 1 }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Tooltip title="Connected databases">
        <IconButton 
          size="small" 
          color="primary" 
          onClick={handleClick}
          aria-controls={open ? 'connected-db-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
        >
          <Badge badgeContent={connections.length} color="primary">
            <StorageIcon fontSize="small" />
          </Badge>
        </IconButton>
      </Tooltip>

      {connections.length > 0 && (
        <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
            {connections.length === 1 ? '1 connection' : `${connections.length} connections`}
          </Typography>
          {!readOnly && (
            <Tooltip title="Manage connections">
              <IconButton 
                size="small" 
                onClick={onManageConnections} 
                color="primary"
              >
                <SettingsIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      )}

      <Menu
        id="connected-db-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
          dense: true,
          sx: { width: 280, maxHeight: 320, overflow: 'auto' }
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Connected Databases
          </Typography>
        </Box>
        <Divider />
        {connections.map((connection) => (
          <MenuItem key={connection.id} sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Box sx={{ overflow: 'hidden' }}>
              <Typography variant="body2" noWrap>
                {connection.connection_name}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" noWrap>
                {connection.database_name} • {connection.schema_name}
              </Typography>
            </Box>
            
            {!readOnly && (
              <IconButton 
                size="small" 
                edge="end" 
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveConnection(connection.id);
                  handleClose();
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </MenuItem>
        ))}
        
        {!readOnly && (
          <>
            <Divider />
            <MenuItem 
              onClick={() => {
                onManageConnections();
                handleClose();
              }}
              sx={{ color: 'primary.main' }}
            >
              <AddIcon fontSize="small" sx={{ mr: 1 }} />
              Manage connections
            </MenuItem>
          </>
        )}
      </Menu>
    </Box>
  );
};

export default ConnectedDatabases; 