import React, { useState } from 'react';
import { FiDatabase, FiFileText, FiChevronLeft, FiChevronRight, FiFilter, FiDownload, FiInfo } from 'react-icons/fi';

const DataTable = ({ data = [], columns = [] }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const totalPages = Math.ceil(data.length / rowsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const exportToCSV = () => {
    if (!data.length) return;
    
    const csvContent = [
      columns.join(','),
      ...data.map(row => 
        columns.map(col => {
          const value = row[col] !== undefined ? String(row[col]) : '';
          // Escape quotes and handle commas
          return `"${value.replace(/"/g, '""')}"`;
        }).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `data-export-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const paginatedData = data.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  if (!data.length || !columns.length) {
    return (
      <div className="text-gray-600 text-center py-8 px-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col items-center">
        <FiFileText className="h-10 w-10 text-gray-400 mb-3" />
        <span className="text-gray-700 font-medium">No data available</span>
        <p className="text-gray-500 text-sm mt-1">Try modifying your query</p>
      </div>
    );
  }

  return (
    <div className="data-table-container">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center">
          <div className="bg-blue-100 p-1.5 rounded mr-2">
            <FiDatabase className="h-4 w-4 text-blue-600" />
          </div>
          <span className="text-sm font-medium text-gray-700">
            Query Result <span className="text-gray-500">•</span> <span className="text-blue-600 font-semibold">{data.length}</span> {data.length === 1 ? 'row' : 'rows'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center text-sm text-gray-500">
            <FiFilter className="h-4 w-4 mr-1.5" />
            <span>{columns.length} columns</span>
          </div>
          
          <button 
            onClick={exportToCSV}
            className="p-1.5 rounded text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors flex items-center gap-1.5 text-sm"
            title="Export as CSV"
          >
            <FiDownload className="h-4 w-4" />
            <span className="hidden md:inline">Export</span>
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="sticky top-0"
                >
                  <div className="flex items-center gap-1">
                    <span>{column}</span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <FiInfo className="h-3 w-3 text-gray-400" />
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((column, colIndex) => (
                  <td key={colIndex}>
                    {row[column] !== undefined ? String(row[column]) : ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {totalPages > 1 && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span> 
            <span className="text-gray-500 ml-1">({data.length} total rows)</span>
          </div>
          <div className="flex">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`p-1.5 rounded-l-md border border-gray-300 ${
                currentPage === 1
                  ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FiChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`p-1.5 rounded-r-md border-t border-r border-b border-gray-300 ${
                currentPage === totalPages
                  ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FiChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable; 