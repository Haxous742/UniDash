import { axiosInstance } from "./index.js";

// Get messages for a specific chat
export const getChatMessages = async (chatId, page = 1, limit = 50) => {
    try {
        const response = await axiosInstance.get(`/api/messages/${chatId}`, {
            params: { page, limit }
        });
        return response.data;
    } catch (err) {
        console.error('Error fetching messages:', err);
        return { success: false, error: err.response?.data || err.message };
    }
}



// Create a new message
export const createMessage = async (chatId, userId, content, role, messageType = 'text', metadata = {}) => {
    try {
        const response = await axiosInstance.post('/api/messages', {
            chatId,
            userId,
            content,
            role,
            messageType,
            metadata
        });
        return response.data;
    } catch (err) {
        console.error('Error creating message:', err);
        return { success: false, error: err.response?.data || err.message };
    }
}



// Update a message
export const updateMessage = async (messageId, userId, content, isRead, metadata) => {
    try {
        const response = await axiosInstance.put(`/api/messages/${messageId}`, {
            userId,
            content,
            isRead,
            metadata
        });
        return response.data;
    } catch (err) {
        console.error('Error updating message:', err);
        return { success: false, error: err.response?.data || err.message };
    }
}



// Delete a message
export const deleteMessage = async (messageId, userId) => {
    try {
        const response = await axiosInstance.delete(`/api/messages/${messageId}`, {
            data: { userId }
        });
        return response.data;
    } catch (err) {
        console.error('Error deleting message:', err);
        return { success: false, error: err.response?.data || err.message };
    }
}



// Mark messages as read
export const markMessagesAsRead = async (chatId, userId) => {
    try {
        const response = await axiosInstance.put(`/api/messages/${chatId}/read`, {
            userId
        });
        return response.data;
    } catch (err) {
        console.error('Error marking messages as read:', err);
        return { success: false, error: err.response?.data || err.message };
    }
}



// Search messages
export const searchMessages = async (userId, query, chatId = null, page = 1, limit = 20) => {
    try {
        const params = { q: query, page, limit };
        if (chatId) params.chatId = chatId;
        
        const response = await axiosInstance.get(`/api/messages/search/${userId}`, {
            params
        });
        return response.data;
    } catch (err) {
        console.error('Error searching messages:', err);
        return { success: false, error: err.response?.data || err.message };
    }
}
