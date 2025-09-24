// Create: frontend/src/components/chat/UserProfile.tsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Avatar,
  Box,
  Typography,
  Chip,
  Divider,
  Alert,
} from '@mui/material';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import { usersAPI } from '../../services/api';

interface UserProfileProps {
  open: boolean;
  onClose: () => void;
}

interface UpdateProfileData {
  username: string;
  email: string;
  avatar: string;
}

const schema = yup.object({
  username: yup.string().required('Username is required').min(3, 'Username must be at least 3 characters'),
  email: yup.string().email('Invalid email').required('Email is required'),
  avatar: yup.string().url('Must be a valid URL').optional().default(''),
});

const UserProfile: React.FC<UserProfileProps> = ({ open, onClose }) => {
  const { user } = useAuth();
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateProfileData>({
    resolver: yupResolver(schema),
    defaultValues: {
      username: user?.username || '',
      email: user?.email || '',
      avatar: user?.avatar || '',
    },
  });

  React.useEffect(() => {
    if (user) {
      reset({
        username: user.username,
        email: user.email,
        avatar: user.avatar || '',
      });
    }
  }, [user, reset]);

  const handleClose = () => {
    setEditing(false);
    setError('');
    setSuccess('');
    onClose();
  };

  const onSubmit: SubmitHandler<UpdateProfileData> = async (data) => {
    if (!user) return;

    try {
      setLoading(true);
      setError('');
      
      await usersAPI.update(user.id, {
        username: data.username,
        avatar: data.avatar || undefined,
      });
      
      setSuccess('Profile updated successfully!');
      setEditing(false);
      
      // Update localStorage user data
      const updatedUser = { ...user, username: data.username, avatar: data.avatar };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>User Profile</DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: 'primary.main',
              fontSize: '2rem',
              mb: 2,
            }}
            src={user.avatar}
          >
            {user.username[0]?.toUpperCase()}
          </Avatar>
          
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h6">{user.username}</Typography>
            <Chip
              label={user.isOnline ? 'Online' : 'Offline'}
              color={user.isOnline ? 'success' : 'default'}
              size="small"
            />
          </Box>
          
          <Typography variant="body2" color="textSecondary">
            Joined {new Date(user.createdAt).toLocaleDateString()}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {editing ? (
          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
              margin="normal"
              label="Username"
              fullWidth
              required
              {...register('username')}
              error={!!errors.username}
              helperText={errors.username?.message}
            />

            <TextField
              margin="normal"
              label="Email"
              fullWidth
              required
              disabled
              {...register('email')}
              helperText="Email cannot be changed"
            />

            <TextField
              margin="normal"
              label="Avatar URL"
              fullWidth
              {...register('avatar')}
              error={!!errors.avatar}
              helperText={errors.avatar?.message || 'Optional: URL to your avatar image'}
            />

            <Box mt={2} display="flex" gap={1} justifyContent="flex-end">
              <Button onClick={() => setEditing(false)} disabled={loading}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          </form>
        ) : (
          <Box>
            <Box mb={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Username
              </Typography>
              <Typography variant="body1">{user.username}</Typography>
            </Box>

            <Box mb={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Email
              </Typography>
              <Typography variant="body1">{user.email}</Typography>
            </Box>

            <Box mb={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Status
              </Typography>
              <Typography variant="body1">
                {user.isOnline ? 'Online' : `Last seen ${user.lastSeen ? new Date(user.lastSeen).toLocaleString() : 'Unknown'}`}
              </Typography>
            </Box>
          </Box>
        )}
      </DialogContent>

      {!editing && (
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
          <Button onClick={() => setEditing(true)} variant="contained">
            Edit Profile
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default UserProfile;