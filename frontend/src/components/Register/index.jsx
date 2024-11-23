import { useState } from 'react';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from '../../config/firebase-config';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import styles from './styles.module.css';
import axios from 'axios';
import { errMsg } from '../../utils/helper';
import SignWithGoogle from '../login/SignWithGoogle';

const Register = () => {
    const [data, setData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
    });
    const [avatar, setAvatar] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate();

    const handleChange = ({ currentTarget: input }) => {
        console.log(data, avatar)
        if (input.name === 'avatar') {
            setAvatar(input.files[0]);
        } else {
            setData({ ...data, [input.name]: input.value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true)
        try {
            await createUserWithEmailAndPassword(auth, data.email, data.password);
            const user = auth.currentUser;
            console.log(user)

            const formData = new FormData();
            formData.append('uid', user.uid)
            for (const key in data) {
                formData.append(key, data[key]);
            }
            if (avatar) {
                formData.append('avatar', avatar);
            }

            if (user) {
                const config = {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                };
                await axios.post(`${import.meta.env.VITE_API}/register`, formData, config)

                toast.success("User Registered Successfully!", { 
                    position: "bottom-right",
                });

                navigate("/login");
            }

        } catch (error) {
            if (error.response && error.response.status >= 400 && error.response.status <= 500) {
                const { errors, message } = error.response.data;
            
                if (errors) {
                    errors.forEach(err => {
                        toast.error(err, {
                            position: "bottom-right"
                        });
                    });
                }
            
                setError(message);
            }    
            if (error.message) {
                errMsg("Error" + error.message)
            }        
        } finally {
            setLoading(false)
        }
    };

    return (
        <div className={styles.signup_container}>
            <div className={styles.signup_form_container}>
                <div className={styles.left}>
                    <h1>Welcome Back</h1>
                    <Link to='/login'>
                        <button type='button' className={styles.white_btn}>
                            Log In
                        </button>
                    </Link>
                </div>
                <div className={styles.right}>
                    <form className={styles.form_container} onSubmit={handleSubmit}>
                        <h1>Create Account</h1>
                        <input 
                            type="text"
                            placeholder='First Name'
                            name='firstName'
                            onChange={handleChange}
                            value={data.firstName}
                            className={styles.input}
                        />
                        <input 
                            type="text"
                            placeholder='Last Name'
                            name='lastName'
                            onChange={handleChange}
                            value={data.lastName}
                            className={styles.input}
                        />
                        <input 
                            type="email"
                            placeholder='Email'
                            name='email'
                            onChange={handleChange}
                            value={data.email}
                            className={styles.input}
                        />
                        <input 
                            type="password"
                            placeholder='Password'
                            name='password'
                            onChange={handleChange}
                            value={data.password}
                            className={styles.input}
                        />
                        <input
                            type="file"
                            name="avatar"
                            accept="image/jpeg, image/jpg, image/png" 
                            className={styles.input}
                            onChange={handleChange}
                        />
                        {error && <div className={styles.error_msg}>{error}</div>}
                        <button type="submit" className={styles.green_btn} disabled={loading}>
                            {loading ? 'Loading...' : 'Sign Up'}
                        </button>
                    </form>
                    <SignWithGoogle method="Sign Up"/>
                </div>
            </div>
        </div>
    );
};

export default Register;
