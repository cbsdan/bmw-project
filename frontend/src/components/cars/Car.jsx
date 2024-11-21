import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, Alert, Button } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import LoadingSpinner from "../layout/LoadingSpinner";
import "react-datepicker/dist/react-datepicker.css";
const Car = () => {
  const { id: carId } = useParams();
  const [carData, setCarData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [pickupDate, setPickupDate] = useState(null);
  const [returnDate, setReturnDate] = useState(null);
  const [discountCode, setdiscountCode] = useState(null);

  const handlePickupDateChange = (newValue) => {
    setPickupDate(newValue);
    if (newValue > returnDate) {
      setReturnDate(null);
    }
  };

  const handleReturnDateChange = (newValue) => {
    setReturnDate(newValue);
  };

  useEffect(() => {
    const fetchCarData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API}/Cars/${carId}`
        );
        setCarData(response.data.car);
      } catch (err) {
        setError("Failed to fetch car data. Please try again.");
        console.log("error", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCarData();
  }, [carId]);

  return (
    <>
      {!loading ? (
        <>
          <Button>
            <Link to="/" className="text-white">
              Back
            </Link>
          </Button>
          <Card className="mt-3">
            {error ? <Alert variant="danger">{error}</Alert> : <></>}
            <Card.Header>
              {carData.brand} {carData.model} ({carData.year})
            </Card.Header>
            <Card.Body>
              <div className="row">
                <div className="col-md-6">
                  <img
                    src={
                      carData?.images
                        ? carData.images[0].url
                        : "/placeholder.jpg"
                    }
                    alt={`${carData.brand} ${carData.model}`}
                    className="img-fluid rounded mb-3"
                  />
                </div>
                <div className="col-md-6">
                  <ul className="list-group">
                    <li className="list-group-item">
                      <strong>Price Per Day:</strong> ${carData.pricePerDay}
                    </li>
                    <li className="list-group-item">
                      <strong>Vehicle Type:</strong> {carData.vehicleType}
                    </li>
                    <li className="list-group-item">
                      <strong>Seat Capacity:</strong> {carData.seatCapacity}{" "}
                      seats
                    </li>
                    <li className="list-group-item">
                      <strong>Transmission:</strong> {carData.transmission}
                    </li>
                    <li className="list-group-item">
                      <strong>Fuel:</strong> {carData.fuel}
                    </li>
                    <li className="list-group-item">
                      <strong>Mileage:</strong> {carData.mileage} km
                    </li>
                    <li className="list-group-item">
                      <strong>Pick-Up Location:</strong>{" "}
                      {carData.pickUpLocation}
                    </li>
                    <li className="list-group-item">
                      <strong>Description:</strong>{" "}
                      {carData.description || "No description available"}
                    </li>
                  </ul>
                </div>
              </div>
            </Card.Body>
          </Card>
          <h2>Book Now:</h2>
                    

        </>
      ) : (
        <LoadingSpinner message="loading..." />
      )}
    </>
  );
};

export default Car;
