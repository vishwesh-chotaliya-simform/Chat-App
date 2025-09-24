// Create: frontend/src/components/chat/MessageList.tsx
import React, { useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { Message } from '../../types';
import { useState } from 'react';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
}

interface MessageItemProps {
  message: Message;
  isOwn: boolean;
  showAvatar: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, isOwn, showAvatar }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const formatMessageTime = (createdAt: Date) => {
    return formatDistanceToNow(new Date(createdAt), { addSuffix: true });
  };

  if (message.type === 'system') {
    return (
      <Box display="flex" justifyContent="center" my={1}>
        <Chip
          label={message.content}
          size="small"
          variant="outlined"
          sx={{ bgcolor: 'background.paper' }}
        />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isOwn ? 'row-reverse' : 'row',
        alignItems: 'flex-start',
        mb: 1,
        px: 2,
        '&:hover .message-actions': {
          opacity: 1,
        },
      }}
    >
      {/* Avatar */}
      {showAvatar && !isOwn && (
        <Avatar
          sx={{ width: 32, height: 32, mr: 1, bgcolor: 'primary.main' }}
        >
          {message.sender.username[0]?.toUpperCase()}
        </Avatar>
      )}

      {/* Message Content */}
      <Box
        sx={{
          maxWidth: '70%',
          ml: !isOwn && !showAvatar ? 5 : 0,
        }}
      >
        {/* Sender Name and Time */}
        {showAvatar && (
          <Box
            display="flex"
            alignItems="center"
            gap={1}
            mb={0.5}
            sx={{
              flexDirection: isOwn ? 'row-reverse' : 'row',
            }}
          >
            <Typography variant="caption" fontWeight="bold" color="text.primary">
              {isOwn ? 'You' : message.sender.username}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatMessageTime(message.createdAt)}
            </Typography>
            {message.isEdited && (
              <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                (edited)
              </Typography>
            )}
          </Box>
        )}

        {/* Message Bubble */}
        <Box display="flex" alignItems="flex-start" gap={0.5}>
          <Paper
            elevation={1}
            sx={{
              p: 1.5,
              bgcolor: isOwn ? 'primary.main' : 'background.paper',
              color: isOwn ? 'primary.contrastText' : 'text.primary',
              borderRadius: 2,
              borderTopLeftRadius: isOwn || !showAvatar ? 2 : 0.5,
              borderTopRightRadius: !isOwn || !showAvatar ? 2 : 0.5,
              wordBreak: 'break-word',
            }}
          >
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {message.content}
            </Typography>

            {/* File/Image handling */}
            {message.type === 'image' && message.fileUrl && (
              <Box mt={1}>
                <img
                  src={message.fileUrl}
                  alt={message.fileName || 'Image'}
                  style={{
                    maxWidth: '100%',
                    maxHeight: 200,
                    borderRadius: 8,
                  }}
                />
              </Box>
            )}

            {message.type === 'file' && message.fileUrl && (
              <Box mt={1}>
                <Chip
                  label={message.fileName || 'File'}
                  onClick={() => window.open(message.fileUrl, '_blank')}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              </Box>
            )}
          </Paper>

          {/* Message Actions */}
          {isOwn && (
            <IconButton
              size="small"
              className="message-actions"
              onClick={handleMenuClick}
              sx={{
                opacity: 0,
                transition: 'opacity 0.2s',
                ml: 0.5,
              }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleMenuClose}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};

const MessageList: React.FC<MessageListProps> = ({ messages, currentUserId }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const shouldShowAvatar = (message: Message, index: number): boolean => {
    if (index === 0) return true;
    const prevMessage = messages[index - 1];
    return (
      prevMessage.senderId !== message.senderId ||
      new Date(message.createdAt).getTime() - new Date(prevMessage.createdAt).getTime() > 300000 // 5 minutes
    );
  };

  if (messages.length === 0) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        height="100%"
        sx={{ bgcolor: 'grey.50' }}
      >
        <Typography variant="body1" color="textSecondary">
          No messages yet. Start the conversation!
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 2, minHeight: '100%', bgcolor: 'grey.50' }}>
      {messages.map((message, index) => (
        <MessageItem
          key={message.id}
          message={message}
          isOwn={message.senderId === currentUserId}
          showAvatar={shouldShowAvatar(message, index)}
        />
      ))}
      <div ref={messagesEndRef} />
    </Box>
  );
};

export default MessageList;