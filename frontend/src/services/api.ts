// Create: frontend/src/services/api.ts
import axios, { AxiosResponse } from 'axios';
import { User, Room, Message, AuthResponse, LoginData, RegisterData, RoomMember } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data: LoginData): Promise<AxiosResponse<AuthResponse>> =>
    api.post('/auth/login', data),
  
  register: (data: RegisterData): Promise<AxiosResponse<AuthResponse>> =>
    api.post('/auth/register', data),
};

export const usersAPI = {
  getAll: (): Promise<AxiosResponse<User[]>> =>
    api.get('/users'),
  
  getProfile: (): Promise<AxiosResponse<User>> =>
    api.get('/users/me'),
  
  getById: (id: string): Promise<AxiosResponse<User>> =>
    api.get(`/users/${id}`),
  
  update: (id: string, data: Partial<User>): Promise<AxiosResponse<User>> =>
    api.patch(`/users/${id}`, data),
};

export const roomsAPI = {
  getAll: (): Promise<AxiosResponse<Room[]>> =>
    api.get('/rooms'),
  
  getMyRooms: (): Promise<AxiosResponse<Room[]>> =>
    api.get('/rooms/my-rooms'),
  
  getById: (id: string): Promise<AxiosResponse<Room>> =>
    api.get(`/rooms/${id}`),
  
  create: (data: { name: string; description?: string; type?: string; isPrivate?: boolean }): Promise<AxiosResponse<Room>> =>
    api.post('/rooms', data),
  
  join: (id: string): Promise<AxiosResponse<RoomMember>> =>
    api.post(`/rooms/${id}/join`),
  
  leave: (id: string): Promise<AxiosResponse<void>> =>
    api.delete(`/rooms/${id}/leave`),
  
  getMembers: (id: string): Promise<AxiosResponse<RoomMember[]>> =>
    api.get(`/rooms/${id}/members`),
  
  update: (id: string, data: Partial<Room>): Promise<AxiosResponse<Room>> =>
    api.patch(`/rooms/${id}`, data),
  
  delete: (id: string): Promise<AxiosResponse<void>> =>
    api.delete(`/rooms/${id}`),
};

export const chatAPI = {
  getRoomMessages: (roomId: string): Promise<AxiosResponse<Message[]>> =>
    api.get(`/chat/rooms/${roomId}/messages`),
  
  sendMessage: (data: { content: string; roomId: string; type?: string }): Promise<AxiosResponse<Message>> =>
    api.post('/chat/messages', data),
  
  updateMessage: (id: string, content: string): Promise<AxiosResponse<Message>> =>
    api.patch(`/chat/messages/${id}`, { content }),
  
  deleteMessage: (id: string): Promise<AxiosResponse<void>> =>
    api.delete(`/chat/messages/${id}`),
};

export default api;