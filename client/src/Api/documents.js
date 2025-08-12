import { axiosInstance } from "./index.js";

// Get all documents for the current user
export const getUserDocuments = async(userId) => {
    try {
        const response = await axiosInstance.get(`/api/documents/${userId}`);
        return response.data;
    } catch(err) {
        console.error('Error fetching documents:', err);
        return { success: false, error: err.response?.data || err.message };
    }
}

// Delete a document
export const deleteDocument = async(documentId, userId) => {
    try {
        const response = await axiosInstance.delete(`/api/documents/${documentId}`, {
            data: { userId }
        });
        return response.data;
    } catch(err) {
        console.error('Error deleting document:', err);
        return { success: false, error: err.response?.data || err.message };
    }
}
