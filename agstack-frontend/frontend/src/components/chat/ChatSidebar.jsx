import { useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  IconButton,
  InputBase,
  Paper,
  Divider,
  CircularProgress,
  Tooltip,
  Button,
} from '@mui/material';
import { 
  Add as AddIcon, 
  Search as SearchIcon,
  ChatBubbleOutline as ChatIcon,
  SentimentDissatisfied as EmptyIcon
} from '@mui/icons-material';

export default function ChatSidebar({ 
  chats = [], 
  onChatSelect, 
  onNewChat,
  loading = false 
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChats = chats.filter((chat) =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#f8fafc' }}>
      {/* Header */}
      <Box sx={{ 
        p: 1.5,
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}>
        <Typography variant="subtitle1" fontWeight={500}>
          Chats
        </Typography>
        <Tooltip title="New Chat">
          <IconButton onClick={onNewChat} color="primary" size="small">
            <AddIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Search */}
      <Box sx={{ p: 1.5 }}>
        <Paper
          component="form"
          variant="outlined"
          sx={{
            p: '2px 4px',
            display: 'flex',
            alignItems: 'center',
            borderRadius: 1,
          }}
        >
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <IconButton type="button" sx={{ p: '8px' }} aria-label="search">
            <SearchIcon />
          </IconButton>
        </Paper>
      </Box>

      {/* Chat List */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
            <CircularProgress />
          </Box>
        ) : filteredChats.length > 0 ? (
          <List sx={{ 
            px: 1,
            '& .MuiListItem-root': {
              p: 0.5,
            },
          }}>
            {filteredChats.map((chat) => (
              <ListItem key={chat.id} disablePadding>
                <ListItemButton
                  selected={chat.isSelected}
                  onClick={() => onChatSelect(chat.id)}
                  sx={{
                    borderRadius: 1,
                    '&.Mui-selected': {
                      backgroundColor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      },
                      '& .MuiTypography-root': {
                        color: 'white',
                      },
                    },
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <ChatIcon sx={{ fontSize: 18, mr: 1, opacity: 0.7 }} />
                        <Typography 
                          variant="body2" 
                          fontWeight={chat.isSelected ? 500 : 400}
                          noWrap
                        >
                          {chat.title}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          opacity: 0.7,
                          display: 'block',
                          pl: 3.5,
                        }}
                        noWrap
                      >
                        {chat.lastMessage}
                      </Typography>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        ) : (
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              height: 200,
              p: 3,
              textAlign: 'center',
            }}
          >
            <EmptyIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
            <Typography color="text.secondary" variant="body2">
              {searchQuery ? 'No chats found' : 'No chats yet'}
            </Typography>
            {!searchQuery && (
              <Button 
                variant="outlined" 
                size="small" 
                onClick={onNewChat} 
                startIcon={<AddIcon />}
                sx={{ mt: 2 }}
              >
                Start a new chat
              </Button>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
} 