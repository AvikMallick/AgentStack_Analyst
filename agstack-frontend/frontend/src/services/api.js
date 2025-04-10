import axios from 'axios';

const BASE_URL = 'http://localhost:8016/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Connection endpoints
export const connectionApi = {
  getAllConnections: () => api.get('/connection/all'),
  createConnection: (connectionData) => api.post('/connection/connect', connectionData),
  updateConnection: (connectionId, connectionData) => api.put(`/connection/${connectionId}`, connectionData),
  deleteConnection: (connectionId) => api.delete(`/connection/${connectionId}`),
  getConnectionTables: (connectionId) => api.get(`/connection/${connectionId}/tables`),
  getTableColumns: (connectionId, tableName) => 
    api.get(`/connection/${connectionId}/tables/${tableName}/columns`),
};

// Chat endpoints
export const chatApi = {
  getAllChats: () => api.get('/chat/chats'),
  getChat: (chatId) => api.get(`/chat/chats/${chatId}`),
  createChat: (chatData) => api.post('/chat/chats', chatData),
  updateChat: (chatId, chatData) => api.put(`/chat/chats/${chatId}`, chatData),
  getChatMessages: (chatId) => api.get(`/chat/chats/${chatId}/messages`),
  sendMessage: (chatId, messageData) => api.post(`/chat/chats/${chatId}/messages`, messageData),
  getMessage: (messageId) => api.get(`/chat/chats/messages/${messageId}`),
};

export default {
  connection: connectionApi,
  chat: chatApi,
}; 