import React from 'react'
import { Link } from 'react-router-dom'

const Sidebar = () => {
 
    return (
        <div className="sidebar-wrapper">
            <nav id="sidebar">
                <ul className="list-unstyled components">
                    <li>
                        <Link to="/admin/dashboard"><i className="fa fa-tachometer"></i> Dashboard</Link>
                    </li>

                    <li>
                        <a href="#discountSubmenu" data-toggle="collapse" aria-expanded="false" className="dropdown-toggle ">
                            <i className="fa fa-tag"></i> Discount <span> </span>
                        </a>

                        <ul className="collapse list-unstyled pt-2 pl-4" id="discountSubmenu">
                            <li>
                                <Link to="/admin/discounts"><i className="fa fa-clipboard"></i> All</Link>
                            </li>

                            <li>
                                <Link to="/admin/new-discount"><i className="fa fa-plus"></i>Create</Link>
                            </li>   
                        </ul>
                    </li>

                </ul>
            </nav>
        </div>
    )
}

export default Sidebar;
