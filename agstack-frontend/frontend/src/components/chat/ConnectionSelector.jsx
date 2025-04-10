import { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Box,
  Typography,
  TextField,
  Button,
  Checkbox,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  InputAdornment,
  Chip,
  Avatar,
  CircularProgress
} from '@mui/material';
import {
  Close as CloseIcon,
  Search as SearchIcon,
  Storage as StorageIcon,
  DataObject as DataObjectIcon,
  Check as CheckIcon,
} from '@mui/icons-material';

const ConnectionSelector = ({ 
  open, 
  onClose, 
  connections = [], 
  selectedConnectionIds = [], 
  onSave,
  loading = false 
}) => {
  const [selected, setSelected] = useState([...selectedConnectionIds]);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleConnection = (connectionId) => {
    if (selected.includes(connectionId)) {
      setSelected(selected.filter(id => id !== connectionId));
    } else {
      setSelected([...selected, connectionId]);
    }
  };

  const handleSave = () => {
    onSave(selected);
    onClose();
  };

  const filteredConnections = connections.filter(conn => 
    conn.connection_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conn.database_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conn.schema_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        pb: 1,
        bgcolor: 'primary.main',
        color: 'white'
      }}>
        <Box display="flex" alignItems="center" gap={1}>
          <DataObjectIcon />
          <Typography variant="h6">Select Connections</Typography>
        </Box>
        <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {/* Search field */}
        <TextField
          fullWidth
          placeholder="Search connections..."
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />

        {/* Selected connections summary */}
        <Box 
          sx={{ 
            mb: 2, 
            p: 1.5, 
            bgcolor: 'primary.50', 
            borderRadius: 1,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Typography variant="body2" color="primary.dark">
            {selected.length} connection{selected.length !== 1 ? 's' : ''} selected
          </Typography>
          
          {selected.length > 0 && (
            <Button 
              size="small"
              color="primary"
              onClick={() => setSelected([])}
            >
              Clear all
            </Button>
          )}
        </Box>

        {/* Connections list */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : connections.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" gutterBottom>
              No connections available
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Please create a database connection first.
            </Typography>
          </Box>
        ) : (
          <List sx={{ 
            bgcolor: 'background.paper', 
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            maxHeight: 300,
            overflow: 'auto'
          }}>
            {filteredConnections.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  No matching connections found
                </Typography>
              </Box>
            ) : (
              filteredConnections.map((connection) => {
                const isSelected = selected.includes(connection.id);
                return (
                  <ListItem 
                    key={connection.id}
                    button
                    divider
                    onClick={() => toggleConnection(connection.id)}
                    sx={{
                      bgcolor: isSelected ? 'primary.50' : 'transparent',
                      '&:hover': {
                        bgcolor: isSelected ? 'primary.100' : 'action.hover',
                      },
                    }}
                  >
                    <ListItemIcon>
                      <Checkbox 
                        edge="start"
                        checked={isSelected}
                        color="primary"
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body1" fontWeight={isSelected ? 500 : 400}>
                          {connection.connection_name}
                        </Typography>
                      }
                      secondary={
                        <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <StorageIcon fontSize="inherit" color="action" />
                          <Typography variant="caption" component="span">
                            {connection.database_name} • {connection.schema_name}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                );
              })
            )}
          </List>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, bgcolor: 'grey.50' }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          disabled={selected.length === 0}
          startIcon={<CheckIcon />}
        >
          Apply
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConnectionSelector; 