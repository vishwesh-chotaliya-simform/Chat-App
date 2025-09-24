// Create: frontend/src/pages/chat/ChatPage.tsx
import React, { useEffect } from 'react';
import { Box, Drawer, useMediaQuery, useTheme } from '@mui/material';
import { useChat } from '../../contexts/ChatContext';
import { socketService } from '../../services/socket';
import RoomList from '../../components/chat/RoomList';
import ChatArea from '../../components/chat/ChatArea';
import { useState } from 'react';

const DRAWER_WIDTH = 300;

const ChatPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const { currentRoom, loadRoomMessages, rooms } = useChat();

  // Auto-join all user's rooms on page load
  useEffect(() => {
    if (rooms.length > 0) {
      console.log(`🏠 Auto-joining ${rooms.length} rooms...`);
      rooms.forEach(room => {
        console.log(`🚪 Auto-joining room: ${room.name} (${room.id})`);
        socketService.joinRoom(room.id);
      });
    }
  }, [rooms]);

  // Join current room and load messages
  useEffect(() => {
    if (currentRoom) {
      console.log(`🎯 Switching to room: ${currentRoom.name} (${currentRoom.id})`);
      socketService.joinRoom(currentRoom.id);
      loadRoomMessages(currentRoom.id);
    }
  }, [currentRoom, loadRoomMessages]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <RoomList onMobileClose={() => setMobileOpen(false)} />
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: DRAWER_WIDTH,
              },
            }}
          >
            {drawer}
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            sx={{
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: DRAWER_WIDTH,
              },
            }}
            open
          >
            {drawer}
          </Drawer>
        )}
      </Box>

      {/* Main chat area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          height: '100vh',
        }}
      >
        <ChatArea
          onMobileMenuClick={handleDrawerToggle}
          isMobile={isMobile}
        />
      </Box>
    </Box>
  );
};

export default ChatPage;