import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../config/firebase-config";
import { useState } from 'react';
import { Link } from 'react-router-dom'
import styles from './styles.module.css';
import axios from 'axios';
import {authenticate, errMsg, succesMsg} from '../../utils/helper'

const Login = () => {
    const [data, setData] = useState({
        email: "",
        password: "",
    })
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const handleChange = ({currentTarget: input}) => {
        setData({...data, [input.name]: input.value});
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true)
        console.log(data)
        try {
            const result = await signInWithEmailAndPassword(auth, data.email, data.password);
            console.log(result.user)
            const idToken = await result.user.getIdToken()

            const config = {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            
            const url =`http://localhost:4000/api/v1/login`;
            const {data : response} = await axios.post(url, {uid: result.user.uid}, config);
            console.log(response);
            if (response.success) {
                const userInfo = {
                    token: idToken,
                    user: response.user
                }
                succesMsg("Login Successfully!")
                authenticate(userInfo, () => window.location = "/")
            } else {
                errMsg("Login Failed")
            }

        } catch(error) {
            if (error.response && error.response.status >= 400 && error.response.status <=500){
                console.log(error.response.data)
                if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
                    error.response.data.errors.forEach(error => {
                        toast.error(error, {
                            position: "bottom-right"
                        });
                    });
                }
            
                setError(error.response.data.message)
            }  
            if (error.message) {
                errMsg("Login Failed")
            }
            

        } finally {
            setLoading(false)
        }

    }
    return (
        <div className={styles.login_container} >
            <div className={styles.login_form_container}>
                <div className={styles.left}>
                    <form className={styles.form_container} onSubmit={handleSubmit}>
                        <h1 className='py-3'>Login to your Account</h1>
                        <input 
                            type="text"
                            placeholder='Email'
                            name='email'
                            onChange={handleChange}
                            value={data.email}
                            required
                            className={styles.input}
                        />
                        <input 
                            type="password"
                            placeholder='Password'
                            name='password'
                            onChange={handleChange}
                            value={data.password}
                            required
                            className={styles.input}
                        />
                        {error && <div className={styles.error_msg}>{error}</div>}
                        <button type="submit" className={styles.green_btn} disabled={loading}>
                            {loading ? 'Loading...' : 'Log In'}

                        </button>
                        <p>--------Or--------</p>
                        <button className={`${styles.green_btn}`}>Login In with Google</button>
                    </form>
                </div>
                <div className={styles.right}>
                    <h1>New Here</h1>
                    <Link to='/register'>
                        <button type='button' className={styles.white_btn}>
                            Sign Up
                        </button>
                    </Link>


                </div>
            </div>
        </div>
    )
}

export default Login