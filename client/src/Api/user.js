import { axiosInstance } from "./index.js";

const getLoggedUser = async() => {
    try{
        const response = await axiosInstance.get('/api/user/get-logged-user');
        return response.data;
    } catch(err){
        return err;
    }
}

export default getLoggedUser;