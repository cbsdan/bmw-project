import React from 'react'
import { Link } from 'react-router-dom'
import Sidebar from './Sidebar'

const Dashboard = () => {
    return (
        <>
            <div>
                <Sidebar />
            </div>
            <div className='margin-left-300'>
                <h1 className="px-3">Dashboard</h1>
            </div>
        </>
    )
}

export default Dashboard;