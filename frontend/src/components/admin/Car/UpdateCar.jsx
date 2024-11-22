import React, { useEffect, useState } from 'react';
import {Link} from 'react-router-dom'
import axios from 'axios';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';
import {getToken} from '../../../utils/helper'
import Sidebar from '../Sidebar';

const UpdateCar = () => {
    const [model, setModel] = useState('');
    const [brand, setBrand] = useState('');
    const [year, setYear] = useState('');
    const [seatCapacity, setSeatCapacity] = useState('');
    const [fuel, setFuel] = useState('');
    const [mileage, setMileage] = useState('');
    const [transmission, setTransmission] = useState('');
    const [displacement, setDisplacement] = useState('');
    const [vehicleType, setVehicleType] = useState('');
    const [pricePerDay, setPricePerDay] = useState('');
    const [isAutoApproved, setIsAutoApproved] = useState(false);
    const [description, setDescription] = useState('');
    const [termsAndConditions, setTermsAndConditions] = useState('');
    const [pickUpLocation, setPickUpLocation] = useState('');
    const [owner, setOwner] = useState('');
    const [oldImages, setOldImages] = useState([]); // existing images
    const [images, setImages] = useState([]);
    const [imagesPreview, setImagesPreview] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [updateError, setUpdateError] = useState('');
    const [isUpdated, setIsUpdated] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false)

    let { id } = useParams();
    console.log(id);
    let navigate = useNavigate();

    const errMsg = (message = '') => toast.error(message, {
        position: 'bottom-right',
    });
    const successMsg = (message = '') => toast.success(message, {
        position: 'bottom-right',
    });

    const getCarDetails = async (id) => {
        try {
            const { data } = await axios.get(`http://localhost:4000/api/v1/Cars/${id}`);
            const car = data.car; // Adjust based on your API response structure
            setModel(car.model);
            setBrand(car.brand);
            setYear(car.year);
            setSeatCapacity(car.seatCapacity);
            setFuel(car.fuel);
            setMileage(car.mileage);
            setTransmission(car.transmission);
            setDisplacement(car.displacement);
            setVehicleType(car.vehicleType);
            setPricePerDay(car.pricePerDay);
            setIsAutoApproved(car.isAutoApproved);
            setDescription(car.description);
            setTermsAndConditions(car.termsAndConditions);
            setPickUpLocation(car.pickUpLocation);
            setOwner(car.owner);
            setOldImages(car.images); // Assuming images is an array in your Car model
            setLoading(false);
        } catch (error) {
            setError(error.response.data.message);
            setLoading(false);
        }
    };

    const updateCar = async (id, carData) => {
        try {
            const config = { 
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${getToken()}` 
                } 
            };
            const { data } = await axios.put(`http://localhost:4000/api/v1/Cars/${id}`, carData, config);
            setIsUpdated(data.success);
            toast.success('Car updated successfully!', {position: "bottom-right"})
            navigate("/admin/cars")
        } catch (error) {
            setUpdateError(error.response.data.message);
            const { message, error: errorDetails } = error.response.data;
          
            if (message) {
              toast.error(message, { position: "bottom-right" });
            }
          
            if (errorDetails && typeof errorDetails === 'string') {
              const errorMessages = errorDetails.split(', ');
          
              errorMessages.forEach(errorMessage => {
                toast.error(errorMessage, { position: "bottom-right" });
              });
            }
        }
    };

    useEffect(() => {
        getCarDetails(id);
    }, [id]);

    useEffect(() => {
        if (error) {
            errMsg(error);
        }
        if (updateError) {
            errMsg(updateError);
        }
        if (isUpdated) {
            navigate('/Cars'); // Adjust based on your routing
            successMsg('Car updated successfully');
        }
    }, [error, isUpdated, updateError, navigate]);

    const submitHandler = (e) => {
        e.preventDefault();
        setIsSubmitting(true)
        const formData = new FormData();
        formData.set('model', model);
        formData.set('brand', brand);
        formData.set('year', year);
        formData.set('seatCapacity', seatCapacity);
        formData.set('fuel', fuel);
        formData.set('mileage', mileage);
        formData.set('transmission', transmission);
        formData.set('displacement', displacement);
        formData.set('vehicleType', vehicleType);
        formData.set('pricePerDay', pricePerDay);
        formData.set('isAutoApproved', isAutoApproved);
        formData.set('description', description);
        formData.set('termsAndConditions', termsAndConditions);
        formData.set('pickUpLocation', pickUpLocation);
        images.forEach((image) => {
            formData.append('images', image);
        });
        for (const [key, value] of formData.entries()) {
            console.log(`${key}:`, value);
        }
        console.log(model);
        updateCar(id, formData);
        setIsSubmitting(false)
    };

    const onChange = (e) => {
        const files = Array.from(e.target.files);
        setImagesPreview([]);
        setImages([]);
        files.forEach((file) => {
            const reader = new FileReader();
            reader.onload = () => {
                if (reader.readyState === 2) {
                    setImagesPreview((oldArray) => [...oldArray, reader.result]);
                    setImages((oldArray) => [...oldArray, file]);
                }
            };
            reader.readAsDataURL(file);
        });
    };

    return (
        <>
            <div>
                <Sidebar />
                <form onSubmit={submitHandler} className='margin-left-300 p-3'>
                    <div className='d-flex align-items-center justify-content-between'>
                        <h2>Update Car Details</h2>
                        <Link to="/admin/cars" className="btn btn-secondary mt-3 ml-2">Back to List</Link>
                    </div>
                    <hr/>
                    <div className='form-group'>
                        <label>Images</label>
                        <div className='custom-file'>
                            <input
                                type='file'
                                name='images'
                                className='custom-file-input'
                                id='customFile'
                                accept="image/jpeg, image/jpg, image/png"
                                onChange={onChange}
                                multiple
                            />
                            <label className='custom-file-label' htmlFor='customFile'>
                                Choose Images
                            </label>
                        </div>

                        {imagesPreview.map(img => (
                            <img src={img} key={img} alt="Images Preview" className="mt-3 mr-2" width="55" height="52" />
                        ))}
                    </div>

                    {/* New section to display old images */}
                    <div className='form-group'>
                        <label>Existing Images</label>
                        {loading ? (
                            <p>Loading images...</p>
                        ) : (
                            <div className='existing-images'>
                                {oldImages.map((img, index) => (
                                    <img src={img.url} key={index} alt={`Car Image ${index + 1}`} className="mt-3 mr-2" width="55" height="52" />
                                ))}
                            </div>
                        )}
                    </div>

                    <div style={styles.formGroup}>
                        <label>Model:</label>
                        <input
                            type="text"
                            name="model"
                            placeholder="Model"
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label>Brand:</label>
                        <input
                            type="text"
                            name="brand"
                            placeholder="Brand"
                            value={brand}
                            onChange={(e) => setBrand(e.target.value)}
                        
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label>Year:</label>
                        <input
                            type="number"
                            name="year"
                            placeholder="Year"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                        
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label>Seat Capacity:</label>
                        <input
                            type="number"
                            name="seatCapacity"
                            placeholder="Seat Capacity"
                            value={seatCapacity} 
                            onChange={(e) => setSeatCapacity(e.target.value)}
                        
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label>Fuel Type:</label>
                        <select name="fuel" value={fuel}  onChange={(e) => setFuel(e.target.value)}  style={styles.select}>
                            <option value="">Select Fuel Type</option>
                            <option value="Petrol">Petrol</option>
                            <option value="Diesel">Diesel</option>
                            <option value="Hybrid">Hybrid</option>
                            <option value="Electric">Electric</option>
                            <option value="Plugin Hybrid">Plugin Hybrid</option>
                        </select>
                    </div>

                    <div style={styles.formGroup}>
                        <label>Mileage:</label>
                        <input
                            type="number"
                            name="mileage"
                            placeholder="Mileage"
                            value={mileage} 
                            onChange={(e) => setMileage(e.target.value)}
                        
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label>Transmission:</label>
                        <select name="transmission" value={transmission} onChange={(e) => setTransmission(e.target.value)} style={styles.select}>
                            <option value="">Select Transmission</option>
                            <option value="Manual">Manual</option>
                            <option value="Automatic">Automatic</option>
                        </select>
                    </div>

                    <div style={styles.formGroup}>
                        <label>Displacement:</label>
                        <input
                            type="number"
                            name="displacement"
                            placeholder="Displacement"
                            value={displacement} 
                            onChange={(e) => setDisplacement(e.target.value)}
                        
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label>Vehicle Type:</label>
                        <select name="vehicleType" value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} style={styles.select}>
                            <option value="">Select Vehicle Type</option>
                            <option value="Sedan">Sedan</option>
                            <option value="SUV">SUV</option>
                            <option value="Sport Car">Sport Car</option>
                        </select>
                    </div>

                    <div style={styles.formGroup}>
                        <label>Price Per Day:</label>
                        <input
                            type="number"
                            name="pricePerDay"
                            placeholder="Price Per Day"
                            value={pricePerDay} 
                            onChange={(e) => setPricePerDay(e.target.value)}
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label>Description:</label>
                        <textarea
                            name="description"
                            placeholder="Description"
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)}
                            style={styles.textarea}
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label>Terms and Conditions:</label>
                        <textarea
                            name="termsAndConditions"
                            placeholder="Terms and Conditions"
                            value={termsAndConditions} 
                            onChange={(e) => setTermsAndConditions(e.target.value)}
                            style={styles.textarea}
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label>Pick Up Location:</label>
                        <input
                            type="text"
                            name="pickUpLocation"
                            placeholder="Pick Up Location"
                            value={pickUpLocation} 
                            onChange={(e) => setPickUpLocation(e.target.value)}
                            style={styles.input}
                        />
                    </div>

                    <button type="submit" style={styles.button} disabled={isSubmitting}>
                        {!isSubmitting ? "Update Car" : "Submitting..."}
                    </button>
                </form>
            </div>
        </>
    );
};

const styles = {
    formContainer: {
        width: '400px',
        margin: '0 auto',
        padding: '20px',
        border: '1px solid #ddd',
        borderRadius: '5px',
        backgroundColor: '#f9f9f9',
    },
    header: {
        textAlign: 'center',
        marginBottom: '20px',
    },
    formGroup: {
        marginBottom: '15px',
    },
    input: {
        width: '100%',
        padding: '10px',
        borderRadius: '5px',
        border: '1px solid #ddd',
    },
    select: {
        width: '100%',
        padding: '10px',
        borderRadius: '5px',
        border: '1px solid #ddd',
    },
    textarea: {
        width: '100%',
        padding: '10px',
        borderRadius: '5px',
        border: '1px solid #ddd',
        height: '100px',
    },
    button: {
        width: '100%',
        padding: '10px',
        backgroundColor: '#007BFF',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
    },
};

export default UpdateCar;
