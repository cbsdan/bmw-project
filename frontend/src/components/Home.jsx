import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getToken, getUser } from "../utils/helper";
import {
  Container,
  Grid,
  Typography,
  Box,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";

const Home = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [favoriteCars, setFavoriteCars] = useState([]);
  const doneTypingInterval = 1000; // 1 second delay for typing
  const [rating, setRating] = useState(0);
  const [currentPage, setCurrentPage] = useState(1); // Current page state for pagination
  const [hasMore, setHasMore] = useState(true);
  const [totalPages, setTotalPages] = useState();
  const firstFetchDone = useRef(false);
  const handleRatingChange = (newRating) => {
    // Update the rating state with the clicked star's value
    setRating(newRating);
  };
  const [formData, setFormData] = useState({
    transmission: "",
    model: "",
    brand: "",
    pricePerDay: "",
    year: "",
  });
  const [typingTimer, setTypingTimer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: !value ? "This field is required" : null,
    }));
  };

  // Fetch total pages first
  const fetchTotalPages = async () => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/v1/Cars/total-pages`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch total pages");
      }
      const data = await response.json();
      console.log("Total Pages:", data.totalPages); // Log the total pages
      setTotalPages(data.totalPages); // Update the total pages state
    } catch (error) {
      console.error("Error fetching total pages:", error);
    }
  };
  // fetchAllCars function
  const fetchAllCars = async (page) => {
    if (isLoading || page > totalPages) return; // Prevent redundant fetches
    try {
      console.log(`Fetching page ${page}...`); // Log the current page being fetched

      const response = await fetch(
        // Set loading state after the delay
        `http://localhost:4000/api/v1/Cars/infinite?page=${page}&resPerPage=10`
      );
      if (!response.ok) throw new Error("Failed to fetch cars");

      const data = await response.json();

      // Debugging: Log fetched data
      console.log("Fetched data:", data);
      console.log(`Cars on page ${page}:`, data.cars);
      console.log(
        `Pagination Info -> Current Page: ${data.currentPage}, Total Pages: ${data.totalPages}`
      );

      // Update state with fetched cars and pagination info
      setCars((prevCars) => [...prevCars, ...data.cars]);
      setCurrentPage(data.currentPage);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error fetching cars:", error);
    } finally {
      // Reset loading state and trigger re-render
      setIsLoading(false); // Hide the loading spinner after the fetch is complete
    }
  };

  const fetchFilteredCars = async (signal) => {
    try {
      setIsLoading(true);

      const query = new URLSearchParams(
        Object.fromEntries(Object.entries(formData).filter(([_, v]) => v))
      ).toString();

      const response = await fetch(
        `http://localhost:4000/api/v1/Cars/filter?${query}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          signal,
        }
      );

      console.log(response)
      if (!response.ok) {
        throw new Error("Failed to fetch filtered cars");
      }

      const data = await response.json();

      if (data.success) {
        console.log("Filtered Cars:", data.cars);
        setCars(data.cars);
      }
    } catch (error) {
        console.log(error)
      if (error.name !== "AbortError") {
        console.error("Error fetching filtered cars:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleScroll = async () => {
      // Prevent triggering multiple fetches while already loading
      if (isLoading) return;

      const footer = document.querySelector("footer"); // Get the footer element
      const footerOffset = footer
        ? footer.offsetTop
        : document.documentElement.scrollHeight; // Get footer position
      const footerHeight = footer ? footer.offsetHeight : 0; // Get footer height
      const isBottom =
        window.innerHeight + document.documentElement.scrollTop >=
        footerOffset - footerHeight - 100; // Check if we are 100px from the footer

      if (
        isBottom &&
        !isLoading && // Ensure that isLoading is false before triggering fetch
        hasMore &&
        currentPage < totalPages // Prevent fetching if already at the last page
      ) {
        // Set loading state to true
        setIsLoading(true);

        // Introduce a delay to simulate loading
        await new Promise((resolve) => setTimeout(resolve, 1000)); // 1500ms = 1.5 seconds

        console.log(
          `Reached the bottom of page ${currentPage}. Fetching page ${
            currentPage + 1
          }...`
        );

        fetchAllCars(currentPage + 1);

        setIsLoading(false);
      }
    };

    let timeout;
    const handleScrollDebounced = () => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(handleScroll, 200); 
    };

    window.addEventListener("scroll", handleScrollDebounced);

    return () => {
      window.removeEventListener("scroll", handleScrollDebounced);
      if (timeout) clearTimeout(timeout); 
    };
  }, [currentPage, isLoading, totalPages, hasMore]);

  useEffect(() => {
    if (typingTimer) clearTimeout(typingTimer);
    const controller = new AbortController();
    const signal = controller.signal;
    const isQueryEmpty = Object.values(formData).every((value) => !value);

    if (isQueryEmpty && !firstFetchDone.current) {
      setCars([]);
      firstFetchDone.current = true; 
      fetchAllCars(1); 
    }
    if (!isQueryEmpty) {
      firstFetchDone.current = false;
      const newTypingTimer = setTimeout(() => {
        fetchFilteredCars(signal); 
      }, doneTypingInterval);
      setTypingTimer(newTypingTimer);
    }
    return () => {
      clearTimeout(typingTimer);
      controller.abort();
    };
  }, [formData]);

  const fetchFavoriteCars = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      };
      const user = getUser();
      const response = await axios.get(
        `http://localhost:4000/api/v1/favorite-cars/${user._id}`,
        config
      );
      setFavoriteCars(response.data.favoriteCars);
    } catch (error) {
      console.log(error);
    }
  };

  const handleFavoriteClick = async (car) => {
    const favoriteCar = favoriteCars.find(
      (favCar) => favCar.car._id === car._id
    );
    const config = {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
    };
    const user = getUser();

    try {
      if (favoriteCar) {
        await axios.delete(
          `http://localhost:4000/api/v1/favorite-car/${favoriteCar._id}`,
          config
        );
        setFavoriteCars(
          favoriteCars.filter((favCar) => favCar._id !== favoriteCar._id)
        );
        toast.success(`${car.brand} ${car.model} removed from favorites`, {
          position: "bottom-right",
        });
      } else {
        const response = await axios.post(
          "http://localhost:4000/api/v1/favorite-car/",
          {
            user: user._id,
            car: car._id,
          },
          config
        );
        setFavoriteCars([...favoriteCars, response.data.favoriteCar]);
        toast.success(`${car.brand} ${car.model} added to favorites`, {
          position: "bottom-right",
        });
      }
    } catch (error) {
      console.error("Error updating favorite car:", error);
      toast.error("Error updating favorite car.", { position: "bottom-right" });
    }
  };

  const deleteCar = async (carId, model) => {
    setLoading(true);

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      };
      await axios.delete(`http://localhost:4000/api/v1/Cars/${carId}`, config);
      setCars(cars.filter((car) => car._id !== carId));
      toast.success(`${model} has been deleted`, { position: "bottom-right" });
    } catch (error) {
      console.error("Error deleting car:", error);
      toast.error("Error deleting car.", { position: "bottom-right" });
    } finally {
      setLoading(false);
    }
  };

  const isFavorite = (carId) => {
    return favoriteCars.some((favCar) => favCar.car._id === carId);
  };

  return (
    <>
      <main id="home">
        <h1>
          Welcome to{" "}
          <span className="text-warning">&nbsp;Borrow My Wheels</span>
        </h1>

        <section className="section get-start" id="get-start">
          <div className="container">
            <h2 className="h2 section-title">Get started with 4 simple steps</h2>
            <ul className="get-start-list">
              <li>
                <div className="get-start-card">
                  <div className="card-icon icon-1">
                    <i className="fas fa-user-plus"></i>
                  </div>
                  <h3 className="card-title">Create a profile</h3>
                  <p className="card-text">
                    1. Visit our website and click on the "Register" button.{" "}
                    <br />
                    2. Fill out the registration form with your details.
                    <br />
                    3. Log in and put the information needed.
                  </p>

                  <Link to="/register" className="card-link">
                      Get started
                  </Link>
                </div>
              </li>
              <li>
                <div className="get-start-card">
                  <div className="card-icon icon-2">
                    <i className="fas fa-car"></i>
                  </div>
                  <h3 className="card-title">Tell us what car you want</h3>
                  <p className="card-text">
                    1. Select the car type you need (e.g., sedan, SUV, or
                    truck).
                    <br />
                    2. Specify your preferred brand, model, and features.
                    <br />
                    3. Indicate your budget and any additional requirements.
                    <br />
                    4. Submit the details, and we’ll match you with the best
                    options.
                  </p>
                </div>
              </li>
              <li>
                <div className="get-start-card">
                  <div className="card-icon icon-3">
                    <i className="fas fa-handshake"></i>
                  </div>
                  <h3 className="card-title">Match with seller</h3>
                  <p className="card-text">
                    1. Browse through our list of verified sellers.
                    <br />
                    2. Check seller profiles and customer reviews.
                    <br />
                    3. Contact the seller to discuss your requirements.
                    <br />
                    4. Schedule a meeting or test drive to finalize details.
                  </p>
                </div>
              </li>
              <li>
                <div className="get-start-card">
                  <div className="card-icon icon-4">
                    <i className="fas fa-credit-card"></i>
                  </div>
                  <h3 className="card-title">Make a deal</h3>
                  <p className="card-text">
                    1. Negotiate the price and finalize terms with the seller.
                    <br />
                    2. Agree on a payment method and schedule.
                    <br />
                    3. Complete the necessary paperwork and documentation.
                    <br />
                    4. Make the payment and close the deal securely.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </section>

        <hr />
        <section
          className="about-us"
          id="about-us"
          style={{ backgroundColor: "#f4f4f4", padding: "60px 0" }}
        >
          <Container>
            <Grid container spacing={4}>
              <Grid item lg={6}>
                <Typography
                  variant="h2"
                  sx={{
                    color: "#2c3e50",
                    fontSize: "3rem",
                    lineHeight: "1.3",
                  }}
                >
                  About Us
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: "#34495e",
                    fontSize: "1.2rem",
                    lineHeight: "1.6",
                    marginBottom: "1rem",
                  }}
                >
                  Welcome to our Car Rental service! We offer a wide selection
                  of vehicles to meet all your transportation needs. Whether you
                  need a quick city drive, a road trip, or a special occasion
                  car, we’ve got you covered.
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: "#34495e",
                    fontSize: "1.2rem",
                    lineHeight: "1.6",
                  }}
                >
                  Our goal is to provide a seamless car rental experience with
                  easy booking, flexible rates, and top-notch customer service.
                  We’re here to make your journeys as comfortable and
                  hassle-free as possible.
                </Typography>
              </Grid>
              <Grid item lg={6}>
                <Box
                  sx={{
                    backgroundImage: "url(../../images/car-5.jpg)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    height: "500px",
                    width: "800px",
                    borderRadius: "10px",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                    position: "relative",
                  }}
                ></Box>
              </Grid>
            </Grid>

            <div className="row" style={{ marginTop: "40px" }}>
              <div className="col-12">
                <section className="section blog" id="blog">
                  <Container>
                    <Typography variant="h2" sx={{ marginBottom: "2rem" }}>
                      Transaction Reviews
                    </Typography>

                    <Grid container spacing={4}>
                      <Grid item xs={12} sm={6} md={4}>
                        <Card>
                          <CardMedia
                            component="img"
                            image="../../images/blog-1.jpg"
                            alt="Opening of new offices of the company"
                            sx={{ height: 200 }}
                          />
                          <CardContent>
                            <Typography variant="h5" component="div">
                              Opening of new offices of the company
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              <time dateTime="2022-01-14">
                                January 14, 2022
                              </time>
                            </Typography>
                          </CardContent>
                          <CardActions>
                            <Link to="/register">
                              <Button size="small" color="primary">
                                Read More
                              </Button>
                            </Link>
                          </CardActions>
                        </Card>
                      </Grid>

                      <Grid item xs={12} sm={6} md={4}>
                        <Card>
                          <CardMedia
                            component="img"
                            image="../../images/blog-1.jpg"
                            alt="What cars are most vulnerable"
                            sx={{ height: 200 }}
                          />
                          <CardContent>
                            <Typography variant="h5" component="div">
                              What cars are most vulnerable
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              <time dateTime="2022-01-14">
                                January 14, 2022
                              </time>
                            </Typography>
                          </CardContent>
                          <CardActions>
                            <Link to="/register">
                              <Button size="small" color="primary">
                                Read More
                              </Button>
                            </Link>
                          </CardActions>
                        </Card>
                      </Grid>
                    </Grid>
                  </Container>
                </section>
              </div>
            </div>
          </Container>
        </section>
        <hr />
        <div className="hero-banner">
          <video autoPlay loop muted playsInline className="video-background">
            <source src="../../images/background-video.mp4" type="video/mp4" />
            <p>Video playback is not supported by your browser.</p>
          </video>
        </div>
        <div className="section featured-car" id="featured-car">
          <div className="container">
            <Typography
              variant="h2"
              sx={{ marginTop: "50px", marginBottom: "2rem" }}
            >
              Featured Cars
            </Typography>
            <form className="hero-form">
              <div className="input-wrapper">
                <label htmlFor="transmission-type" className="input-label">
                  Transmission
                </label>
                <select
                  name="transmission"
                  id="transmission-type"
                  className="input-field"
                  value={formData.transmission}
                  onChange={handleInputChange}
                >
                  <option value="">Select Transmission</option>
                  <option value="Manual">Manual</option>
                  <option value="Automatic">Automatic</option>
                </select>
              </div>

              <div className="input-wrapper">
                <label htmlFor="model" className="input-label">
                  Model
                </label>
                <input
                  type="text"
                  name="model"
                  id="model"
                  className="input-field"
                  placeholder="Put a Car Model"
                  value={formData.model}
                  onChange={handleInputChange}
                />
              </div>
              <div className="input-wrapper">
                <label htmlFor="brand" className="input-label">
                  Brand
                </label>
                <input
                  type="text"
                  name="brand"
                  id="brand"
                  className="input-field"
                  placeholder="Put a Car Brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                />
              </div>
              <div className="input-wrapper">
                <label htmlFor="price" className="input-label">
                  Maximum Price
                </label>
                <input
                  type="number"
                  name="pricePerDay"
                  id="price"
                  className="input-field"
                  placeholder="Put a Car Price"
                  value={formData.pricePerDay}
                  onChange={handleInputChange}
                />
              </div>
              <div className="input-wrapper">
                <label htmlFor="year" className="input-label">
                  Make Year
                </label>
                <input
                  type="number"
                  name="year"
                  id="year"
                  className="input-field"
                  placeholder="Put a Car year"
                  value={formData.year}
                  onChange={handleInputChange}
                />
              </div>
              <div className="input-wrapper">
                <label htmlFor="rating" className="input-label">
                  Rating
                  <div className="rating-wrapper">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`star ${rating >= star ? "filled" : ""}`}
                        onClick={() => handleRatingChange(star)}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </label>
              </div>
            </form>
            <div className="title-wrapper">
              <h2 className="h2 section-title">Car Rentals</h2>
              <Link to="/admin/create-car" className="btn btn-success">
                <span>+ Create New Rental Car</span>
              </Link>
            </div>
            <div>
              {isLoading && currentPage === 1 ? ( // Show loading spinner only when fetching the first 10 cars
                <p>Loading cars...</p>
              ) : null}
            </div>
            <ul className="featured-car-list">
              {Array.isArray(cars) && cars.length > 0 ? (
                cars.map((car, index) => (
                  <li key={index}>
                    <div className="featured-car-card">
                      <button
                        className={`favorite-btn ${
                          isFavorite(car._id) ? "text-danger" : ""
                        }`}
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
                            <Link to={`/car/info/${car._id}`}>
                              {`${car.model} ${car.brand}`}
                            </Link>
                          </h3>
                          <data className="year" value={car.year}>
                            {car.year}
                          </data>
                        </div>

                        <ul className="card-list">
                          <li className="card-list-item">
                            <ion-icon name="people-outline"></ion-icon>
                            <span className="card-item-text">
                              Capacity: {car.seatCapacity} Seats
                            </span>
                          </li>
                          <li className="card-list-item">
                            <ion-icon name="car-outline"></ion-icon>
                            <span className="card-item-text">
                              Type: {car.vehicleType}
                            </span>
                          </li>
                          <li className="card-list-item">
                            <ion-icon name="flash-outline"></ion-icon>
                            <span className="card-item-text">
                              Fuel: {car.fuel}
                            </span>
                          </li>
                          <li className="card-list-item">
                            <ion-icon name="speedometer-outline"></ion-icon>
                            <span className="card-item-text">
                              Mileage: {car.mileage} km / L
                            </span>
                          </li>
                          <li className="card-list-item">
                            <ion-icon name="hardware-chip-outline"></ion-icon>
                            <span className="card-item-text">
                              Transmission: {car.transmission}
                            </span>
                          </li>
                          <li className="card-list-item">
                            <ion-icon name="construct-outline"></ion-icon>
                            <span className="card-item-text">
                              Displacement: {car.displacement}cc
                            </span>
                          </li>
                        </ul>

                        <p className="card-description">
                          Description: {car.description}
                        </p>
                        <p className="card-terms">
                          Terms and Conditions: {car.termsAndConditions}
                        </p>
                        <p className="card-location">
                          Pick-up Location: {car.pickUpLocation}
                        </p>

                        <div className="card-price-wrapper">
                          <p className="card-price">
                            <strong>₱{car.pricePerDay} / day</strong>
                          </p>
                          <button
                            className="btn fav-btn"
                            aria-label="Add to favourite list"
                          >
                            <ion-icon name="heart-outline"></ion-icon>
                          </button>
                        </div>
                        {car.isAutoApproved && (
                          <span className="badge badge-success">
                            Auto Approved
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <p>No cars available</p> // Show this if there are no cars initially
              )}
            </ul>
            <div className="d-flex align-items-center justify-content-center py-3">
              {isLoading && (
                <div className="loading-indicator">
                  <CircularProgress size={150} />
                </div>
              )}
            </div>

            {(currentPage === totalPages || !hasMore) && !isLoading && (
              <Typography
                variant="h5"
                sx={{ color: "blue" }}
                className="text-center py-3"
              >
                No More Featured Cars To Load
              </Typography>
            )}
          </div>
          <footer className="footer">
            <div className="container">
              <div className="footer-top">
                <div className="footer-brand">
                  <a href="#" className="logo">
                    <img src="../../images/logo.png" alt="BMW" className="w-25" />
                  </a>

                  <p className="footer-text">
                    Search for cheap rental cars in the Philippines. With a
                    diverse fleet of many vehicles, with an attractive and fun
                    selection.
                  </p>
                </div>

                <ul className="footer-list"></ul>
              </div>

              <div className="footer-bottom">
                <ul className="social-list">
                  <li>
                    <a href="#" className="social-link">
                      <ion-icon name="logo-facebook"></ion-icon>
                    </a>
                  </li>

                  <li>
                    <a href="#" className="social-link">
                      <ion-icon name="logo-instagram"></ion-icon>
                    </a>
                  </li>

                  <li>
                    <a href="#" className="social-link">
                      <ion-icon name="logo-twitter"></ion-icon>
                    </a>
                  </li>

                  <li>
                    <a href="#" className="social-link">
                      <ion-icon name="logo-linkedin"></ion-icon>
                    </a>
                  </li>

                  <li>
                    <a href="#" className="social-link">
                      <ion-icon name="logo-skype"></ion-icon>
                    </a>
                  </li>

                  <li>
                    <a href="#" className="social-link">
                      <ion-icon name="mail-outline"></ion-icon>
                    </a>
                  </li>
                </ul>

                <p className="copyright">
                  &copy; 2024 <a href="#">Daniel and Jana</a>. All Rights
                  Reserved
                </p>
              </div>
            </div>
          </footer>
        </div>
      </main>
    </>
  );
};

export default Home;
