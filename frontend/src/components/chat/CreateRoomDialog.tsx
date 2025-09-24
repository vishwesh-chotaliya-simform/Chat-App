// Create: frontend/src/components/chat/CreateRoomDialog.tsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Alert,
  Box,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useChat } from '../../contexts/ChatContext';

interface CreateRoomDialogProps {
  open: boolean;
  onClose: () => void;
}

interface CreateRoomFormData {
  name: string;
  description?: string;
  type: 'group' | 'public';
  isPrivate: boolean;
}

const schema = yup.object().shape({
  name: yup.string().required('Room name is required').min(3, 'Room name must be at least 3 characters'),
  description: yup.string().optional(),
  type: yup.string().oneOf(['group', 'public']).required('Room type is required'),
  isPrivate: yup.boolean().required(),
});

const CreateRoomDialog: React.FC<CreateRoomDialogProps> = ({ open, onClose }) => {
  const { createRoom } = useChat();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    control,
  } = useForm<CreateRoomFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      type: 'group',
      isPrivate: false,
    },
  });

  const roomType = watch('type');
  const isPrivate = watch('isPrivate');

  const handleClose = () => {
    reset();
    setError('');
    onClose();
  };

  const onSubmit = async (data: CreateRoomFormData) => {
    try {
      setLoading(true);
      setError('');
      
      await createRoom({
        name: data.name,
        description: data.description || undefined,
        isPrivate: data.isPrivate,
      });
      
      handleClose();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Room</DialogTitle>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            autoFocus
            margin="normal"
            label="Room Name"
            fullWidth
            required
            {...register('name')}
            error={!!errors.name}
            helperText={errors.name?.message}
          />

          <TextField
            margin="normal"
            label="Description (Optional)"
            fullWidth
            multiline
            rows={3}
            {...register('description')}
            error={!!errors.description}
            helperText={errors.description?.message || 'Briefly describe what this room is for'}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Room Type</InputLabel>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  label="Room Type"
                >
                  <MenuItem value="group">Group Room</MenuItem>
                  <MenuItem value="public">Public Room</MenuItem>
                </Select>
              )}
            />
          </FormControl>

          <Box mt={2}>
            <Controller
              name="isPrivate"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Switch
                      checked={field.value}
                      onChange={field.onChange}
                    />
                  }
                  label="Private Room"
                />
              )}
            />
            {isPrivate && (
              <Alert severity="info" sx={{ mt: 1 }}>
                Only invited members can join private rooms
              </Alert>
            )}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Room'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateRoomDialog;