import { axiosInstance } from "./index.js";

// Get all chats for a user
export const getUserChats = async (userId, page = 1, limit = 20) => {
    try {
        const response = await axiosInstance.get(`/api/chats/${userId}`, {
            params: { page, limit }
        });
        return response.data;
    } catch (err) {
        console.error('Error fetching chats:', err);
        return { success: false, error: err.response?.data || err.message };
    }
}

// Get a specific chat by ID
export const getChatById = async (userId, chatId) => {
    try {
        const response = await axiosInstance.get(`/api/chats/${userId}/${chatId}`);
        return response.data;
    } catch (err) {
        console.error('Error fetching chat:', err);
        return { success: false, error: err.response?.data || err.message };
    }
}

// Create a new chat
export const createChat = async (userId, name, description = '') => {
    try {
        const response = await axiosInstance.post('/api/chats', {
            userId,
            name,
            description
        });
        return response.data;
    } catch (err) {
        console.error('Error creating chat:', err);
        return { success: false, error: err.response?.data || err.message };
    }
}

// Update a chat
export const updateChat = async (chatId, userId, name, description) => {
    try {
        const response = await axiosInstance.put(`/api/chats/${chatId}`, {
            userId,
            name,
            description
        });
        return response.data;
    } catch (err) {
        console.error('Error updating chat:', err);
        return { success: false, error: err.response?.data || err.message };
    }
}

// Delete a chat
export const deleteChat = async (chatId, userId) => {
    try {
        const response = await axiosInstance.delete(`/api/chats/${chatId}`, {
            data: { userId }
        });
        return response.data;
    } catch (err) {
        console.error('Error deleting chat:', err);
        return { success: false, error: err.response?.data || err.message };
    }
}

// Get chat statistics for a user
export const getChatStats = async (userId) => {
    try {
        console.log('🔗 Making API call to:', `/api/chats/${userId}/stats`);
        const response = await axiosInstance.get(`/api/chats/${userId}/stats`);
        console.log('📡 API Response:', response);
        console.log('📊 Response Data:', response.data);
        return response.data;
    } catch (err) {
        console.error('❌ Error fetching chat stats:', err);
        console.error('📄 Error response:', err.response);
        console.error('🔍 Error details:', {
            status: err.response?.status,
            statusText: err.response?.statusText,
            data: err.response?.data,
            message: err.message
        });
        return { success: false, error: err.response?.data || err.message };
    }
}
