// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAUXKd0NPL2kUxIJJDVsnvBNX2YnlqDGK0",
  authDomain: "unidash-451f7.firebaseapp.com",
  projectId: "unidash-451f7",
  storageBucket: "unidash-451f7.firebasestorage.app",
  messagingSenderId: "712175452824",
  appId: "1:712175452824:web:16a4d4c669ff75bc81c6ed"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };