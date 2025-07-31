import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { loginUser } from '../../Api/auth';
import toast from 'react-hot-toast';
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../firebase";

function Login() {
    const [user, userUpdate] = useState({
        email: '',
        password: ''
    });

    async function onFormSubmit(event) {
        event.preventDefault();
        let response = null;
        try {
            response = await loginUser(user);
            if (response.success) {
                toast.success(response.message);
                window.location.href = '/dashboard';
            } else {
                toast.error(response.message);
            }
        } catch (err) {
            console.log(err);
            toast.error(response.message);
        }
    }


    const handleGoogleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const idToken = await result.user.getIdToken();
            
            await fetch("http://localhost:4000/api/firebase-login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ idToken }),
            });

            window.location.href = '/dashboard'
            console.log("Logged in successfully");
        } catch (err) {
            console.error("Login error", err);
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
                        <input
                            type="email"
                            placeholder="Email"
                            value={user.email}
                            onChange={(e) => userUpdate({ ...user, email: e.target.value })}
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={user.password}
                            onChange={(e) => userUpdate({ ...user, password: e.target.value })}
                        />
                        <button type="submit">Login</button>
                    </form>

                    <hr />

                    <button onClick={handleGoogleLogin} className="google-oauth-btn">
                        Continue with Google
                    </button>
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
