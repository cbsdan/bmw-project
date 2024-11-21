import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Table } from "react-bootstrap";
import LoadingSpinner from "../layout/LoadingSpinner";
import Alert from "../layout/Alert";
import { getToken, getUser } from "../../utils/helper";
import { Link } from "react-router-dom";

const MyRentals = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRentals = async () => {
      try {
        const userId = getUser()._id;

        setLoading(true);
        const config = {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        };

        const response = await axios.get(
          `${import.meta.env.VITE_API}/my-rentals/${userId}`,
          config
        );

        if (!response.data.message) {
          setRentals(response.data);
        }
      } catch (error) {
        setError("Error retrieving rentals. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchRentals();
  }, []);

  if (loading) {
    return (
      <div className="text-center">
        <LoadingSpinner message="Loading..." />
      </div>
    );
  }

  return (
    <div className="container py-3">
      {}
      {error && <Alert message={error} type="error" />}
      <h2>My Rentals</h2>
      {rentals.length === 0 ? (
        <>
          <Alert message="You have no rentals at the moment." type="success" />
          <h1>No Rentals</h1>
        </>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Car</th>
              <th>Pick-Up Date</th>
              <th>Return Date</th>
              <th>Status</th>
              <th>Price Per Day</th>
              <th>Discount Code</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rentals.map((rental) => (
              <tr key={rental._id}>
                <td>
                  <Link to={`/car/info/${rental.car?._id}`}>
                    {rental.car.brand} {rental.car.model}
                  </Link>
                </td>
                <td>{new Date(rental.pickUpDate).toLocaleString()}</td>
                <td>{new Date(rental.returnDate).toLocaleString()}</td>
                <td>{rental.status}</td>
                <td>${rental.car.pricePerDay}</td>
                <td>{rental.discountCode || "N/A"}</td>
                <td>
                  <Button
                    variant="primary"
                    onClick={() => handleViewRental(rental._id)}
                  >
                    View
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleCancelRental(rental._id)}
                  >
                    Cancel
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );

  const handleViewRental = (rentalId) => {
    console.log("Viewing rental", rentalId);
  };

  const handleCancelRental = (rentalId) => {
    console.log("Canceling rental", rentalId);
  };
};

export default MyRentals;
