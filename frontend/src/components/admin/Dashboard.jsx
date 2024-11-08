import React from 'react'
import { Link } from 'react-router-dom'
import Sidebar from './Sidebar'
import CarAvailabilityChart from './carAvailabilityChart'
import IncomeChart from './incomeChart'
import MaintenanceRental from './maintenanceRentalChart'

const Dashboard = () => {
    return (
        <>
          <div className="d-flex">
                <Sidebar />
                <div className="container-fluid" style={{ marginLeft: '300px' }}>
                    <h1 style={{ textAlign:"center", paddingTop:"10px" }} >Dashboard</h1>
                    <div className="row">
                        <div className="col-md-6">
                            <CarAvailabilityChart />
                        </div>
                        <div className="col-md-6">
                            <IncomeChart />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-12 ">
                            <MaintenanceRental />
                        </div>
                    </div>
                </div>
            </div>

        </>
    )
}

export default Dashboard;