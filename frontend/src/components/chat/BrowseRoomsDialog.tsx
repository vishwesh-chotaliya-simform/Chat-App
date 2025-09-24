// Create: frontend/src/components/chat/BrowseRoomsDialog.tsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Box,
  Chip,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Group as GroupIcon,
  Public as PublicIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { roomsAPI } from '../../services/api';
import { useChat } from '../../contexts/ChatContext';
import { Room } from '../../types';

interface BrowseRoomsDialogProps {
  open: boolean;
  onClose: () => void;
}

const BrowseRoomsDialog: React.FC<BrowseRoomsDialogProps> = ({ open, onClose }) => {
  const { joinRoom, rooms: myRooms, refreshRooms } = useChat();
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [joining, setJoining] = useState<string | null>(null);
  const [error, setError] = useState<string>('');

  const loadAvailableRooms = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await roomsAPI.getAll(); // Gets all public rooms
      
      // Filter out rooms the user is already a member of
      const myRoomIds = new Set(myRooms.map(room => room.id));
      const roomsToJoin = response.data.filter(room => !myRoomIds.has(room.id));
      
      setAvailableRooms(roomsToJoin);
    } catch (error: any) {
      setError('Failed to load rooms');
      console.error('Error loading rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadAvailableRooms();
    }
  }, [open, myRooms]);

  const handleJoinRoom = async (room: Room) => {
    try {
      setJoining(room.id);
      setError('');
      
      await joinRoom(room.id);
      
      // Remove from available rooms list
      setAvailableRooms(prev => prev.filter(r => r.id !== room.id));
      
      // Refresh the main rooms list
      await refreshRooms();
      
    } catch (error: any) {
      setError(error.response?.data?.message || `Failed to join ${room.name}`);
    } finally {
      setJoining(null);
    }
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

  const handleClose = () => {
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Browse Available Rooms</Typography>
          <Chip 
            label={`${availableRooms.length} rooms available`} 
            color="primary" 
            size="small" 
          />
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ minHeight: 400 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height={200}>
            <CircularProgress />
          </Box>
        ) : availableRooms.length === 0 ? (
          <Box display="flex" flexDirection="column" alignItems="center" py={4}>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No new rooms to join
            </Typography>
            <Typography variant="body2" color="textSecondary" textAlign="center">
              You're already a member of all available public rooms, or there are no public rooms yet.
            </Typography>
          </Box>
        ) : (
          <List>
            {availableRooms.map((room, index) => (
              <React.Fragment key={room.id}>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => handleJoinRoom(room)}
                    disabled={joining === room.id}
                    sx={{ py: 2 }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {room.avatar ? (
                          <img src={room.avatar} alt={room.name} width="100%" />
                        ) : (
                          getRoomIcon(room)
                        )}
                      </Avatar>
                    </ListItemAvatar>
                    
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="subtitle1" fontWeight="medium">
                            {room.name}
                          </Typography>
                          <Chip label="Public" size="small" color="success" />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            {room.description || 'No description'}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Created by {room.creator?.username} • {room.members?.length || 0} members
                          </Typography>
                        </Box>
                      }
                    />
                    
                    <Box ml={2}>
                      {joining === room.id ? (
                        <CircularProgress size={24} />
                      ) : (
                        <Button variant="contained" size="small">
                          Join
                        </Button>
                      )}
                    </Box>
                  </ListItemButton>
                </ListItem>
                {index < availableRooms.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
        <Button onClick={loadAvailableRooms} disabled={loading}>
          Refresh
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BrowseRoomsDialog;