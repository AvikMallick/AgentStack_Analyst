import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import DataTable from '../common/DataTable';
import { FiCode, FiUser, FiCpu, FiExternalLink, FiAlertCircle, FiClipboard, FiCheck } from 'react-icons/fi';

const ChatMessage = ({ message }) => {
  const [showCode, setShowCode] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  
  const isUser = message.role === 'user';
  const isError = message.status === 'failed';
  const isComplete = message.status === 'completed';
  const isProcessing = message.status === 'processing';
  const isPending = message.status === 'pending';
  
  const copyCode = () => {
    if (message.generated_code) {
      navigator.clipboard.writeText(message.generated_code);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };
  
  const renderContent = () => {
    if (isUser) {
      return <p className="whitespace-pre-wrap text-gray-800 leading-relaxed">{message.content}</p>;
    }
    
    if (isPending || isProcessing) {
      return (
        <div className="flex items-center space-x-3 py-2">
          <div className="relative h-8 w-8">
            <div className="absolute animate-ping h-full w-full rounded-full bg-blue-400 opacity-30"></div>
            <div className="relative rounded-full h-8 w-8 flex items-center justify-center bg-blue-50">
              <svg className="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          </div>
          <span className="text-gray-700 font-medium text-sm">{isProcessing ? 'Processing query...' : 'Waiting for response...'}</span>
        </div>
      );
    }
    
    if (isError) {
      const errorContent = message.result_content?.error 
        ? message.result_content 
        : { error: 'An error occurred', details: 'The query could not be processed' };
      
      return (
        <div className="text-red-600 p-4 bg-red-50 rounded-lg border border-red-200">
          <div className="flex items-center mb-2">
            <FiAlertCircle className="h-5 w-5 mr-2" />
            <p className="font-medium">{errorContent.error}</p>
          </div>
          {errorContent.details && (
            <div className="mt-2 text-sm overflow-auto max-h-32 bg-white p-3 rounded border border-red-100">
              <pre className="whitespace-pre-wrap font-mono text-xs">{JSON.stringify(errorContent.details, null, 2)}</pre>
            </div>
          )}
        </div>
      );
    }
    
    if (isComplete && message.result_content) {
      return (
        <div>
          {message.result_content.error ? (
            <div className="text-red-600 p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center">
                <FiAlertCircle className="h-5 w-5 mr-2" />
                <p>{message.result_content.error}</p>
              </div>
            </div>
          ) : (
            <div>
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <DataTable 
                  columns={message.result_content.columns || []} 
                  data={message.result_content.data || []}
                />
              </div>
              
              {message.generated_code && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowCode(!showCode)}
                      className="text-gray-700 bg-gray-100 hover:bg-gray-200 flex items-center gap-2"
                    >
                      <FiCode className="h-4 w-4" />
                      <span>{showCode ? 'Hide Python Code' : 'Show Python Code'}</span>
                    </Button>
                    
                    {showCode && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={copyCode}
                        className="text-gray-700 bg-gray-100 hover:bg-gray-200 flex items-center gap-2"
                      >
                        {codeCopied ? (
                          <>
                            <FiCheck className="h-4 w-4 text-green-500" />
                            <span className="text-green-600">Copied!</span>
                          </>
                        ) : (
                          <>
                            <FiClipboard className="h-4 w-4" />
                            <span>Copy</span>
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  
                  {showCode && (
                    <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200 shadow-sm transition-all">
                      <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                        <span className="text-xs font-medium text-gray-600">Generated Python</span>
                      </div>
                      <pre className="p-4 overflow-auto text-sm max-h-64 whitespace-pre">
                        <code className="text-gray-800 font-mono">{message.generated_code}</code>
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      );
    }
    
    return <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{message.content || 'No content'}</p>;
  };
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`max-w-3xl rounded-xl shadow-sm ${
          isUser 
            ? 'bg-blue-50 border border-blue-100' 
            : isError 
              ? 'bg-red-50 border border-red-100' 
              : 'bg-white border border-gray-200'
        }`}
      >
        <div className="flex items-center px-5 py-3 border-b border-gray-100">
          <div className={`h-8 w-8 rounded-full mr-3 flex items-center justify-center text-sm ${
            isUser ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white'
          }`}>
            {isUser ? <FiUser className="h-4 w-4" /> : <FiCpu className="h-4 w-4" />}
          </div>
          <span className="font-medium text-gray-800 text-sm">
            {isUser ? 'You' : 'Assistant'}
          </span>
          {message.agentops_session_url && (
            <a 
              href={message.agentops_session_url} 
              target="_blank"
              rel="noopener noreferrer" 
              className="ml-3 text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors flex items-center"
            >
              <FiExternalLink className="h-3 w-3 mr-1" />
              View Trace
            </a>
          )}
        </div>
        
        <div className="px-5 py-4">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage; 