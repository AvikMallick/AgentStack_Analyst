import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Box,
  CircularProgress,
  Typography,
  Chip,
} from '@mui/material';
import { connectionApi } from '../../services/api';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

export default function CreateChatModal({ open, onClose, onSave, loading = false }) {
  const [title, setTitle] = useState('');
  const [connections, setConnections] = useState([]);
  const [selectedConnectionIds, setSelectedConnectionIds] = useState([]);
  const [errors, setErrors] = useState({});
  const [loadingConnections, setLoadingConnections] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle('');
      setSelectedConnectionIds([]);
      setErrors({});
      fetchConnections();
    }
  }, [open]);

  const fetchConnections = async () => {
    setLoadingConnections(true);
    try {
      const response = await connectionApi.getAllConnections();
      setConnections(response.data);
    } catch (error) {
      console.error('Failed to fetch connections:', error);
    } finally {
      setLoadingConnections(false);
    }
  };

  const handleConnectionChange = (event) => {
    const value = event.target.value;
    setSelectedConnectionIds(value);
    
    if (value.length > 0) {
      setErrors((prev) => ({ ...prev, connections: '' }));
    }
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    if (e.target.value.trim()) {
      setErrors((prev) => ({ ...prev, title: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!title.trim()) {
      newErrors.title = 'Chat name is required';
    }
    
    if (selectedConnectionIds.length === 0) {
      newErrors.connections = 'At least one connection is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSave({
        title,
        connection_ids: selectedConnectionIds,
      });
    }
  };

  const renderConnectionName = (connection) => (
    <Box>
      <Typography variant="body2" noWrap>
        {connection.connection_name}
      </Typography>
      <Typography variant="caption" color="text.secondary" noWrap>
        {connection.database_name} • {connection.schema_name}
      </Typography>
    </Box>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Chat</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Chat Name"
            fullWidth
            value={title}
            onChange={handleTitleChange}
            error={!!errors.title}
            helperText={errors.title}
            variant="outlined"
            placeholder="Enter a name for this chat"
            autoFocus
          />

          <FormControl fullWidth error={!!errors.connections}>
            <InputLabel id="connections-select-label">Database Connections</InputLabel>
            <Select
              labelId="connections-select-label"
              multiple
              value={selectedConnectionIds}
              onChange={handleConnectionChange}
              input={<OutlinedInput label="Database Connections" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((id) => {
                    const connection = connections.find(conn => conn.id === id);
                    return (
                      <Chip 
                        key={id} 
                        label={connection?.connection_name} 
                        size="small" 
                      />
                    );
                  })}
                </Box>
              )}
              MenuProps={MenuProps}
              disabled={loadingConnections}
            >
              {loadingConnections ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : connections.length > 0 ? (
                connections.map((connection) => (
                  <MenuItem key={connection.id} value={connection.id}>
                    <Checkbox checked={selectedConnectionIds.includes(connection.id)} />
                    <ListItemText 
                      primary={connection.connection_name}
                      secondary={`${connection.database_name} • ${connection.schema_name}`}
                    />
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>
                  <Typography variant="body2" color="text.secondary">
                    No connections available. Please create a connection first.
                  </Typography>
                </MenuItem>
              )}
            </Select>
            {errors.connections && (
              <FormHelperText>{errors.connections}</FormHelperText>
            )}
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading || loadingConnections}
        >
          {loading ? <CircularProgress size={24} /> : 'Create Chat'}
        </Button>
      </DialogActions>
    </Dialog>
  );
} 