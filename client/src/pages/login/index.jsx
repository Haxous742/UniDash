

function Login() {
    return (
        <div className="container">
            <div className="container-back-img"></div>
            <div className="container-back-color"></div>
            <div className="card">
            <div className="card_title">
                <h1>Login Here</h1>
            </div>
            <div className="form">
            <form onSubmit>
                <input type="email" placeholder="Email" 
                />
                <input type="password" placeholder="Password" 
                />
                <button>Login</button>
            </form>
            </div>
            <div className="card_terms"> 
                <span>Don't have an account yet?
                    <a> Signup Here</a>
                </span>
            </div>
            </div>
        </div>
    )
}

export default Login;