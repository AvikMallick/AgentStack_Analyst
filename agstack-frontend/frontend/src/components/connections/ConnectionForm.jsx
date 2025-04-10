import React, { useState } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import Card from '../common/Card';
import { connectionApi } from '../../services/api';
import { toast } from 'react-hot-toast';
import { FiDatabase, FiServer, FiUser, FiKey, FiLayers, FiTable, FiCheck, FiLoader, FiRefreshCw } from 'react-icons/fi';

const ConnectionForm = ({ onSuccess }) => {
  const initialFormData = {
    connection_name: '',
    host: '',
    port: '',
    username: '',
    password: '',
    database_name: '',
    schema_name: '',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [tableList, setTableList] = useState([]);
  const [showTables, setShowTables] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'port' ? Number(value) || '' : value,
    });
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.connection_name.trim()) {
      newErrors.connection_name = 'Connection name is required';
    }

    if (!formData.host.trim()) {
      newErrors.host = 'Host is required';
    }

    if (!formData.port) {
      newErrors.port = 'Port is required';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    }
    
    if (!formData.database_name.trim()) {
      newErrors.database_name = 'Database name is required';
    }
    
    if (!formData.schema_name.trim()) {
      newErrors.schema_name = 'Schema name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsLoading(true);
    setShowTables(false);
    
    try {
      const response = await connectionApi.createConnection(formData);
      
      if (response.data.success) {
        toast.success('Connection created successfully!');
        
        if (response.data.tables && response.data.tables.length > 0) {
          setTableList(response.data.tables);
          setShowTables(true);
        } else {
          toast.info('No tables found in the selected schema');
        }
        
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast.error(response.data.message || 'Failed to create connection');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create connection';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setErrors({});
    setShowTables(false);
  };

  return (
    <div>
      <Card className="shadow-md rounded-xl overflow-hidden">
        <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex items-center">
          <FiDatabase className="h-5 w-5 text-blue-500 mr-3" />
          <h2 className="text-xl font-semibold text-gray-800">Add New Connection</h2>
        </div>
        
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-6 bg-blue-50 rounded-lg p-4 border border-blue-100">
              <div className="flex items-center mb-3">
                <FiDatabase className="text-blue-600 h-5 w-5 mr-2" />
                <h3 className="font-medium text-blue-800">Connection Details</h3>
              </div>
              
              <Input
                label="Connection Name"
                id="connection_name"
                name="connection_name"
                value={formData.connection_name}
                onChange={handleChange}
                placeholder="My Database Connection"
                required
                error={errors.connection_name}
                icon={<FiDatabase className="h-4 w-4 text-gray-400" />}
              />
            </div>

            <div className="mb-6 bg-gray-50 rounded-lg p-4 border border-gray-100">
              <div className="flex items-center mb-3">
                <FiServer className="text-gray-600 h-5 w-5 mr-2" />
                <h3 className="font-medium text-gray-800">Server Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Host"
                  id="host"
                  name="host"
                  value={formData.host}
                  onChange={handleChange}
                  placeholder="localhost"
                  required
                  error={errors.host}
                  icon={<FiServer className="h-4 w-4 text-gray-400" />}
                />

                <Input
                  label="Port"
                  id="port"
                  name="port"
                  type="number"
                  value={formData.port}
                  onChange={handleChange}
                  placeholder="5432"
                  required
                  error={errors.port}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <Input
                  label="Username"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  error={errors.username}
                  icon={<FiUser className="h-4 w-4 text-gray-400" />}
                />

                <Input
                  label="Password"
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  error={errors.password}
                  icon={<FiKey className="h-4 w-4 text-gray-400" />}
                />
              </div>
            </div>

            <div className="mb-6 bg-gray-50 rounded-lg p-4 border border-gray-100">
              <div className="flex items-center mb-3">
                <FiLayers className="text-gray-600 h-5 w-5 mr-2" />
                <h3 className="font-medium text-gray-800">Database Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Database Name"
                  id="database_name"
                  name="database_name"
                  value={formData.database_name}
                  onChange={handleChange}
                  required
                  error={errors.database_name}
                  icon={<FiDatabase className="h-4 w-4 text-gray-400" />}
                />

                <Input
                  label="Schema Name"
                  id="schema_name"
                  name="schema_name"
                  value={formData.schema_name}
                  onChange={handleChange}
                  placeholder="public"
                  required
                  error={errors.schema_name}
                  icon={<FiLayers className="h-4 w-4 text-gray-400" />}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button
                type="button"
                variant="secondary"
                onClick={handleReset}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <FiRefreshCw className="h-4 w-4" />
                Reset
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 bg-blue-600 text-white"
              >
                {isLoading ? (
                  <>
                    <FiLoader className="h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <FiCheck className="h-4 w-4" />
                    Add Connection
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </Card>

      {showTables && tableList.length > 0 && (
        <Card className="mt-6 shadow-md rounded-xl overflow-hidden">
          <div className="bg-green-50 px-6 py-4 border-b border-green-100 flex items-center">
            <FiTable className="h-5 w-5 text-green-500 mr-3" />
            <h2 className="text-xl font-semibold text-gray-800">Available Tables</h2>
          </div>
          
          <div className="p-6">
            <div className="max-h-64 overflow-y-auto bg-gray-50 rounded-lg border border-gray-200">
              <ul className="divide-y divide-gray-200">
                {tableList.map((table, index) => (
                  <li key={index} className="py-3 px-4 hover:bg-gray-100 flex items-center">
                    <FiTable className="h-4 w-4 text-gray-400 mr-3" />
                    <span className="text-gray-700">{table}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ConnectionForm; 