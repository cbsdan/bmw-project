import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 
import { getToken, getUser } from '../utils/helper';

const Home = () => {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(false);
    const [favoriteCars, setFavoriteCars] = useState([]);

    const fetchCars = async () => {
        try {
            const response = await axios.get('http://localhost:4000/api/v1/Cars');
            setCars(response.data);
        } catch (error) {
            console.error('Error fetching cars:', error);
            toast.error('Error fetching cars', { position: "bottom-right" });
        }
    };

    const fetchFavoriteCars = async () => {
        try {
            const config = { 
                headers: { 
                    'Authorization': `Bearer ${getToken()}` 
                } 
            };
            const user = getUser();
            const response = await axios.get(`http://localhost:4000/api/v1/favorite-cars/${user._id}`, config);
            setFavoriteCars(response.data.favoriteCars);
        } catch (error) {
            console.log(error);
        }
    };

    const handleFavoriteClick = async (car) => {
        const favoriteCar = favoriteCars.find(favCar => favCar.car._id === car._id);
        const config = {
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            }
        };
        const user = getUser();

        try {
            if (favoriteCar) {
                await axios.delete(`http://localhost:4000/api/v1/favorite-car/${favoriteCar._id}`, config);
                setFavoriteCars(favoriteCars.filter(favCar => favCar._id !== favoriteCar._id));
                toast.success(`${car.brand} ${car.model} removed from favorites`, { position: "bottom-right" });
            } else {
                const response = await axios.post('http://localhost:4000/api/v1/favorite-car/', {
                    user: user._id,
                    car: car._id
                }, config);
                setFavoriteCars([...favoriteCars, response.data.favoriteCar]);
                toast.success(`${car.brand} ${car.model} added to favorites`, { position: "bottom-right" });
            }
        } catch (error) {
            console.error('Error updating favorite car:', error);
            toast.error('Error updating favorite car.', { position: "bottom-right" });
        }
    };

    const deleteCar = async (carId, model) => {
        setLoading(true); 

        try {
            const config = { 
                headers: { 
                    'Authorization': `Bearer ${getToken()}` 
                } 
            };
            await axios.delete(`http://localhost:4000/api/v1/Cars/${carId}`, config);
            setCars(cars.filter(car => car._id !== carId)); 
            toast.success(`${model} has been deleted`, { position: "bottom-right" }); 
        } catch (error) {
            console.error('Error deleting car:', error);
            toast.error('Error deleting car.', { position: "bottom-right" }); 
        } finally {
            setLoading(false); 
        }
    };

    useEffect(() => {
        fetchCars();
        fetchFavoriteCars();
    }, []);

    const isFavorite = (carId) => {
        return favoriteCars.some(favCar => favCar.car._id === carId);
    };

    return (
        <>
            <main id="home">
                <h1>Welcome to <span className="text-warning">&nbsp;Borrow My Wheels</span></h1>
                <hr/>
                <div className="section featured-car" id="featured-car">
                    <div className="container">
                        <div className="title-wrapper">
                            <h2 className="h2 section-title">Featured Cars</h2>

                            <Link to="/admin/create-car" className="btn btn-success">
                                <span>+ Create New Rental Car</span>
                            </Link>
                        </div>

                        {loading && <p>Loading...</p>} {}

                        <ul className="featured-car-list">
                            {cars.map((car, index) => (
                                <li key={index}>
                                    <div className="featured-car-card">
                                        <button
                                            className={`favorite-btn ${isFavorite(car._id) ? 'text-danger' : ''}`}
                                            onClick={() => handleFavoriteClick(car)}
                                        >
                                            <i className="fa fa-heart"></i>
                                        </button>
                                        <figure className="card-banner">
                                            <img
                                                src={car.images[0]}
                                                alt={`${car.brand} ${car.model} ${car.year}`}
                                                loading="lazy"
                                                width="440"
                                                height="300"
                                                className="w-100"
                                            />
                                        </figure>

                                        <div className="card-content">
                                            <div className="card-title-wrapper">
                                                <h3 className="h3 card-title">
                                                    <Link to={`/car/info/${car._id}`}>{`${car.model} ${car.brand}`}</Link>
                                                </h3>
                                                <data className="year" value={car.year}>
                                                    {car.year}
                                                </data>
                                            </div>

                                            <ul className="card-list">
                                                <li className="card-list-item">
                                                    <ion-icon name="people-outline"></ion-icon>
                                                    <span className="card-item-text">Capacity: {car.seatCapacity} Seats</span>
                                                </li>
                                                <li className="card-list-item">
                                                    <ion-icon name="car-outline"></ion-icon>
                                                    <span className="card-item-text">Type: {car.vehicleType}</span>
                                                </li>
                                                <li className="card-list-item">
                                                    <ion-icon name="flash-outline"></ion-icon>
                                                    <span className="card-item-text">Fuel: {car.fuel}</span>
                                                </li>
                                                <li className="card-list-item">
                                                    <ion-icon name="speedometer-outline"></ion-icon>
                                                    <span className="card-item-text">Mileage: {car.mileage} km / L</span>
                                                </li>
                                                <li className="card-list-item">
                                                    <ion-icon name="hardware-chip-outline"></ion-icon>
                                                    <span className="card-item-text">Transmission: {car.transmission}</span>
                                                </li>
                                                <li className="card-list-item">
                                                    <ion-icon name="construct-outline"></ion-icon>
                                                    <span className="card-item-text">Displacement: {car.displacement}cc</span>
                                                </li>
                                            </ul>

                                            <p className="card-description">Description: {car.description}</p>
                                            <p className="card-terms">Terms and Conditions: {car.termsAndConditions}</p>
                                            <p className="card-location">Pick-up Location: {car.pickUpLocation}</p>

                                            <div className="card-price-wrapper">
                                                <p className="card-price">
                                                    <strong>₱{car.pricePerDay} / day</strong>
                                                </p>
                                                <button className="btn fav-btn" aria-label="Add to favourite list">
                                                    <ion-icon name="heart-outline"></ion-icon>
                                                </button>
                                            </div>

                                            {car.isAutoApproved && (
                                                <span className="badge badge-success">Auto Approved</span>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </main>
        </>
    );
};

export default Home;
