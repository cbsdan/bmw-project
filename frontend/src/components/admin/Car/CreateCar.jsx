import React, { useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'
import axios from 'axios';
import {getToken} from '../../../utils/helper'
import {useNavigate } from 'react-router-dom';

import Sidebar from '../Sidebar';

const CreateCar = () => {
    const [Images, setImages] = useState([]);
    const [imagesPreview, setImagesPreview] = useState([])

    const [formData, setFormData] = useState({
        model: '',
        brand: '',
        year: '',
        seatCapacity: '',
        fuel: '',
        mileage: '',
        transmission: '',
        displacement: '',
        vehicleType: '',
        pricePerDay: '',
        isAutoApproved: false,
        description: '',
        termsAndConditions: '',
        pickUpLocation: '',
        owner: '',
        isActive: true,
    });

    const [isSubmitting, setIsSubmitting] = useState(false)

    let navigate = useNavigate();

    const handleChange = (e) => {
        console.log(e.target.name)
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };
    
    const onChange = e => {
        const files = Array.from(e.target.files);
        setImages(files);  // Store the actual file objects in Images
        setImagesPreview([]);  // Clear the previous previews
    
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = () => {
                if (reader.readyState === 2) {
                    setImagesPreview(oldArray => [...oldArray, reader.result]);  // Store the base64 preview
                }
            };
            reader.readAsDataURL(file);
        });
    };
    

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true)
         // Perform validation

        if (formData.year < 2009) {
            toast.error('The minimum year required is 2009 or higher.', {position: "bottom-right"});
            setIsSubmitting(false)
            return;
        } else if(formData.year > 2024){
            toast.error('Year is not correct.', {position: "bottom-right"});
            setIsSubmitting(false)
            return;
        }
       
        const data = new FormData();
        

        // Append form data
        for (const key in formData) {
            console.log(`${key}: ${formData[key]}`);
            data.append(key, formData[key]);
        }
        
        // Correct the reference to 'Images' here
        Images.forEach(image => {
            data.append('images', image);
        });
    
        console.log("Data", data);
    
        try {
            const response = await axios.post('http://localhost:4000/api/v1/CreateCar', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${getToken()}` 
                },
            });
            console.log('Car created successfully:', response.data);
            toast.success('Car created successfully!', {position: "bottom-right"})
            navigate("/")
        } catch (error) {
            console.error('Error creating car:', error.response.data);

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
        setIsSubmitting(false)
    };
    
    return (
        <div>
            <Sidebar />
            <form onSubmit={handleSubmit} className='margin-left-300 p-3'>
                <h2 >Create a New Car Listing</h2>
                <hr/>
                <div style={styles.formGroup}>
                    <label>Model:</label>
                    <input
                        type="text"
                        name="model"
                        placeholder="Model"
                        onChange={handleChange}
                        
                        style={styles.input}
                    />
                </div>

                <div style={styles.formGroup}>
                    <label>Brand:</label>
                    <input
                        type="text"
                        name="brand"
                        placeholder="Brand"
                        onChange={handleChange}
                        
                        style={styles.input}
                    />
                </div>

                <div style={styles.formGroup}>
                    <label>Year:</label>
                    <input
                        type="number"
                        name="year"
                        placeholder="Year"
                        onChange={handleChange}
                        
                        style={styles.input}
                    />
                </div>

                <div style={styles.formGroup}>
                    <label>Seat Capacity:</label>
                    <input
                        type="number"
                        name="seatCapacity"
                        placeholder="Seat Capacity"
                        onChange={handleChange}
                        
                        style={styles.input}
                    />
                </div>

                <div style={styles.formGroup}>
                    <label>Fuel Type:</label>
                    <select name="fuel" onChange={handleChange}  style={styles.select}>
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
                        onChange={handleChange}
                        
                        style={styles.input}
                    />
                </div>

                <div style={styles.formGroup}>
                    <label>Transmission:</label>
                    <select name="transmission" onChange={handleChange}  style={styles.select}>
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
                        onChange={handleChange}
                        
                        style={styles.input}
                    />
                </div>

                <div style={styles.formGroup}>
                    <label>Vehicle Type:</label>
                    <select name="vehicleType" onChange={handleChange}  style={styles.select}>
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
                        onChange={handleChange}
                        
                        style={styles.input}
                    />
                </div>

                <div style={styles.formGroup}>
                    <label>Description:</label>
                    <textarea
                        name="description"
                        placeholder="Description"
                        onChange={handleChange}
                        style={styles.textarea}
                    />
                </div>

                <div style={styles.formGroup}>
                    <label>Terms and Conditions:</label>
                    <textarea
                        name="termsAndConditions"
                        placeholder="Terms and Conditions"
                        onChange={handleChange}
                        style={styles.textarea}
                    />
                </div>

                <div style={styles.formGroup}>
                    <label>Pick Up Location:</label>
                    <input
                        type="text"
                        name="pickUpLocation"
                        placeholder="Pick Up Location"
                        onChange={handleChange}
                        style={styles.input}
                    />
                </div>

                <div style={styles.formGroup}>
                    <label>Owner:</label>
                    <input
                        type="text"
                        name="owner"
                        placeholder="Owner"
                        onChange={handleChange}
                        style={styles.input}
                    />
                </div>

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

                <button type="submit" style={styles.button} disabled={isSubmitting}>
                    {!isSubmitting ? "Create Car" : "Submitting..."}
                </button>
            </form>
        </div>
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
    fileInput: {
        width: '100%',
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

export default CreateCar;
