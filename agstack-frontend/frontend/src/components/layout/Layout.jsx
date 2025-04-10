import { useLocation, useNavigate } from 'react-router-dom';
import { 
  AppBar,
  Box, 
  Drawer, 
  Toolbar, 
  Typography, 
  Button,
  IconButton,
} from '@mui/material';
import {
  Chat as ChatIcon,
  Settings as SettingsIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';

const DRAWER_WIDTH = 280;

const menuItems = [
  { text: 'Chat', icon: <ChatIcon />, path: '/chat' },
  { text: 'Connections', icon: <SettingsIcon />, path: '/connections' },
];

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Top Navigation Bar */}
      <AppBar position="static" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 0, mr: 4 }}>
            AgStack
          </Typography>
          {menuItems.map((item) => (
            <Button
              key={item.text}
              color="inherit"
              startIcon={item.icon}
              onClick={() => navigate(item.path)}
              sx={{
                mr: 2,
                textTransform: 'none',
                backgroundColor: location.pathname === item.path ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                },
              }}
            >
              {item.text}
            </Button>
          ))}
        </Toolbar>
      </AppBar>

      {/* Main Content Area */}
      <Box sx={{ display: 'flex', flexGrow: 1, height: 'calc(100vh - 64px)' }}>
        {children}
      </Box>
    </Box>
  );
};

export default Layout; 