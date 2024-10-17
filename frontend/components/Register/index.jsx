import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import styles from './styles.module.css';
import axios from 'axios';

const Register = () => {
    const [data, setData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
    });
    const [avatar, setAvatar] = useState(null);
    const [error, setError] = useState("");

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
        try {
            const formData = new FormData();
            for (const key in data) {
                formData.append(key, data[key]);
            }
            if (avatar) {
                formData.append('avatar', avatar);
            }

            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            };

            const url = `http://localhost:4000/api/v1/register`;

            const { data: res } = await axios.post(url, formData, config);

            if (res.success) {
                toast.success(res.message, { // Display the success message
                    position: "bottom-right",
                });
            }
            
            navigate("/login");
            console.log(res.message);
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
        }
    };

    return (
        <div className={styles.signup_container}>
            <div className={styles.signup_form_container}>
                <div className={styles.left}>
                    <h1>Welcome Back</h1>
                    <Link to='/login'>
                        <button type='button' className={styles.white_btn}>
                            Sign In
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
                        <button type="submit" className={styles.green_btn}>
                            Sign Up
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
