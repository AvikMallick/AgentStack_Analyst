import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  TableChart as TableIcon,
  ViewColumn as ColumnIcon,
} from '@mui/icons-material';
import { connectionApi } from '../../services/api';
import { toast } from 'react-hot-toast';

export default function ConnectionDetails({ connection }) {
  const [tables, setTables] = useState([]);
  const [expandedTable, setExpandedTable] = useState(null);
  const [columns, setColumns] = useState({});
  const [loadingTables, setLoadingTables] = useState(false);
  const [loadingColumns, setLoadingColumns] = useState({});

  useEffect(() => {
    if (connection) {
      fetchTables(connection.id);
    }
  }, [connection]);

  const fetchTables = async (connectionId) => {
    setLoadingTables(true);
    try {
      const response = await connectionApi.getConnectionTables(connectionId);
      if (response.data && Array.isArray(response.data.tables)) {
        setTables(response.data.tables);
      } else if (response.data && Array.isArray(response.data)) {
        setTables(response.data);
      } else {
        toast.error('Failed to load tables');
        setTables([]);
      }
    } catch (error) {
      toast.error('Error loading tables');
      console.error(error);
      setTables([]);
    } finally {
      setLoadingTables(false);
    }
  };

  const handleTableExpand = async (tableName) => {
    if (expandedTable === tableName) {
      setExpandedTable(null);
      return;
    }

    setExpandedTable(tableName);

    // Only fetch columns if not already loaded
    if (!columns[tableName]) {
      setLoadingColumns({ ...loadingColumns, [tableName]: true });
      try {
        const response = await connectionApi.getTableColumns(connection.id, tableName);
        if (response && response.data) {
          setColumns({ ...columns, [tableName]: response.data });
        }
      } catch (error) {
        toast.error('Error loading columns');
        console.error(error);
      } finally {
        setLoadingColumns({ ...loadingColumns, [tableName]: false });
      }
    }
  };

  if (!connection) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Typography color="text.secondary">Select a connection to view details</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Connection Details
        </Typography>
        <Paper elevation={1} sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">Connection Name</Typography>
              <Typography variant="body1">{connection.connection_name}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">Database</Typography>
              <Typography variant="body1">{connection.database_name}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">Host</Typography>
              <Typography variant="body1">{connection.host}:{connection.port}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">Schema</Typography>
              <Typography variant="body1">{connection.schema_name}</Typography>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      <Typography variant="h5" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        <TableIcon sx={{ mr: 1 }} />
        Database Tables
      </Typography>

      {loadingTables ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : tables.length === 0 ? (
        <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">No tables found in this database</Typography>
        </Paper>
      ) : (
        <Box sx={{ mb: 4 }}>
          {tables.map((tableName) => (
            <Accordion 
              key={tableName} 
              expanded={expandedTable === tableName}
              onChange={() => handleTableExpand(tableName)}
              sx={{ mb: 1 }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{ 
                  '&.Mui-expanded': {
                    borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
                  } 
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TableIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="subtitle1">{tableName}</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                {loadingColumns[tableName] ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress size={30} />
                  </Box>
                ) : columns[tableName] && columns[tableName].length > 0 ? (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell><Typography variant="subtitle2">Column Name</Typography></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {columns[tableName].map((columnName, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <ColumnIcon fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
                                <Typography variant="body2">{columnName}</Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="text.secondary">No columns found for this table</Typography>
                  </Box>
                )}
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}
    </Box>
  );
} 