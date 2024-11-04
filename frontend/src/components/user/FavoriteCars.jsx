import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getToken, getUser } from '../../utils/helper';
import 'bootstrap/dist/css/bootstrap.min.css';

const FavoriteCars = () => {
    const [favoriteCars, setFavoriteCars] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchFavoriteCars = async () => {
        setLoading(true);
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
            console.error('Error fetching favorite cars:', error);
            toast.error('Error fetching favorite cars', { position: "bottom-right" });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteFavorite = async (favoriteCarId) => {
        setLoading(true);
        try {
            const config = {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            };
            await axios.delete(`http://localhost:4000/api/v1/favorite-car/${favoriteCarId}`, config);
            setFavoriteCars(favoriteCars.filter(favCar => favCar._id !== favoriteCarId));
            toast.success('Favorite car removed successfully', { position: "bottom-right" });
        } catch (error) {
            console.error('Error deleting favorite car:', error);
            toast.error('Error deleting favorite car', { position: "bottom-right" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFavoriteCars();
    }, []);

    if (loading) {
        return <div className="text-center"><div className="spinner-border" role="status"><span className="sr-only">Loading...</span></div></div>;
    }

    return (
        <div className="container mt-5">
            <h2 className="mb-4">My Favorite Cars</h2>
            <div className="row">
                {favoriteCars.length === 0 ? (
                    <p>No favorite cars found.</p>
                ) : (
                    favoriteCars.map(favCar => (
                        <div className="col-md-4 mb-4" key={favCar._id}>
                            <div className="card">
                                <img src={favCar.car.images[0].url} className="card-img-top" alt={`${favCar.car.brand} ${favCar.car.model}`} />
                                <div className="card-body">
                                    <h5 className="card-title">{favCar.car.brand} {favCar.car.model}</h5>
                                    <p className="card-text">{favCar.car.description}</p>
                                    <button className="btn btn-danger" onClick={() => handleDeleteFavorite(favCar._id)}>
                                        <i className="fas fa-trash-alt"></i> Remove from Favorites
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default FavoriteCars;
