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
        paymentStatus: "Paid",
      };

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
        <div className="" style={{ position: "relative" }}>
          <div
            className="container py-2"
            style={{ position: "absolute", zIndex: "100" }}
          >
            <Button
              style={{ padding: "5px 10px", marginTop: "20px" }}
              className="dark-blue-bg"
            >
              <Link
                to="/"
                className="text-white"
                style={{ textDecoration: "none" }}
              >
                <i className="fa fa-arrow-left me-2"></i>
                Go Back
              </Link>
            </Button>
          </div>
          <Carousel style={{ height: "60vh" }}>
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
          <div className="container mt-3">
            {error ? <Alert message={error} type="error" /> : <></>}
            <h1 className="dark-blue-text">
              {carData.brand} {carData.model} ({carData.year})
            </h1>

            <div className="mt-3 col-12 col-md-4 d-flex align-items-center justify-content-start gap-4 px-0">
              <div className="d-flex flex-column flex-md-row align-items-center gap-2">
                <i className="fa fa-gear fs-3" style={{ opacity: "0.8" }}></i>
                <h4 className="m-0 light-blue-text">{carData.transmission}</h4>
              </div>
              <div className="d-flex flex-column flex-md-row align-items-center gap-2">
                <i
                  className="fa fa-gauge-high fs-3"
                  style={{ opacity: "0.8" }}
                ></i>
                <h4 className="m-0 light-blue-text">{carData.mileage}</h4>
              </div>
              <div className="d-flex flex-column flex-md-row align-items-center gap-2">
                <i
                  className="fa fa-gas-pump fs-3"
                  style={{ opacity: "0.8" }}
                ></i>
                <h4 className="m-0 light-blue-text">{carData.fuel}</h4>
              </div>
            </div>

            <div className="row mt-4">
              <div className="col-12 col-md-8 p-3">
                <h4 className="border-bottom mb-3">Information</h4>
                <div className="row">
                  <div className="m-0 mb-3 fs-6 d-flex align-items-center gap-2">
                    <i className="fa fa-money-bill-wave fs-4 me-2" style={{opacity: "0.8"}}></i>
                    <span className="fw-bold">₱{carData.pricePerDay} a day</span>
                  </div>
                  <div className="m-0 mb-3 fs-6 d-flex align-items-center gap-2">
                    <i className="fa fa-car fs-4 me-2" style={{opacity: "0.8"}}></i>
                    <span className="fw-bold">{carData.vehicleType}</span>
                  </div>
                  <div className="m-0 mb-3 fs-6 d-flex align-items-center gap-2">
                    <i className="fa fa-users fs-4 me-2" style={{opacity: "0.8"}}></i>
                    <span className="fw-bold">{carData.seatCapacity} Seat Capacity</span>
                  </div>
                  <div className="m-0 mb-3 fs-6 d-flex align-items-center gap-2">
                    <i className="fa fa-location fs-4 me-2" style={{opacity: "0.8"}}></i>
                    <span className="fw-bold">{carData.pickUpLocation}</span>
                  </div>

                  <div className="m-0 py-2 mt-4">
                    <h4 className="border-bottom">Description:</h4>{" "}
                    <p className="m-0">
                      {carData.description || "No description available"}
                    </p>
                  </div>
                  <div className="m-0 py-2 mt-4">
                    <h4 className="border-bottom">Terms and Conditions:</h4>{" "}
                    <p className="m-0">
                      {carData.termsAndConditions || "No Terms and Conditions"}
                    </p>
                  </div>
                  <p className="m-0 mt-4">
                    <h4 className="border-top mt-3 py-2">Owner</h4>{" "}
                    <div className="d-flex align-items-center gap-2">
                      <img
                        src={
                          carData.owner?.avatar?.url ||
                          "/images/default-image.jpg"
                        }
                        style={{
                          borderRadius: "50%",
                          objectFit: "cover",
                          width: "50px",
                          height: "50px",
                        }}
                        width="40"
                      />
                      <div className="d-flex flex-column">
                        <span className="fw-bold">
                          {carData.owner?.firstName} {carData.owner?.lastName}
                        </span>
                        <span>{carData.owner?.email}</span>
                      </div>
                    </div>
                  </p>
                </div>
              </div>
              <div className="col-12 col-md-4 p-3">
                {getUser() ? (
                  carData.owner._id == getUser()._id ? (
                    <h3 className="text-warning fst-italic">
                      You cannot book your own car
                    </h3>
                  ) : isCarOnRental ? (
                    <h3>This car is currently on rental. Cannot Book Now.</h3>
                  ) : (
                    <Card className="mt-3 p-3">
                      <h2>Book Now:</h2>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <Box display="flex" flexDirection="column" gap={2}>
                          <DateTimePicker
                            label="Pick-up Date"
                            value={pickupDate}
                            onChange={handlePickupDateChange}
                            renderInput={(params) => <TextField {...params} />}
                            disablePast
                          />
                          <DateTimePicker
                            label="Return Date"
                            value={returnDate}
                            onChange={handleReturnDateChange}
                            renderInput={(params) => <TextField {...params} />}
                            disablePast
                            minDateTime={pickupDate}
                          />
                          <InputLabel
                            id="payment-mode-label"
                            className="p-0 m-0 mt-2"
                          >
                            Mode of Payment
                          </InputLabel>
                          <Select
                            labelId="payment-mode-label"
                            id="payment-mode"
                            value={paymentMode}
                            onChange={handleChange}
                            label="Mode of Payment"
                          >
                            <MenuItem value="" selected>
                              <em>Select Payment</em>
                            </MenuItem>
                            <MenuItem value="Credit Card">Credit Card</MenuItem>
                            <MenuItem value="GCash">GCash</MenuItem>
                            <MenuItem value="Cash" selected>
                              Cash
                            </MenuItem>
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
                    </Card>
                  )
                ) : (
                  <>
                    <h3>You are not yet logged in to book this vehicle</h3>
                    <Link to="/login" className="mt-3">
                      <Button className="btn-primary">Login here</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>

            {carRating.length > 0 && (
              <div className="mt-5">
                <h3 className="pb-3 dark-blue-text">Car Rating</h3>
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
                              {rating.images.length > 0 ? (
                                rating.images.map((image, idx) => (
                                  <Carousel.Item key={idx}>
                                    <CardMedia
                                      component="img"
                                      alt={`Review Image ${idx + 1}`}
                                      height="140"
                                      image={image.url}
                                      title={`Review Image ${idx + 1}`}
                                    />
                                  </Carousel.Item>
                                ))
                              ) : (
                                <></>
                              )}
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
              <div className="mt-5 row">
                <h3 className="dark-blue-text col-12">Car Rentals</h3>
                <Table striped bordered hover className="col-8">
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
                  <strong>Owner Email Address:</strong> {carData.owner.email}
                </Typography>
                <Typography variant="body1">
                  <strong>Pick Up Location:</strong> {carData.pickUpLocation}
                </Typography>
                <Typography variant="body1">
                  <strong>Terms and Condition:</strong>{" "}
                  {carData.termsAndConditions}
                </Typography>
                <div>
                  <Typography variant="body1">
                    <strong>Owner:</strong> {carData.owner.firstName}{" "}
                    {carData.owner.lastName}
                  </Typography>
                </div>
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
        </div>
      ) : (
        <LoadingSpinner message="loading..." />
      )}
    </>
  );
};

export default Car;
