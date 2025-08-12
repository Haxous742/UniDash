import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { signupUser } from '../../Api/auth';
import toast from 'react-hot-toast';
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../firebase";
import {BookOpen,Mail,Lock,Eye,EyeOff,ArrowRight,Sparkles,Chrome,User} from 'lucide-react';

function Signup() {
    const navigate = useNavigate();
    const [user, userUpdate] = useState({
        firstname: '',
        lastname: '',
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    async function onFormSubmit(event) {
        event.preventDefault();
        setIsLoading(true);
        let response = null;

        try {
            response = await signupUser(user);
            if (response.success) {
                toast.success(response.message);
                navigate('/dashboard');
            } else {
                toast.error(response.message);
            }
        } catch (err) {
            console.log(err);
            toast.error(response?.message || 'Signup failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }

    const handleGoogleSignup = async () =>  {
        try {
            const result = await signInWithPopup(auth, provider);
            const idToken = await result.user.getIdToken();

            await fetch("/api/firebase-login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ idToken }),
            });

            navigate('/dashboard');
            console.log("Logged in successfully");
        } catch (err) {
            console.error("Login error", err);
            toast.error('Google signup failed. Please try again.');
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative w-full max-w-md z-10"
            >
                {/* Logo and Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-center mb-8"
                >
                    <div className="flex items-center justify-center space-x-2 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <BookOpen className="w-7 h-7 text-white" />
                        </div>
                        <span className="ml-2 text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                            UniDash
                        </span>
                    </div>
                    <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-4">
                        <Sparkles className="w-4 h-4 text-blue-400" />
                        <span className="text-blue-400 text-sm font-medium">Join the future of learning!</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Create your account</h1>
                    <p className="text-gray-400">Start your AI-powered learning journey today</p>
                </motion.div>

                {/* Signup Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl"
                >
                    <form onSubmit={onFormSubmit} className="space-y-5">
                        {/* Name Fields */}
                        <div className="grid grid-cols-2 gap-4 mb-5">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300 text-left">First name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        {/* <User className="h-5 w-5 text-gray-400" /> */}
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="John"
                                        value={user.firstname}
                                        onChange={(e) => userUpdate({ ...user, firstname: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300 text-left">Last name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        {/* <User className="h-5 w-5 text-gray-400" /> */}
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Doe"
                                        value={user.lastname}
                                        onChange={(e) => userUpdate({ ...user, lastname: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Email Field */}
                        <div className="space-y-2 mb-5">
                            <label className="block text-sm font-medium text-gray-300 text-left">Email address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    {/* <Mail className="h-5 w-5 text-gray-400" /> */}
                                </div>
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={user.email}
                                    onChange={(e) => userUpdate({ ...user, email: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2 mb-5">
                        <label className="block text-sm font-medium text-gray-300 text-left">Password</label>
                        
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                {/* <Lock className="h-5 w-5 text-gray-400" /> */}
                                </div>

                                <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Create a strong password"
                                value={user.password}
                                onChange={(e) => userUpdate({ ...user, password: e.target.value })}
                                className="w-full pl-10 pr-12 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                                required
                                />

                                <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 flex items-center justify-center w-12 rounded-r-lg bg-gray-700/50 hover:bg-gray-700/70 transition-colors duration-200 text-gray-400 hover:text-gray-300"
                                >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                ) : (
                                    <Eye className="h-5 w-5" />
                                )}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Creating account...</span>
                                </>
                            ) : (
                                <>
                                    <span>Create account</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-600/50"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-gray-800/50 text-gray-400">Or continue with</span>
                        </div>
                    </div>

                    {/* Google Signup */}
                    <button
                        onClick={handleGoogleSignup}
                        className="w-full bg-white/10 hover:bg-white/20 border border-gray-600/50 text-white py-2 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-3 group"
                    >
                        <Chrome className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                        <span className="ml-1">Continue with Google</span>
                    </button>
                </motion.div>

                {/* Login Link */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="text-center mt-4"
                >
                    <p className="text-gray-400">
                        Already have an account?{' '}
                        <Link 
                            to="/login" 
                            className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200"
                        >
                            Sign in here
                        </Link>
                    </p>
                </motion.div>
            </motion.div>
        </div>
    );
}

export default Signup;