function Signup() {
    return (
        <div className="container">
        <div className="container-back-img"></div>
        <div className="container-back-color"></div>
        <div className="card">
            <div className="card_title">
                <h1>Create Account</h1>
            </div>
            <div className="form">
                <form >
                    <div className="column">
                        <input type="text" placeholder="First Name"
                        />
                        <input type="text" placeholder="Last Name"  
                        />
                    </div>
                    <input type="email" placeholder="Email" 
                    />
                    <input type="password" placeholder="Password" 
                    />
                    <button>Sign Up</button>
                </form>
            </div>
            <div className="card_terms">
                <span>Already have an account?
                    <a>Login Here</a>
                    </span>
                </div>
            </div>
        </div>
    )
}

export default Signup;