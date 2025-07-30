import { useEffect , useState} from "react";
import { useNavigate } from "react-router";
import getLoggedUser from "../Api/user";

function ProtectedRoute ({children}) {
    const navigate = useNavigate();

    const[user, setUser] = useState(null);

    const getLoggedInUser = async () =>{
        let response = null;
        try{
            response = await getLoggedUser();
            if (response.success){
                setUser(response.data);
            }
            else{
                navigate('/login');
            }
        } catch(err){
            console.log(err);
            navigate('/login');
        }
    }

    useEffect( () => {
            getLoggedInUser();
    });
  
    return (
        <div>
            <p>Name: { user?.firstname + ' ' + user?.lastname}</p>
            {children}
        </div>
    )

}

export default ProtectedRoute;