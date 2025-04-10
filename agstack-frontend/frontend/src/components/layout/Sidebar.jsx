import { Drawer, List, ListItem, ListItemIcon, ListItemText, IconButton } from '@mui/material';
import { ChevronLeft, ChevronRight, AddCircleOutline, Message, Storage } from '@mui/icons-material';
import { CircularProgress } from '@mui/material';

const Sidebar = ({
  title,
  items = [],
  onItemClick,
  onAddClick,
  activeItemId = null,
  addButtonText = 'Add New',
  renderItem,
  icon,
  collapsed = false,
  onToggleCollapse,
  loading = false,
}) => {
  const renderIcon = () => {
    if (loading) return <CircularProgress size={24} />;
    if (icon) return icon;
    if (title.toLowerCase().includes('chat')) return <Message />;
    if (title.toLowerCase().includes('connection')) return <Storage />;
    return null;
  };

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={!collapsed}
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
        },
      }}
    >
      <div>
        <IconButton onClick={onToggleCollapse}>
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </IconButton>
      </div>
      <List>
        {onAddClick && (
          <ListItem button onClick={onAddClick}>
            <ListItemIcon><AddCircleOutline /></ListItemIcon>
            <ListItemText primary={addButtonText} />
          </ListItem>
        )}
        {items.map((item) => (
          <ListItem 
            button 
            key={item.id} 
            selected={activeItemId === item.id}
            onClick={() => onItemClick && onItemClick(item)}
          >
            <ListItemIcon>{renderIcon()}</ListItemIcon>
            <ListItemText primary={renderItem ? renderItem(item) : item.title || item.name} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar; 