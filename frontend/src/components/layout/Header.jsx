import {useState, useEffect} from 'react';
import { Link, useNavigate } from 'react-router-dom'
import {getUser, logout} from '../../utils/helper'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const Header = () => {
    const [user, setUser] = useState({})

    const navigate = useNavigate()

    const logoutHandler = () => {
        toast.success('Log out successfully'), {
            position: 'bottom-right'
        }
        logout(navigate('/login'));
    }

    useEffect(()=>{
        setUser(getUser())
    }, [])
    return (
        <>
            <nav className="navbar row m-0 bg-warning mb-3">
                <div className="col-12 col-md-3 py-0 m-0">
                    <div className="navbar-brand">
                        <h3>BMW</h3>
                    </div>
                </div> 

                <div className="col-12 col-md-3 mt-4 mt-md-0 text-center p-0 m-0">
                    {user 
                        ? 
                        (<div className="ml-4 dropdown d-inline d-flex align-items-center">
                            <img
                                src={user.avatar && user.avatar.url}
                                alt={user && (`${user.firstName} ${user.lastName}`) }
                                width={45}
                                style={{ height: "45px"}}
                                className="rounded-circle img-fluid"
                            />
                            <button
                                className="btn btn-default dropdown-toggle mr-4 d-flex align-items-center"
                                type="button"
                                id="dropDownMenuButton"
                                data-toggle="dropdown"
                                aria-haspopup="true"
                                aria-expanded="false"
                            >
                                <span>{user && (`${user.firstName} ${user.lastName}`)}</span>
                            </button>
                            <button className='btn btn-default'>
                                <Link
                                    className="text-danger" style={{"textDecoration": "none"}}to="/" onClick={logoutHandler}
                                >
                                    Logout
                                </Link>
                            </button>
                        
                            <div className="dropdown-menu" aria-labelledby="dropDownMenuButton">
                                {user && user.role === 'admin' && (
                                    <Link className="dropdown-item" to="/">Admin Page</Link>
                                )}
                                <Link className="dropdown-item" to="/">Page 1</Link>
                                <Link className="dropdown-item" to="/">Page 2</Link>

                            </div>
                        </div>
                        ) 
                        : 
                        <div>
                            <Link to="/login" className="btn ml-4" id="login_btn">Login</Link>
                            <Link to="/register" className="btn ml-4" id="register_btn">Register</Link>
                        </div>
                    }
                </div>

            </nav>
        </>
    )
}

export default Header;