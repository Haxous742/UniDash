import { axiosInstance } from "./index";  

export const signupUser = async (user) => {
    try{
        const response = await axiosInstance.post('/api/auth/signup', user);
        return response.data;
    } catch (err){
        return { success: false, message: err.response?.data?.message || err.message || 'Signup failed' };
    }
}

export const loginUser = async (user) => {
    try{
        const response = await axiosInstance.post('/api/auth/login', user);
        return response.data;
    } catch (err){
        return { success: false, message: err.response?.data?.message || err.message || 'Login failed' };
    }
}

export default signupUser;
