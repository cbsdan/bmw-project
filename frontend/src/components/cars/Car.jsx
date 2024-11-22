import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, Button } from "react-bootstrap";
import { Link, useParams, useNavigate } from "react-router-dom";
import LoadingSpinner from "../layout/LoadingSpinner";
import TextField from "@mui/material/TextField";
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { Table } from "react-bootstrap";
import { Carousel } from "react-bootstrap";
import {
  Typography,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Box,
  Grid,
  CardContent,
  CardMedia,
  Rating,
} from "@mui/material";

import Alert from "../layout/Alert";
import { toast } from "react-toastify";
import {
  getUser,
  getToken,
  calculateRentalDays,
  errMsg,
} from "../../utils/helper";

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

  const [rentalDays, setRentalDays] = useState(null);
  const [paymentMode, setPaymentMode] = useState("");
  const [carRating, setCarRating] = useState([]);

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

  const handleChange = (event) => {
    setPaymentMode(event.target.value);
  };

  const handleDialogOpen = () => {
    try {
      if (!pickupDate || !returnDate) {
        toast.error("Please enter the pickup and return date!", {
          position: "bottom-right",
        });
        return;
      }
      if (paymentMode == "") {
        toast.error("Please enter the mode of payment.", {
          position: "bottom-right",
        });
        return;
      }
      const days = calculateRentalDays(pickupDate, returnDate);
      setRentalDays(days);
      console.log(days);

      setOpenDialog(true);
    } catch (error) {
      errMsg(error.message);
      console.log(message);
    }
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
        paymentMethod: paymentMode,
        paymentStatus: "Paid"
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

  const fetchCarRating = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      };
      const response = await axios.get(
        `${import.meta.env.VITE_API}/car/reviews/${carId}`,
        config
      );
      console.log(response);
      setCarRating(response.data.reviews);
      console.log(response.data.reviews);
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
    fetchCarRating();
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
                      <h3>This car is currently on rental. Cannot Book Now.</h3>
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
                            <InputLabel id="payment-mode-label">
                              Mode of Payment
                            </InputLabel>
                            <Select
                              labelId="payment-mode-label"
                              id="payment-mode"
                              value={paymentMode}
                              onChange={handleChange}
                              label="Mode of Payment"
                            >
                              <MenuItem value="">
                                <em>None</em>
                              </MenuItem>
                              <MenuItem value="Credit Card">
                                Credit Card
                              </MenuItem>
                              <MenuItem value="GCash">GCash</MenuItem>
                              <MenuItem value="Cash">Cash</MenuItem>
                            </Select>
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
          {carRating.length > 0 && (
            <div className="mt-4">
              <h3 className="pb-3">Car Rating</h3>
              <Grid container spacing={4}>
                {carRating.map((rating, index) => (
                  <Grid
                    container
                    item
                    xs={12}
                    md={6}
                    lg={12}
                    key={index}
                    spacing={1}
                  >
                    {/* Rating Content */}
                    <Grid item xs={12} lg={8} md={6} className="m-0 p-1 pt-0">
                      <Card variant="outlined" sx={{ boxShadow: "none" }}>
                        <CardContent>
                          <Typography variant="h6" component="div">
                            {rating.renter.firstName} ***
                          </Typography>
                          <Typography variant="body1">
                            Rating:{" "}
                            <Rating
                              value={rating.rating}
                              precision={0.5}
                              readOnly
                            />
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {rating.comment}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Date Created:{" "}
                            {new Date(rating.createdAt).toLocaleDateString()}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Image Content */}
                    <Grid item xs={12} lg={4} md={6} className="m-0 p-1 pt-0">
                      {rating.images && rating.images.length > 0 && (
                        <Card variant="outlined" sx={{ boxShadow: "none" }}>
                          <Carousel>
                            {rating.images.map((image, idx) => (
                              <Carousel.Item key={idx}>
                                <CardMedia
                                  component="img"
                                  alt={`Review Image ${idx + 1}`}
                                  height="140"
                                  image={image.url}
                                  title={`Review Image ${idx + 1}`}
                                />
                              </Carousel.Item>
                            ))}
                          </Carousel>
                        </Card>
                      )}
                    </Grid>
                  </Grid>
                ))}
              </Grid>
            </div>
          )}
          {carRentals.length > 0 && (
            <div className="mt-4">
              <h3>Car Rentals</h3>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Rental ID</th>
                    <th>Renter</th>
                    <th>Pick-Up Date</th>
                    <th>Return Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {carRentals.map((rental) => (
                    <tr key={rental._id}>
                      <td>{rental._id}</td>
                      <td>{rental.renter.firstName} ***</td>
                      <td>{new Date(rental.pickUpDate).toLocaleString()}</td>
                      <td>{new Date(rental.returnDate).toLocaleString()}</td>
                      <td>{rental.status}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}

          <Dialog
            open={openDialog}
            onClose={handleDialogClose}
            fullWidth={true}
            maxWidth="lg"
          >
            <DialogTitle className="w-100 text-center fs-4 fw-bold">
              Confirm Your Booking
            </DialogTitle>
            <DialogContent className="w-100">
              <Typography variant="h6">
                <strong>Car:</strong> {carData.brand} {carData.model} (
                {carData.year})
              </Typography>
              <Typography variant="body2">
                <strong>Type:</strong> {carData.vehicleType}
              </Typography>
              <Typography variant="body2">
                <strong>Capacity:</strong> {carData.seatCapacity}
              </Typography>
              <Typography variant="body2">
                <strong>Fuel:</strong> {carData.fuel}
              </Typography>
              <Typography variant="body2">
                <strong>Transmission:</strong> {carData.transmission}
              </Typography>
              <Typography variant="body2">
                <strong>Fuel:</strong> {carData.fuel}
              </Typography>
              <hr />
              <Typography variant="body1">
                <strong>Pick-up Date:</strong> {pickupDate?.toLocaleString()}
              </Typography>
              <Typography variant="body1">
                <strong>Return Date:</strong> {returnDate?.toLocaleString()}
              </Typography>
              <Typography variant="body1">
                <strong>Price Per Day:</strong> ₱{carData.pricePerDay}
              </Typography>
              <Typography variant="body1">
                <strong>Rental Day/s:</strong> {rentalDays}
              </Typography>
              <Typography variant="body1">
                <strong>Payment:</strong> ₱{rentalDays * carData.pricePerDay}
              </Typography>
              <Typography variant="body1">
                <strong>Mode of Payment:</strong> {paymentMode || "GCash"}
              </Typography>
              <hr />
              <Typography variant="body1">
                <strong>Owner:</strong> {carData.owner.firstName}{" "}
                {carData.owner.lastName}
              </Typography>
              <Typography variant="body1">
                <strong>Owner Email Address:</strong> {carData.owner.email}
              </Typography>
              <Typography variant="body1">
                <strong>Pick Up Location:</strong> {carData.pickUpLocation}
              </Typography>
              <Typography variant="body1">
                <strong>Terms and Condition:</strong>{" "}
                {carData.termsAndConditions}
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
