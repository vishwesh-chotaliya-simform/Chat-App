// Create: frontend/src/components/chat/RoomList.tsx
import React, { useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  IconButton,
  Fab,
  Badge,
  Divider,
  Chip,
  Button,
} from '@mui/material';
import {
  Add as AddIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  Public as PublicIcon,
  Logout as LogoutIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import { Room } from '../../types';
import CreateRoomDialog from './CreateRoomDialog';
import BrowseRoomsDialog from './BrowseRoomsDialog';
import UserProfile from './UserProfile';

interface RoomListProps {
  onMobileClose?: () => void;
}

const RoomList: React.FC<RoomListProps> = ({ onMobileClose }) => {
  const { user, logout } = useAuth();
  const { rooms, currentRoom, setCurrentRoom, onlineUsers } = useChat();
  const [createRoomOpen, setCreateRoomOpen] = useState(false);
  const [browseRoomsOpen, setBrowseRoomsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleRoomSelect = (room: Room) => {
    setCurrentRoom(room);
    onMobileClose?.();
  };

  const getRoomIcon = (room: Room) => {
    switch (room.type) {
      case 'direct':
        return <PersonIcon />;
      case 'public':
        return <PublicIcon />;
      default:
        return <GroupIcon />;
    }
  };

  const getOnlineMembersCount = (room: Room) => {
    if (!room.members) return 0;
    return room.members.filter((member) => 
      onlineUsers.has(member.userId)
    ).length;
  };

  if (!user) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" height="100%">
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* User Profile Section */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
          }}
          onClick={() => setProfileOpen(true)}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <Badge
              color="success"
              variant="dot"
              invisible={!user.isOnline}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                {user.username?.[0]?.toUpperCase() || 'U'}
              </Avatar>
            </Badge>
            <Box sx={{ ml: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {user.username}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {user.isOnline ? 'Online' : 'Offline'}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={(e) => { e.stopPropagation(); logout(); }}>
            <LogoutIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Rooms Header */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6">My Rooms ({rooms.length})</Typography>
        <Box>
          <IconButton
            color="primary"
            onClick={() => setBrowseRoomsOpen(true)}
            size="small"
            title="Browse available rooms"
          >
            <SearchIcon />
          </IconButton>
          <IconButton
            color="primary"
            onClick={() => setCreateRoomOpen(true)}
            size="small"
            title="Create new room"
          >
            <AddIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Browse Rooms Button */}
      {rooms.length === 0 && (
        <Box sx={{ px: 2, pb: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<SearchIcon />}
            onClick={() => setBrowseRoomsOpen(true)}
            sx={{ mb: 1 }}
          >
            Browse Available Rooms
          </Button>
          <Typography variant="caption" color="textSecondary" textAlign="center" display="block">
            Join existing rooms or create your own
          </Typography>
        </Box>
      )}

      {/* Rooms List */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <List sx={{ py: 0 }}>
          {rooms.map((room) => (
            <React.Fragment key={room.id}>
              <ListItem disablePadding>
                <ListItemButton
                  selected={currentRoom?.id === room.id}
                  onClick={() => handleRoomSelect(room)}
                  sx={{
                    py: 1.5,
                    '&.Mui-selected': {
                      bgcolor: 'primary.light',
                      '&:hover': {
                        bgcolor: 'primary.light',
                      },
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: room.isPrivate ? 'secondary.main' : 'primary.main' }}>
                      {room.avatar ? (
                        <img src={room.avatar} alt={room.name} width="100%" />
                      ) : (
                        getRoomIcon(room)
                      )}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1" fontWeight="medium">
                          {room.name}
                        </Typography>
                        {room.isPrivate && (
                          <Chip label="Private" size="small" color="secondary" />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          {room.description || `${room.members?.length || 0} members`}
                        </Typography>
                        {room.members && getOnlineMembersCount(room) > 0 && (
                          <Typography variant="caption" color="success.main" sx={{ display: 'block' }}>
                            {getOnlineMembersCount(room)} online
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItemButton>
              </ListItem>
              <Divider variant="inset" component="li" />
            </React.Fragment>
          ))}
          {rooms.length === 0 && (
            <ListItem>
              <ListItemText
                primary="No rooms joined yet"
                secondary="Browse available rooms or create your own to start chatting"
                sx={{ textAlign: 'center' }}
              />
            </ListItem>
          )}
        </List>
      </Box>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="browse rooms"
        onClick={() => setBrowseRoomsOpen(true)}
        sx={{
          position: 'absolute',
          bottom: 16,
          right: 16,
        }}
      >
        <SearchIcon />
      </Fab>

      {/* Dialogs */}
      <CreateRoomDialog
        open={createRoomOpen}
        onClose={() => setCreateRoomOpen(false)}
      />
      <BrowseRoomsDialog
        open={browseRoomsOpen}
        onClose={() => setBrowseRoomsOpen(false)}
      />
      <UserProfile
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
      />
    </Box>
  );
};

export default RoomList;