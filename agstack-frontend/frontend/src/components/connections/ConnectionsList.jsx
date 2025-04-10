import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { connectionApi } from '../../services/api';
import { toast } from 'react-hot-toast';
import { 
  FiDatabase, 
  FiServer, 
  FiUser, 
  FiKey, 
  FiLayers, 
  FiTable, 
  FiColumns,
  FiChevronDown, 
  FiChevronRight, 
  FiTrash2, 
  FiLoader,
  FiEye,
  FiEyeOff,
  FiAlertCircle
} from 'react-icons/fi';

const ConnectionsList = ({ connections, onDelete, onRefresh }) => {
  const [expandedConnection, setExpandedConnection] = useState(null);
  const [expandedTable, setExpandedTable] = useState(null);
  const [tables, setTables] = useState({});
  const [columns, setColumns] = useState({});
  const [loading, setLoading] = useState({
    tables: {},
    columns: {},
  });

  const toggleConnection = async (connectionId) => {
    if (expandedConnection === connectionId) {
      setExpandedConnection(null);
      return;
    }

    setExpandedConnection(connectionId);

    // Only fetch tables if we haven't already
    if (!tables[connectionId]) {
      setLoading(prev => ({
        ...prev,
        tables: { ...prev.tables, [connectionId]: true }
      }));

      try {
        const response = await connectionApi.getConnectionTables(connectionId);
        if (response.data.success && response.data.tables) {
          setTables(prev => ({
            ...prev,
            [connectionId]: response.data.tables
          }));
        } else {
          toast.error(response.data.message || 'Failed to fetch tables');
        }
      } catch (error) {
        toast.error('Failed to fetch tables');
      } finally {
        setLoading(prev => ({
          ...prev,
          tables: { ...prev.tables, [connectionId]: false }
        }));
      }
    }
  };

  const toggleTable = async (connectionId, tableName) => {
    const tableKey = `${connectionId}-${tableName}`;
    
    if (expandedTable === tableKey) {
      setExpandedTable(null);
      return;
    }

    setExpandedTable(tableKey);

    // Only fetch columns if we haven't already
    if (!columns[tableKey]) {
      setLoading(prev => ({
        ...prev,
        columns: { ...prev.columns, [tableKey]: true }
      }));

      try {
        const response = await connectionApi.getTableColumns(connectionId, tableName);
        setColumns(prev => ({
          ...prev,
          [tableKey]: response.data
        }));
      } catch (error) {
        toast.error('Failed to fetch columns');
      } finally {
        setLoading(prev => ({
          ...prev,
          columns: { ...prev.columns, [tableKey]: false }
        }));
      }
    }
  };

  const handleDelete = async (connectionId, connectionName) => {
    if (window.confirm(`Are you sure you want to delete connection "${connectionName}"?`)) {
      try {
        const response = await connectionApi.deleteConnection(connectionId);
        if (response.data.success) {
          toast.success(response.data.message || 'Connection deleted successfully');
          if (onDelete) {
            onDelete(connectionId);
          }
        } else {
          toast.error(response.data.message || 'Failed to delete connection');
        }
      } catch (error) {
        toast.error('Failed to delete connection');
      }
    }
  };

  if (!connections || connections.length === 0) {
    return (
      <Card className="shadow-md rounded-xl overflow-hidden text-center py-8">
        <FiAlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 font-medium">No connections found</p>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      {connections.map((connection) => (
        <Card key={connection.id} className="overflow-visible shadow-md rounded-xl">
          <div className="p-5 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <div
                className="flex items-center cursor-pointer"
                onClick={() => toggleConnection(connection.id)}
              >
                <FiDatabase className="h-5 w-5 text-blue-500 mr-3" />
                <h3 className="font-semibold text-gray-800 hover:text-blue-600 transition-colors">
                  {connection.connection_name}
                </h3>
                {expandedConnection === connection.id ? (
                  <FiChevronDown className="ml-2 h-4 w-4 text-gray-500" />
                ) : (
                  <FiChevronRight className="ml-2 h-4 w-4 text-gray-500" />
                )}
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => toggleConnection(connection.id)}
                  className="flex items-center gap-2 bg-gray-50 border border-gray-200"
                >
                  {expandedConnection === connection.id ? (
                    <>
                      <FiEyeOff className="h-4 w-4" />
                      <span>Hide Tables</span>
                    </>
                  ) : (
                    <>
                      <FiEye className="h-4 w-4" />
                      <span>Show Tables</span>
                    </>
                  )}
                </Button>
                <Button 
                  variant="danger" 
                  size="sm"
                  onClick={() => handleDelete(connection.id, connection.connection_name)}
                  className="flex items-center gap-2"
                >
                  <FiTrash2 className="h-4 w-4" />
                  <span>Delete</span>
                </Button>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg flex items-start">
                <FiServer className="h-4 w-4 text-gray-500 mt-0.5 mr-2" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Server</p>
                  <p className="text-sm text-gray-800">{connection.host}:{connection.port}</p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg flex items-start">
                <FiDatabase className="h-4 w-4 text-gray-500 mt-0.5 mr-2" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Database</p>
                  <p className="text-sm text-gray-800">{connection.database_name}</p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg flex items-start">
                <FiLayers className="h-4 w-4 text-gray-500 mt-0.5 mr-2" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Schema</p>
                  <p className="text-sm text-gray-800">{connection.schema_name}</p>
                </div>
              </div>
            </div>
          </div>

          {expandedConnection === connection.id && (
            <div className="p-5">
              <div className="flex items-center mb-4">
                <FiTable className="h-4 w-4 text-blue-500 mr-2" />
                <h4 className="font-medium text-gray-800">Database Tables</h4>
              </div>
              
              {loading.tables[connection.id] ? (
                <div className="flex items-center py-8 justify-center">
                  <FiLoader className="h-6 w-6 text-blue-500 animate-spin mr-3" />
                  <p className="text-gray-600">Loading tables...</p>
                </div>
              ) : tables[connection.id] && tables[connection.id].length > 0 ? (
                <div className="bg-gray-50 rounded-lg border border-gray-200">
                  <ul className="divide-y divide-gray-200">
                    {tables[connection.id].map((tableName) => (
                      <li key={tableName} className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <FiTable className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-800 font-medium">{tableName}</span>
                          </div>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => toggleTable(connection.id, tableName)}
                            className="flex items-center gap-2 bg-white shadow-sm"
                          >
                            {expandedTable === `${connection.id}-${tableName}` ? (
                              <>
                                <FiEyeOff className="h-3.5 w-3.5" />
                                <span>Hide Columns</span>
                              </>
                            ) : (
                              <>
                                <FiEye className="h-3.5 w-3.5" />
                                <span>Show Columns</span>
                              </>
                            )}
                          </Button>
                        </div>
                        
                        {expandedTable === `${connection.id}-${tableName}` && (
                          <div className="mt-3 pl-6 bg-white rounded-lg border border-gray-200 p-3">
                            <div className="flex items-center mb-2">
                              <FiColumns className="h-4 w-4 text-blue-500 mr-2" />
                              <h5 className="font-medium text-gray-800 text-sm">Columns</h5>
                            </div>
                            
                            {loading.columns[`${connection.id}-${tableName}`] ? (
                              <div className="flex items-center py-4 justify-center">
                                <FiLoader className="h-5 w-5 text-blue-400 animate-spin mr-2" />
                                <div className="text-gray-600 text-sm">Loading columns...</div>
                              </div>
                            ) : columns[`${connection.id}-${tableName}`] ? (
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {columns[`${connection.id}-${tableName}`].map((column, idx) => (
                                  <div key={idx} className="text-sm py-1 px-2 bg-gray-50 rounded border border-gray-100 flex items-center">
                                    <div className="w-2 h-2 rounded-full bg-gray-400 mr-2"></div>
                                    <span className="text-gray-700">{column}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-gray-500 text-sm py-2">No columns found</div>
                            )}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
                  <FiAlertCircle className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">No tables found in this database</p>
                </div>
              )}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};

export default ConnectionsList; 