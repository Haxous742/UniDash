import { axiosInstance } from "./index.js";

// Get logged-in user details
const getLoggedUser = async() => {
    try{
        const response = await axiosInstance.get('/api/user/get-logged-user');
        return response.data;
    } catch(err){
        return { success: false, error: err.response?.data || err.message };
    }
}


// Update user profile
const updateProfile = async(profileData) => {
    try{
        const response = await axiosInstance.put('/api/user/update-profile', profileData);
        return response.data;
    } catch(err){
        return { success: false, error: err.response?.data || err.message };
    }
}

export { getLoggedUser, updateProfile };
