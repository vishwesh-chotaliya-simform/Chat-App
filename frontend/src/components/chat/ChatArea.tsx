// Create: frontend/src/components/chat/ChatArea.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  AppBar,
  Toolbar,
  TextField,
  Button,
  Paper,
  Avatar,
  Chip,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Send as SendIcon,
  Info as InfoIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import MessageList from './MessageList';
import { socketService } from '../../services/socket';

interface ChatAreaProps {
  onMobileMenuClick: () => void;
  isMobile: boolean;
}

const ChatArea: React.FC<ChatAreaProps> = ({ onMobileMenuClick, isMobile }) => {
  const { currentRoom, messages, typingUsers, sendMessage } = useChat();
  const { user } = useAuth();
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !currentRoom) return;

    try {
      await sendMessage(messageInput.trim(), currentRoom.id);
      setMessageInput('');
      handleStopTyping();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTyping = (value: string) => {
    setMessageInput(value);

    if (!currentRoom) return;

    if (value.trim() && !isTyping) {
      setIsTyping(true);
      socketService.sendTyping(currentRoom.id, true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 2000);
  };

  const handleStopTyping = () => {
    if (isTyping && currentRoom) {
      setIsTyping(false);
      socketService.sendTyping(currentRoom.id, false);
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const getCurrentTypingUsers = () => {
    if (!currentRoom) return [];
    const roomTyping = typingUsers[currentRoom.id] || [];
    return roomTyping.filter(userId => userId !== user?.id);
  };

  const renderTypingIndicator = () => {
    const typingUserIds = getCurrentTypingUsers();
    if (typingUserIds.length === 0) return null;

    const typingText = typingUserIds.length === 1
      ? 'Someone is typing...'
      : `${typingUserIds.length} people are typing...`;

    return (
      <Box sx={{ p: 1, pl: 2, bgcolor: 'grey.50' }}>
        <Typography variant="caption" color="textSecondary" sx={{ fontStyle: 'italic' }}>
          {typingText}
        </Typography>
      </Box>
    );
  };

  if (!currentRoom) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height="100%"
        sx={{ bgcolor: 'grey.50' }}
      >
        <Typography variant="h5" color="textSecondary" gutterBottom>
          Welcome to Chat App
        </Typography>
        <Typography variant="body1" color="textSecondary" textAlign="center">
          Select a room from the sidebar to start chatting
        </Typography>
      </Box>
    );
  }

  const roomMessages = messages[currentRoom.id] || [];

  return (
    <Box display="flex" flexDirection="column" height="100%">
      {/* Chat Header */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          {isMobile && (
            <IconButton
              edge="start"
              onClick={onMobileMenuClick}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
            {currentRoom.avatar ? (
              <img src={currentRoom.avatar} alt={currentRoom.name} width="100%" />
            ) : (
              currentRoom.name[0]?.toUpperCase() || 'R'
            )}
          </Avatar>

          <Box flex={1}>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="h6" component="h1">
                {currentRoom.name}
              </Typography>
              {currentRoom.isPrivate && (
                <Chip label="Private" size="small" color="secondary" />
              )}
            </Box>
            <Typography variant="caption" color="textSecondary">
              {currentRoom.members?.length || 0} members
              {currentRoom.description && ` • ${currentRoom.description}`}
            </Typography>
          </Box>

          <IconButton>
            <InfoIcon />
          </IconButton>
          <IconButton>
            <MoreVertIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Messages Area */}
      <Box flex={1} display="flex" flexDirection="column" overflow="hidden">
        <Box flex={1} overflow="auto">
          <MessageList messages={roomMessages} currentUserId={user?.id || ''} />
        </Box>

        {/* Typing Indicator */}
        {renderTypingIndicator()}

        <Divider />

        {/* Message Input */}
        <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.paper' }}>
          <Box display="flex" gap={1} alignItems="flex-end">
            <TextField
              fullWidth
              multiline
              maxRows={4}
              placeholder={`Message #${currentRoom.name}`}
              value={messageInput}
              onChange={(e) => handleTyping(e.target.value)}
              onKeyPress={handleKeyPress}
              variant="outlined"
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
            <Button
              variant="contained"
              onClick={handleSendMessage}
              disabled={!messageInput.trim()}
              sx={{
                minWidth: 'auto',
                p: 1.5,
                borderRadius: 2,
              }}
            >
              <SendIcon />
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default ChatArea;