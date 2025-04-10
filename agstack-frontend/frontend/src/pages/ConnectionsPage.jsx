import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Button,
  TextField,
  CircularProgress,
  Divider,
  Drawer,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Settings as SettingsIcon,
  TableChart as TableIcon,
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import ConnectionsSidebar from '../components/connections/ConnectionsSidebar';
import ConnectionDetails from '../components/connections/ConnectionDetails';
import { connectionApi } from '../services/api';

const DRAWER_WIDTH = 240;

const ConnectionsPage = () => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState(0); // 0: Details/Tables, 1: Settings
  const [formData, setFormData] = useState({
    connection_name: '',
    host: '',
    port: '',
    username: '',
    password: '',
    database_name: '',
    schema_name: '',
  });

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    setLoading(true);
    try {
      const response = await connectionApi.getAllConnections();
      setConnections(response.data);
    } catch (error) {
      toast.error('Failed to fetch connections');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectionSelect = (connectionId) => {
    const connection = connections.find(c => c.id === connectionId);
    setSelectedConnection(connection);
    setFormData({
      connection_name: connection.connection_name,
      host: connection.host,
      port: connection.port.toString(),
      username: connection.username,
      password: '',  // Don't show the password from backend
      database_name: connection.database_name,
      schema_name: connection.schema_name,
    });
    setEditMode(false);
    setActiveTab(0); // Switch to tables view by default
  };

  const handleAddConnection = () => {
    setSelectedConnection(null);
    setFormData({
      connection_name: '',
      host: '',
      port: '',
      username: '',
      password: '',
      database_name: '',
      schema_name: '',
    });
    setEditMode(true);
    setActiveTab(1); // Switch to settings tab
  };

  const handleSave = async () => {
    // Validate required fields
    const requiredFields = ['connection_name', 'host', 'port', 'username', 'database_name', 'schema_name'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Validate port number
    const port = parseInt(formData.port, 10);
    if (isNaN(port) || port <= 0 || port > 65535) {
      toast.error('Please enter a valid port number (1-65535)');
      return;
    }

    setSaving(true);
    try {
      const connectionData = {
        ...formData,
        port: port,
      };

      if (selectedConnection) {
        // Only include password if it was changed
        if (!connectionData.password) {
          delete connectionData.password;
        }
        await connectionApi.updateConnection(selectedConnection.id, connectionData);
        toast.success('Connection updated successfully');
        setEditMode(false);
      } else {
        // Password is required for new connections
        if (!connectionData.password) {
          toast.error('Password is required for new connections');
          return;
        }
        const response = await connectionApi.createConnection(connectionData);
        if (response.data.success) {
          toast.success(response.data.message);
          setEditMode(false);
          // Only reset form if save was successful
          setFormData({
            connection_name: '',
            host: '',
            port: '',
            username: '',
            password: '',
            database_name: '',
            schema_name: '',
          });
        } else {
          toast.error(response.data.message);
        }
      }
      fetchConnections();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save connection');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedConnection) return;

    try {
      await connectionApi.deleteConnection(selectedConnection.id);
      toast.success('Connection deleted successfully');
      setSelectedConnection(null);
      fetchConnections();
    } catch (error) {
      toast.error('Failed to delete connection');
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      {/* Connections Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          height: '100%',
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            position: 'relative',
            borderRight: '1px solid rgba(0, 0, 0, 0.12)',
            height: '100%',
          },
        }}
      >
        <ConnectionsSidebar
          connections={connections.map(conn => ({
            ...conn,
            isSelected: selectedConnection && selectedConnection.id === conn.id
          }))}
          onConnectionSelect={handleConnectionSelect}
          onAddConnection={handleAddConnection}
        />
      </Drawer>

      {/* Main Content */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          flexGrow: 1,
          bgcolor: 'background.default',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Typography variant="h6">
            {selectedConnection ? selectedConnection.connection_name : 'New Connection'}
          </Typography>
          <Box>
            {selectedConnection && (
              <>
                <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
                  <Tab 
                    icon={<TableIcon />} 
                    label="Tables" 
                    iconPosition="start"
                  />
                  <Tab 
                    icon={<SettingsIcon />} 
                    label="Settings" 
                    iconPosition="start"
                  />
                </Tabs>
              </>
            )}
          </Box>
        </Box>

        {/* Main Content Area */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* New Connection or Edit Connection Form */}
              {(!selectedConnection || (selectedConnection && activeTab === 1)) && (
                <Paper elevation={1} sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6">
                      {selectedConnection ? 'Edit Connection' : 'New Connection'}
                    </Typography>
                    {selectedConnection && !editMode && (
                      <Box>
                        <IconButton onClick={() => setEditMode(true)} color="primary">
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={handleDelete} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    )}
                  </Box>

                  <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      label="Name"
                      value={formData.connection_name}
                      onChange={(e) => setFormData({ ...formData, connection_name: e.target.value })}
                      disabled={!editMode}
                      fullWidth
                    />
                    <TextField
                      label="Host"
                      value={formData.host}
                      onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                      disabled={!editMode}
                      fullWidth
                    />
                    <TextField
                      label="Port"
                      value={formData.port}
                      onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                      disabled={!editMode}
                      fullWidth
                    />
                    <TextField
                      label="Username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      disabled={!editMode}
                      fullWidth
                    />
                    <TextField
                      label="Password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      disabled={!editMode}
                      fullWidth
                    />
                    <TextField
                      label="Database"
                      value={formData.database_name}
                      onChange={(e) => setFormData({ ...formData, database_name: e.target.value })}
                      disabled={!editMode}
                      fullWidth
                    />
                    <TextField
                      label="Schema"
                      value={formData.schema_name}
                      onChange={(e) => setFormData({ ...formData, schema_name: e.target.value })}
                      disabled={!editMode}
                      fullWidth
                    />

                    {editMode && (
                      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                        <Button
                          variant="outlined"
                          startIcon={<CancelIcon />}
                          onClick={() => {
                            setEditMode(false);
                            if (!selectedConnection) {
                              setFormData({
                                connection_name: '',
                                host: '',
                                port: '',
                                username: '',
                                password: '',
                                database_name: '',
                                schema_name: '',
                              });
                            }
                          }}
                          disabled={saving}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="contained"
                          startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                          onClick={handleSave}
                          disabled={saving}
                        >
                          {saving ? 'Saving...' : 'Save'}
                        </Button>
                      </Box>
                    )}
                  </Box>
                </Paper>
              )}

              {/* Connection Details (Tables and Columns) */}
              {selectedConnection && activeTab === 0 && (
                <ConnectionDetails connection={selectedConnection} />
              )}

              {/* No Connection Selected */}
              {!selectedConnection && !editMode && (
                <Box 
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '70%',
                    gap: 2 
                  }}
                >
                  <Typography variant="h6" color="text.secondary">
                    No connection selected
                  </Typography>
                  <Typography color="text.secondary">
                    Select a connection from the sidebar or create a new one
                  </Typography>
                  <Button 
                    variant="contained" 
                    startIcon={<AddIcon />}
                    onClick={handleAddConnection}
                    sx={{ mt: 2 }}
                  >
                    Create New Connection
                  </Button>
                </Box>
              )}
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ConnectionsPage; 