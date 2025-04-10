import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  CircularProgress,
  Divider,
  Drawer,
  Button,
  TextField,
  Stack,
  Alert,
  Tooltip,
  Card,
  CardContent,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Send as SendIcon,
  Add as AddIcon,
  Chat as ChatIcon,
  SaveAlt as SaveIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import ChatSidebar from '../components/chat/ChatSidebar';
import ConnectedDatabases from '../components/chat/ConnectedDatabases';
import CreateChatModal from '../components/chat/CreateChatModal';
import { chatApi, connectionApi } from '../services/api';

const DRAWER_WIDTH = 280;

const ChatPage = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [createChatOpen, setCreateChatOpen] = useState(false);
  const [creatingChat, setCreatingChat] = useState(false);
  const [connectionsLoading, setConnectionsLoading] = useState(false);
  const [messagesEndRef, setMessagesEndRef] = useState(null);
  const [chatTitle, setChatTitle] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  // Effect to load chats on mount
  useEffect(() => {
    fetchChats();
  }, []);

  // Effect to load messages when a chat is selected
  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat);
      const chat = chats.find(c => c.id === selectedChat);
      setChatTitle(chat?.title || 'New Chat');
    } else {
      setChatTitle('');
      setMessages([]);
    }
  }, [selectedChat, chats]);

  // Effect to scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    if (messagesEndRef) {
      messagesEndRef.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Fetch all chats
  const fetchChats = async () => {
    setLoading(true);
    try {
      const response = await chatApi.getAllChats();
      setChats(response.data);
    } catch (error) {
      toast.error('Failed to fetch chats');
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for a specific chat
  const fetchMessages = async (chatId) => {
    setMessagesLoading(true);
    try {
      const response = await chatApi.getChatMessages(chatId);
      setMessages(response.data);
    } catch (error) {
      toast.error('Failed to fetch messages');
      console.error('Error fetching messages:', error);
    } finally {
      setMessagesLoading(false);
    }
  };

  // Handle chat selection from sidebar
  const handleChatClick = (chatId) => {
    setSelectedChat(chatId);
  };

  // Create a new chat
  const handleCreateChat = async (chatData) => {
    setCreatingChat(true);
    try {
      const response = await chatApi.createChat(chatData);
      toast.success('Chat created successfully');
      setSelectedChat(response.data.id);
      await fetchChats();
      setCreateChatOpen(false);
    } catch (error) {
      toast.error('Failed to create chat');
      console.error('Error creating chat:', error);
    } finally {
      setCreatingChat(false);
    }
  };

  // Update the chat title
  const handleUpdateTitle = async () => {
    if (!chatTitle.trim() || !selectedChat) return;
    
    try {
      await chatApi.updateChat(selectedChat, { title: chatTitle });
      // Update local state
      setChats(prev => prev.map(chat => 
        chat.id === selectedChat ? { ...chat, title: chatTitle } : chat
      ));
      setEditingTitle(false);
      toast.success('Chat title updated');
    } catch (error) {
      toast.error('Failed to update chat title');
      console.error('Error updating chat title:', error);
    }
  };

  // Send a message
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedChat) return;
    
    setSendingMessage(true);

    // Create optimistic messages
    const optimisticUserMsg = {
      id: `temp-${Date.now()}`,
      content: messageInput,
      role: 'user',
      status: 'completed',
      created_at: new Date().toISOString(),
      message_index: messages.length,
    };

    const optimisticAssistantMsg = {
      id: `temp-${Date.now() + 1}`,
      content: '',
      role: 'assistant',
      status: 'pending',
      created_at: new Date().toISOString(),
      message_index: messages.length + 1,
    };

    // Add optimistic messages to UI
    setMessages(prev => [...prev, optimisticUserMsg, optimisticAssistantMsg]);
    
    // Save the message text and clear input
    const messageText = messageInput;
    setMessageInput('');

    try {
      const messageData = {
        content: messageText,
        role: 'user',
      };

      // Use the sendMessage endpoint
      await chatApi.sendMessage(selectedChat, messageData);
      
      // Refresh messages
      fetchMessages(selectedChat);

    } catch (error) {
      // Remove optimistic messages on error
      setMessages(prev => prev.filter(msg => 
        msg.id !== optimisticUserMsg.id && msg.id !== optimisticAssistantMsg.id
      ));
      toast.error(error.response?.data?.message || 'Failed to send message');
      console.error('Error sending message:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  // Check if sending a message is blocked
  const isMessageBlocked = () => {
    return (
      !selectedChat || 
      messages.some(msg => msg.role === 'assistant' && ['pending', 'processing'].includes(msg.status)) ||
      sendingMessage
    );
  };

  // Get the selected chat with connections
  const getSelectedChatWithConnections = () => {
    return chats.find(chat => chat.id === selectedChat);
  };

  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      {/* Chat Sidebar */}
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
        <ChatSidebar
          chats={chats.map(chat => ({
            id: chat.id,
            title: chat.title || 'New Chat',
            lastMessage: 'Click to view messages',  // Could be enhanced to show last message
            isSelected: chat.id === selectedChat,
          }))}
          onChatSelect={handleChatClick}
          onNewChat={() => setCreateChatOpen(true)}
          loading={loading}
        />
      </Drawer>

      {/* Main Chat Area */}
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
        {selectedChat ? (
          <Box
            sx={{
              px: 2,
              py: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
                {editingTitle ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TextField
                      value={chatTitle}
                      onChange={(e) => setChatTitle(e.target.value)}
                      size="small"
                      placeholder="Enter chat title"
                      sx={{ width: 200 }}
                      autoFocus
                    />
                    <IconButton 
                      size="small" 
                      color="primary" 
                      onClick={handleUpdateTitle}
                      disabled={!chatTitle.trim()}
                    >
                      <SaveIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ) : (
                  <>
                    <Typography variant="h6" sx={{ mr: 1 }}>
                      {chatTitle || 'Chat'}
                    </Typography>
                    <IconButton 
                      size="small" 
                      onClick={() => setEditingTitle(true)}
                      sx={{ ml: 0.5 }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </>
                )}
              </Box>
            </Box>

            <ConnectedDatabases
              connections={getSelectedChatWithConnections()?.connections || []}
              onManageConnections={() => {/* Not implemented */}}
              readOnly={true}  // For now, connections can only be set at creation
            />
          </Box>
        ) : (
          <Box
            sx={{
              px: 2,
              py: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderBottom: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <Typography variant="h6">
              Welcome to AgStack Chat
            </Typography>
          </Box>
        )}

        {/* Messages or Welcome */}
        <Box 
          sx={{ 
            flex: 1, 
            overflow: 'auto', 
            bgcolor: '#f5f7f9',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {!selectedChat ? (
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                height: '100%',
                p: 4,
                textAlign: 'center',
              }}
            >
              <Card
                elevation={0}
                sx={{
                  maxWidth: 500,
                  width: '100%',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                  borderRadius: 2,
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <ChatIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h5" gutterBottom fontWeight={500}>
                    Create Your First Chat
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    Connect to your databases and ask questions in natural language. Select your database connections and start a new conversation.
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<AddIcon />}
                    onClick={() => setCreateChatOpen(true)}
                    sx={{ mt: 2 }}
                  >
                    Create New Chat
                  </Button>
                </CardContent>
              </Card>
            </Box>
          ) : messagesLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
              <CircularProgress />
            </Box>
          ) : messages.length > 0 ? (
            <Box sx={{ flex: 1, p: 2, maxWidth: '850px', width: '100%', alignSelf: 'center' }}>
              {messages.map((message) => (
                <Box
                  key={message.id}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: message.role === 'user' ? 'flex-end' : 'flex-start',
                    mb: 2,
                  }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      maxWidth: '70%',
                      backgroundColor: message.role === 'user' ? 'primary.main' : 'white',
                      color: message.role === 'user' ? 'white' : 'text.primary',
                      borderRadius: 2,
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                    }}
                  >
                    <Typography>{message.content}</Typography>
                    {message.status === 'pending' && (
                      <Box display="flex" justifyContent="center" mt={1}>
                        <CircularProgress size={16} sx={{ color: message.role === 'user' ? 'white' : 'primary.main' }} />
                      </Box>
                    )}
                    {message.status === 'failed' && (
                      <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
                        Failed to process message
                      </Typography>
                    )}
                    {message.generated_code && (
                      <Box mt={2}>
                        <Typography variant="caption" sx={{ color: message.role === 'user' ? 'white' : 'text.secondary' }}>
                          Generated SQL:
                        </Typography>
                        <Paper sx={{ 
                          p: 1, 
                          mt: 1, 
                          bgcolor: message.role === 'user' ? 'rgba(255,255,255,0.1)' : 'grey.100',
                          fontFamily: 'monospace',
                          fontSize: '0.85rem',
                        }}>
                          {message.generated_code}
                        </Paper>
                      </Box>
                    )}
                    {message.result_content && !message.result_content.error && (
                      <Box mt={2}>
                        <Typography variant="caption" sx={{ color: message.role === 'user' ? 'white' : 'text.secondary' }}>
                          Result:
                        </Typography>
                        <Paper sx={{ 
                          p: 1, 
                          mt: 1, 
                          bgcolor: message.role === 'user' ? 'rgba(255,255,255,0.1)' : 'grey.100',
                          overflow: 'auto',
                        }}>
                          {message.result_content.data && (
                            <Box sx={{ overflowX: 'auto' }}>
                              <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                                <thead>
                                  <tr>
                                    {message.result_content.columns.map((col, i) => (
                                      <th key={i} style={{ 
                                        textAlign: 'left', 
                                        padding: '8px', 
                                        borderBottom: '1px solid #ddd',
                                        fontWeight: 600,
                                        fontSize: '0.85rem',
                                        whiteSpace: 'nowrap',
                                      }}>
                                        {col}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {message.result_content.data.map((row, i) => (
                                    <tr key={i} style={{ 
                                      backgroundColor: i % 2 === 0 ? '#f9f9f9' : 'transparent' 
                                    }}>
                                      {message.result_content.columns.map((col, j) => (
                                        <td key={j} style={{ 
                                          padding: '6px 8px', 
                                          borderBottom: '1px solid #eee',
                                          fontSize: '0.8rem',
                                          maxWidth: '250px',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          whiteSpace: 'nowrap',
                                        }}>
                                          {row[col]?.toString() || ''}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </Box>
                          )}
                          {!message.result_content.data && (
                            <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                              No data returned
                            </Typography>
                          )}
                        </Paper>
                      </Box>
                    )}
                    {message.result_content?.error && (
                      <Box mt={2}>
                        <Typography variant="caption" color="error">
                          Error: {message.result_content.error}
                        </Typography>
                      </Box>
                    )}
                    {message.agentops_session_url && (
                      <Box mt={1}>
                        <a 
                          href={message.agentops_session_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ 
                            color: message.role === 'user' ? 'white' : 'primary',
                            fontSize: '0.85rem',
                          }}
                        >
                          View Session Details
                        </a>
                      </Box>
                    )}
                  </Paper>
                </Box>
              ))}
              <div ref={(el) => setMessagesEndRef(el)} />
            </Box>
          ) : (
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                height: '100%',
                p: 4,
                textAlign: 'center',
              }}
            >
              <Typography color="text.secondary">
                Start the conversation by sending a message below
              </Typography>
            </Box>
          )}
        </Box>

        {/* Message Input */}
        {selectedChat && (
          <Box
            component="form"
            sx={{
              p: 2,
              borderTop: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              gap: 1,
              maxWidth: '850px',
              margin: '0 auto',
            }}>
              <TextField
                fullWidth
                placeholder="Type your message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                disabled={isMessageBlocked()}
                variant="outlined"
                size="small"
                sx={{ bgcolor: 'white' }}
              />
              <IconButton
                type="submit"
                color="primary"
                disabled={!messageInput.trim() || isMessageBlocked()}
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                  '&.Mui-disabled': {
                    bgcolor: 'action.disabledBackground',
                    color: 'action.disabled',
                  },
                }}
              >
                {sendingMessage ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
              </IconButton>
            </Box>
          </Box>
        )}

        {/* Create Chat Modal */}
        <CreateChatModal
          open={createChatOpen}
          onClose={() => setCreateChatOpen(false)}
          onSave={handleCreateChat}
          loading={creatingChat}
        />
      </Box>
    </Box>
  );
};

export default ChatPage; 