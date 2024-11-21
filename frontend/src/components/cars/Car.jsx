import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, Button } from "react-bootstrap";
import { Link, useParams, useNavigate } from "react-router-dom";
import LoadingSpinner from "../layout/LoadingSpinner";
import TextField from "@mui/material/TextField";
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { Typography } from "@mui/material";
import Alert from "../layout/Alert";
import { toast } from "react-toastify";
import { getUser, getToken } from "../../utils/helper";
import { Table } from "react-bootstrap";
import { Carousel } from "react-bootstrap";

const Car = () => {
  const { id: carId } = useParams();
  const [carData, setCarData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [pickupDate, setPickupDate] = useState(null);
  const [returnDate, setReturnDate] = useState(null);
  const [discountCode, setDiscountCode] = useState("");

  const [openDialog, setOpenDialog] = useState(false);

  const [carRentals, setCarRentals] = useState([]);

  let navigate = useNavigate();

  const handlePickupDateChange = (newValue) => {
    setPickupDate(newValue);
    if (newValue > returnDate) {
      setReturnDate(null);
    }
  };

  const handleReturnDateChange = (newValue) => {
    setReturnDate(newValue);
  };

  const handleDiscountCodeChange = (event) => {
    setDiscountCode(event.target.value);
  };

  // Dialog open/close handlers
  const handleDialogOpen = () => {
    if (!pickupDate || !returnDate) {
      toast.error("Please enter the pickup and return date!", {
        position: "bottom-right",
      });
      return;
    }
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const handleConfirmBooking = async () => {
    try {
      const bookingData = {
        car: carId,
        renter: getUser()._id,
        pickUpDate: pickupDate.toISOString().slice(0, 19),
        returnDate: returnDate.toISOString().slice(0, 19),
        status: "Pending",
      };

      if (discountCode) {
        bookingData.discountCode = discountCode;
      }
      console.log(bookingData);
      const config = {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      };
      const response = await axios.post(
        `${import.meta.env.VITE_API}/createRental`,
        bookingData,
        config
      );

      toast.success("Booking confirmed! Please wait for owner approval", {
        position: "bottom-right",
      });
      navigate("/my-rentals");
      setOpenDialog(false);
    } catch (error) {
      console.log(error);
      toast.error("Error" + error?.response?.data?.message, {
        position: "bottom-right",
      });
    }
  };

  const fetchCarRentals = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      };
      const response = await axios.get(
        `${import.meta.env.VITE_API}/car-rentals/${carId}`,
        config
      );
      console.log(response);
      setCarRentals(response.data);
    } catch (error) {
      console.log(error);
    }
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
    fetchCarRentals();
  }, [carId]);

  let isCarOnRental = false;

  if (carRentals.length > 0) {
    isCarOnRental = carRentals.some(
      (rental) =>
        rental.status === "Pending" ||
        rental.status === "Confirmed" ||
        rental.status === "Active"
    );
  }

  return (
    <>
      {!loading ? (
        <div className="container py-3">
          <Button>
            <Link to="/" className="text-white">
              Back
            </Link>
          </Button>
          <Card className="mt-3">
            {error ? <Alert message={error} type="error" /> : <></>}
            <Card.Header>
              {carData.brand} {carData.model} ({carData.year})
            </Card.Header>
            <Card.Body>
              <div className="row">
                <div className="col-md-6">
                  <Carousel>
                    {carData?.images?.length > 0 ? (
                      carData.images.map((image, index) => (
                        <Carousel.Item key={index}>
                          <img
                            className="d-block w-100 fixed-carousel-height-image"
                            src={image.url}
                            alt={`Car image ${index + 1}`}
                          />
                        </Carousel.Item>
                      ))
                    ) : (
                      <Carousel.Item>
                        <img
                          className="d-block w-100"
                          src="/placeholder.jpg"
                          alt="No images available"
                        />
                      </Carousel.Item>
                    )}
                  </Carousel>
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
                    <li className="list-group-item">
                      <strong>Owner:</strong>{" "}
                      {carData?.owner !== undefined
                        ? `${carData?.owner.firstName} ${carData?.owner.lastName}`
                        : "No description available"}
                    </li>
                  </ul>
                </div>
                <div className="col-md-6 p-1">
                  {getUser() ? (
                    carData.owner._id == getUser()._id ? (
                      <h3>You cannot book your own car</h3>
                    ) : isCarOnRental ? (
                      <h3>
                        This car is currently on rental. Cannot Book Now.
                      </h3>
                    ) : (
                      <>
                        <h2>Book Now:</h2>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <Box display="flex" flexDirection="column" gap={2}>
                            <DateTimePicker
                              label="Pick-up Date"
                              value={pickupDate}
                              onChange={handlePickupDateChange}
                              renderInput={(params) => (
                                <TextField {...params} />
                              )}
                              disablePast
                            />
                            <DateTimePicker
                              label="Return Date"
                              value={returnDate}
                              onChange={handleReturnDateChange}
                              renderInput={(params) => (
                                <TextField {...params} />
                              )}
                              disablePast
                              minDateTime={pickupDate}
                            />
                            <TextField
                              label="Discount Code"
                              value={discountCode}
                              onChange={handleDiscountCodeChange}
                              variant="outlined"
                              fullWidth
                            />
                            <Button
                              variant="contained"
                              color="primary"
                              className="btn-primary"
                              onClick={handleDialogOpen}
                            >
                              Book
                            </Button>
                          </Box>
                        </LocalizationProvider>
                      </>
                    )
                  ) : (
                    <>
                      <h3>You are not yet logged in to book this vehicle</h3>
                      <Link to="/login">Login here</Link>
                    </>
                  )}
                </div>
              </div>
            </Card.Body>
          </Card>
          {carRentals.length > 0 && (
            <div className="mt-4">
              <h3>Car Rentals</h3>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Rental ID</th>
                    <th>Pick-Up Date</th>
                    <th>Return Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {carRentals.map((rental) => (
                    <tr key={rental._id}>
                      <td>{rental._id}</td>
                      <td>{new Date(rental.pickUpDate).toLocaleString()}</td>
                      <td>{new Date(rental.returnDate).toLocaleString()}</td>
                      <td>{rental.status}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
          {/* Confirmation Dialog */}
          <Dialog open={openDialog} onClose={handleDialogClose}>
            <DialogTitle>Confirm Your Booking</DialogTitle>
            <DialogContent>
              <Typography variant="body1">
                <strong>Car:</strong> {carData.brand} {carData.model} (
                {carData.year})
              </Typography>
              <Typography variant="body1">
                <strong>Pick-up Date:</strong> {pickupDate?.toLocaleString()}
              </Typography>
              <Typography variant="body1">
                <strong>Return Date:</strong> {returnDate?.toLocaleString()}
              </Typography>
              <Typography variant="body1">
                <strong>Price Per Day:</strong> ${carData.pricePerDay}
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDialogClose} color="primary">
                Cancel
              </Button>
              <Button onClick={handleConfirmBooking} color="primary">
                Confirm
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      ) : (
        <LoadingSpinner message="loading..." />
      )}
    </>
  );
};

export default Car;
