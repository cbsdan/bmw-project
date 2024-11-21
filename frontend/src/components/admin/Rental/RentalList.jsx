import React, { Fragment, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MDBDataTable } from 'mdbreact'

import Loader from '../../layout/Loader'
import axios from 'axios'
import {toast} from 'react-toastify'

import { getToken } from '../../../utils/helper';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from '../Sidebar'
import Swal from 'sweetalert2'

const RentalList = () => {
    const [rentals, setRentals] = useState([])
    const [error, setError] = useState({})

    const [loading, setLoading] = useState(true)

    let navigate = useNavigate()

    const getRentals = async () => {
        try {
            const config = {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            }
            
            const {data} = await axios.get(`${import.meta.env.VITE_API}/rentals`, config)
            setRentals(data)
            setLoading(false)
        } catch(error) {
            setError(error.response.data)
        }
    }

    useEffect(()=>{
        getRentals()
        
        if (error) {
            toast.error(error.message, {
                position: 'bottom-right'
            })
        }
        if (error.status == '401') {
            toast.error(error.message, {
                position: 'bottom-right'
            })
            navigate('/')
        }
    }, [])

    const rentalLists = () => {
        const data = {
            columns: [
                {
                    label: "ID",
                    field: "id",
                    sort: "asc"
                },
                {
                    label: "Car",
                    field: "car",
                    sort: "asc"
                },
                {
                    label: "Renter",
                    field: "renter",
                    sort: "asc"
                },
                {
                    label: "Owner",
                    field: "owner"
                },
                {
                    label: "Status",
                    field: "status"
                },
                {
                    label: "Actions",
                    field: "actions"
                }
            ],
            rows: []
        }

        if (rentals)
            console.log(rentals)
        rentals.forEach(rental => {
            data.rows.push({
                id: rental._id,
                car: `${rental.car?.brand} ${rental.car?.model}`,
                renter: `${rental.renter?.firstName} ${rental.renter?.lastName}`,
                owner: `${rental.car?.owner?.firstName} ${rental.car?.owner?.lastName}`,
                status: rental?.status,
                actions: <div className='d-flex align-items-center justify-content-center'>
                    <Link to={`/admin/update-rental/${rental._id}`} className="btn btn-primary py-1 px-2">
                        <i className="fa fa-pencil"></i>
                    </Link>
                </div>
            })
        })

        return data;
    }

    return (
        <>  
            <div>
                <Sidebar/>
            </div>
            <div className='p-3 margin-left-300'>
                <h1>Rentals</h1>
                <hr/>
                <div className='row'>
                    {loading ? <Loader/> : (
                        <MDBDataTable 
                            data={rentalLists()}
                            bordered
                            striped
                            hover
                        />
                    )}

                </div>
            </div>
        </>
    )
}

export default RentalList;