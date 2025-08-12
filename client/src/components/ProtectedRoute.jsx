import { useEffect , useState, useCallback, cloneElement } from "react";
import { useNavigate } from "react-router-dom";
import { getLoggedUser } from "../Api/user";

function ProtectedRoute ({children}) {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const getLoggedInUser = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getLoggedUser();
            if (response && response.success) {
                setUser(response.data);
            } else {
                navigate('/login', { replace: true });
            }
        } catch (err) {
            console.log(err);
            navigate('/login', { replace: true });
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect( () => {
            getLoggedInUser();
    }, [getLoggedInUser]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }
  
    // Only render children if user is authenticated and loading is complete
    return user ? cloneElement(children, { user }) : null;

}

export default ProtectedRoute;