import { useState } from 'react';
import { Link } from 'react-router-dom';
import signupUser from '../../Api/auth';
import { toast } from 'react-hot-toast';
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../firebase";

function Signup() {
    const [user, userUpdate] = useState({
        firstname: '',
        lastname: '',
        email: '',
        password: ''
    });

    async function onFormSubmit(event) {
        event.preventDefault();
        let response = null;

        try {
            response = await signupUser(user);
            if (response.success) {
                toast.success(response.message);
            } else {
                toast.error(response.message);
            }
        } catch (err) {
            console.log(err);
            toast.error(response.message);
        }
    }

    const handleGoogleSignup = async () =>  {
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
                    <h1>Create Account</h1>
                </div>
                <div className="form">
                    <form onSubmit={onFormSubmit}>
                        <div className="column">
                            <input
                                type="text"
                                placeholder="First Name"
                                value={user.firstname}
                                onChange={(e) => userUpdate({ ...user, firstname: e.target.value })}
                            />
                            <input
                                type="text"
                                placeholder="Last Name"
                                value={user.lastname}
                                onChange={(e) => userUpdate({ ...user, lastname: e.target.value })}
                            />
                        </div>
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
                        <button type="submit">Sign Up</button>
                    </form>
                    <hr />
                    <button onClick={handleGoogleSignup} className="google-oauth-btn">
                        Continue with Google
                    </button>
                </div>
                <div className="card_terms">
                    <span>
                        Already have an account?
                        <Link to="/login">Login Here</Link>
                    </span>
                </div>
            </div>
        </div>
    );
}

export default Signup;
