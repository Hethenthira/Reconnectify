import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

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
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getCurrentUser: () => api.get('/auth/me'),
};

export const userAPI = {
  getCurrentUser: () => api.get('/users/me'),
  updateProfile: (data) => api.put('/users/me', data),
  getUserById: (id) => api.get(`/users/${id}`),
  getDirectory: (params) => api.get('/users', { params }),
  searchUsers: (query) => api.get('/users', { params: { name: query } }),
  getUserStats: () => api.get('/users/stats/me'),
};

export const eventAPI = {
  createEvent: (data) => api.post('/events', data),
  getEvents: (params) => api.get('/events', { params }),
  getEventById: (id) => api.get(`/events/${id}`),
  attendEvent: (id) => api.post(`/events/${id}/attend`, {}),
  unattendEvent: (id) => api.delete(`/events/${id}/attend`),
  updateEvent: (id, data) => api.put(`/events/${id}`, data),
  deleteEvent: (id) => api.delete(`/events/${id}`),
};

export const jobAPI = {
  postJob: (data) => api.post('/opportunities', data),
  getJobs: (params) => api.get('/opportunities', { params }),
  getJobById: (id) => api.get(`/opportunities/${id}`),
  applyJob: (id) => api.post(`/opportunities/${id}/apply`, {}),
  getMyApplications: () => api.get('/opportunities/my/applications'),
  updateJob: (id, data) => api.put(`/opportunities/${id}`, data),
  deleteJob: (id) => api.delete(`/opportunities/${id}`),
  updateApplicantStatus: (jobId, applicantId, status) =>
    api.put(`/opportunities/${jobId}/applicants/${applicantId}`, { status }),
};

export const connectionAPI = {
  // Student → Alumni: send request (status = 'pending')
  sendRequest: (userId) => api.post(`/connections/request/${userId}`, {}),

  // Get all ACCEPTED connections → used in Messages sidebar
  getConnections: () => api.get('/connections'),

  // Alumni: incoming pending requests to Accept/Reject
  getPendingRequests: () => api.get('/connections/pending'),

  // Student: outgoing requests they sent
  getSentRequests: () => api.get('/connections/sent'),

  // Alumni: respond with status 'accepted' or 'rejected'
  respondToRequest: (connectionId, status) =>
    api.put(`/connections/${connectionId}`, { status }),

  removeConnection: (id) => api.delete(`/connections/${id}`),
  getSuggestions: () => api.get('/connections/suggestions'),
};

export const messageAPI = {
  sendMessage: (recipientId, content) =>
    api.post('/messages', { recipientId, content }),
  getConversation: (userId) => api.get(`/messages/${userId}`),
  getAllConversations: () => api.get('/messages'),
  getUnreadCount: () => api.get('/messages/unread/count'),
  markAsRead: (messageId) => api.put(`/messages/${messageId}/read`, {}),
  deleteMessage: (messageId) => api.delete(`/messages/${messageId}`),
};

export const postAPI = {
  createPost: (data) => api.post('/posts', data),
  getFeed: (params) => api.get('/posts', { params }),
  getPostById: (id) => api.get(`/posts/${id}`),
  likePost: (id) => api.post(`/posts/${id}/like`, {}),
  commentPost: (id, text) => api.post(`/posts/${id}/comments`, { text }),
  deleteComment: (postId, commentId) =>
    api.delete(`/posts/${postId}/comments/${commentId}`),
  updatePost: (id, data) => api.put(`/posts/${id}`, data),
  deletePost: (id) => api.delete(`/posts/${id}`),
};

export const notificationAPI = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`, {}),
  markAllAsRead: () => api.put('/notifications/read-all', {}),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getAllUsers: (params) => api.get('/admin/users', { params }),
  approveUser: (id) => api.put(`/admin/users/${id}/approve`, {}),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  deleteContent: (type, id) => api.delete(`/admin/content/${type}/${id}`),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  getAnalytics: () => api.get('/admin/analytics'),
  getReports: () => api.get('/admin/reports'),
};

export default api;