
import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBkLhKshuOjD7IQpUl3wV1g3uT_xlPgzGk",
  authDomain: "bmw-project-5ab42.firebaseapp.com",
  projectId: "bmw-project-5ab42",
  storageBucket: "bmw-project-5ab42.firebasestorage.app",
  messagingSenderId: "14654770851",
  appId: "1:14654770851:web:5a983e25953711a30f3916"
};

const app = initializeApp(firebaseConfig);
export const auth=getAuth();
export default app;