import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { loginUser } from '../../Api/auth';
import toast from 'react-hot-toast';
function Login() {

    const [user, userUpdate] = useState({
        email: '',
        password: ''
    });

    async function onFormSubmit(event)  {
        event.preventDefault();
        let response = null;
        try{
            response = await loginUser(user);
            if (response.success){
                toast.success(response.message);
                // localStorage.setItem('token', response.data.token);
                window.location.href = '/dashboard';
            }
            else{
                toast.error(response.message);
            }

        } catch(err) {
            console.log(err);
            toast.error(response.message);
        }
    }

    return (
        <div className="container">
            <div className="container-back-img"></div>
            <div className="container-back-color"></div>
            <div className="card">
            <div className="card_title">
                <h1>Login Here</h1>
            </div>
            <div className="form">
            <form onSubmit={onFormSubmit}>
                <input type="email" placeholder="Email" value={user.email}
                onChange={(e) => userUpdate({...user, email: e.target.value})}
                />
                <input type="password" placeholder="Password" value={user.password}
                onChange={(e) => userUpdate({...user, password: e.target.value})}
                />
                <button>Login</button>
            </form>
            </div>
            <div className="card_terms"> 
                <span>Don't have an account yet?
                    <Link to="/signup">Signup Here</Link>
                </span>
            </div>
            </div>
        </div>
    );
}

export default Login;