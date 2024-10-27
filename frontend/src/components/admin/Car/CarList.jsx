import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MDBDataTable } from 'mdbreact'

import Loader from '../../layout/Loader'
import axios from 'axios'
import {toast} from 'react-toastify'

import { getToken } from '../../../utils/helper';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from '../Sidebar'
import Swal from 'sweetalert2'

const CarList = () => {
    const [cars, setCars] = useState([])
    const [error, setError] = useState({})

    const [loading, setLoading] = useState(true)

    let navigate = useNavigate()

    const getCar = async () => {
        try {            
            const {data} = await axios.get(`${import.meta.env.VITE_API}/Cars`)
            setCars(data)
            setLoading(false)
        } catch(error) {
            setError(error.response.data)
        }
    }

    const deleteCar = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        })

        if (result.isConfirmed) {
            setLoading(true)
            try {
                const config = {
                    headers: {
                        'Authorization': `Bearer ${getToken()}`
                    }
                }
                await axios.delete(`${import.meta.env.VITE_API}/car/${id}`, config)
                setLoading(false)
                getCar()
                toast.success('Car deleted successfully', {
                    position: 'bottom-right'
                })
            } catch (error) {
                setError(error.response.data.message)
                setLoading(false)
            }
        }
    }

    useEffect(()=>{
        getCar()
        
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

    const carLists = () => {
        const data = {
            columns: [
                {
                    label: "ID",
                    field: "id",
                    sort: "asc"
                },
                {
                    label: "Model",
                    field: "model",
                    sort: "asc"
                },
                {
                    label: "Brand",
                    field: "brand",
                    sort: "asc"
                },
                {
                    label: "Vehicle Type",
                    field: "vehicleType",
                    sort: "asc"
                },
                {
                    label: "Status",
                    field: "isActive",
                    sort: "asc"
                },
                {
                    label: "Actions",
                    field: "actions"
                }
            ],
            rows: []
        }

        if (cars)
        cars.forEach(car => {
            data.rows.push({
                id: car._id,
                model: car.model,
                brand: car.brand,
                vehicleType: car.vehicleType,
                isActive: car.isActive ? "Active" : "Not Active",
                actions: <>
                    <Link to={`/admin/update-car/${car._id}`} className="btn btn-primary py-1 px-2">
                        <i className="fa fa-pencil"></i>
                    </Link>
                    <button className="btn btn-danger py-1 px-2 ml-2" onClick={() => {deleteCar(car._id)}}>
                        <i className="fa fa-trash"></i>
                    </button>
                </>
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
                <h1>Cars</h1>
                <hr/>
                <div className="d-flex justify-content-start mb-3">
                    <Link to="/admin/create-car" className="btn btn-success d-flex align-items-center">
                        <i className="fa fa-plus mr-2"></i>
                        Create new Car
                    </Link>
                </div>
                <div className='row'>
                    {loading ? <Loader/> : (
                        <MDBDataTable 
                            data={carLists()}
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

export default CarList;