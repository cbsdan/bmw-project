import React, { useEffect, useState } from "react";
import axios from "axios";
import { Carousel, Card, Button, Form, Modal } from "react-bootstrap";
import LoadingSpinner from "../layout/LoadingSpinner";
import { getUser, getToken, succesMsg, errMsg } from "../../utils/helper";
import Alert from "../layout/Alert";
import { Link } from "react-router-dom";

const MyCars = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [show, setShow] = useState(false);
  const [modalTitle, setModalTitle] = useState("Add Car")
  const [oldImages, setOldImages] = useState([])

  const [newCar, setNewCar] = useState({
    _id: "",
    brand: "",
    model: "",
    year: "",
    pricePerDay: "",
    vehicleType: "",
    seatCapacity: "",
    transmission: "",
    fuel: "",
    images: [],
    isAutoApproved: false,
    isActive: true,
    owner: getUser()._id,
  });

  const handleShow = () => setShow(true);
  const handleClose = () => setShow(false);

  const handleNewCarChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "images") {
      setNewCar({
        ...newCar,
        [name]: files,
      });
    } else {
      setNewCar({
        ...newCar,
        [name]: value,
      });
    }
  };

  const handleNewCarSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(newCar).forEach((key) => {
      if (key === "images" && newCar[key]) {
        Array.from(newCar[key]).forEach((file) => {
          formData.append("images", file);
        });
      } else {
        formData.append(key, newCar[key]);
      }
    });

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "multipart/form-data",
        },
      };

      await axios.post(
        `${import.meta.env.VITE_API}/CreateCar`,
        formData,
        config
      );
      succesMsg("Successfully added your car!");
      setShow(false);
      fetchUserCars();
    } catch (error) {
      console.log(error);
      setError("Failed to add car. Please try again.");
    }
  };

  const fetchCarData = async (carId) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API}/Cars/${carId}`
      );
      return response.data.car;
    } catch (err) {
      setError("Failed to fetch car data. Please try again.");
      console.log("error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserCars = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      };

      const response = await axios.get(
        `${import.meta.env.VITE_API}/my-cars/${getUser()._id}`,
        config
      );
      console.log(response.data?.cars);
      setCars(response.data?.cars);
    } catch (error) {
      console.log(error);
      setError(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleEditClick = async (carId) => {
      setModalTitle("Edit Car")
      try {
          const data = await fetchCarData(carId)
          console.log(data)
          data.owner = getUser()._id
          setOldImages(data.images)
          data.images = []
        setNewCar(data)
        setShow(true);
    }catch (error) {
        errMsg("Error", error.message)
        console.log(error)
    }
  }

  const handleUpdateCarSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    console.log(newCar)
    // Append all car data to the form data
    Object.keys(newCar).forEach((key) => {
      if (key === "images" && newCar[key]) {
        Array.from(newCar[key]).forEach((file) => {
          formData.append("images", file);
        });
      } else {
        formData.append(key, newCar[key]);
      }
    });
  
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "multipart/form-data",
        },
      };
  
      await axios.put(
        `${import.meta.env.VITE_API}/Cars/${newCar._id}`,
        formData,
        config
      );
      
      succesMsg("Successfully updated your car!");
      setShow(false);
      fetchUserCars();
    } catch (error) {
      console.log(error);
      setError("Failed to update car. Please try again.");
      errorMsg(error.message)
    }
  };

  useEffect(() => {
    fetchUserCars();
  }, []);

  return (
    <div className="container py-3">
        {error ? (<Alert message={error} type="error" />) : (<></>) }
        <h1>My Cars</h1>
        <hr />
      <Button variant="primary" onClick={handleShow}>
        Add Car
      </Button>

      {loading ? (
        <LoadingSpinner message="Loading your cars..." />
      ) : cars.length !== 0 ? (
        <div className="row mt-3">
          {cars.map((car) => (
            <div key={car._id} className="col-md-4 mb-3">
              <Card>
                <Carousel>
                  {car.images.length > 0 ? (
                    car.images.map((image, index) => (
                      <Carousel.Item key={index}>
                        <Card.Img
                          variant="top"
                          src={image || "./src/assets/images/default-image.jpg"}
                          alt={`${car.brand} ${car.model}`}
                          className="fixed-height-image"
                        />
                      </Carousel.Item>
                    ))
                  ) : (
                    <Carousel.Item>
                      <Card.Img
                        variant="top"
                        src="./src/assets/images/default-image.jpg"
                        alt={`${car.brand} ${car.model}`}
                        className="fixed-height-image"
                      />
                    </Carousel.Item>
                  )}
                </Carousel>
                <Card.Body>
                  <Card.Title>
                    {car.brand} {car.model} ({car.year})
                  </Card.Title>
                  <Card.Text>
                    <strong>Price Per Day:</strong> ${car.pricePerDay}
                    <br />
                    <strong>Vehicle Type:</strong> {car.vehicleType}
                    <br />
                    <strong>Seat Capacity:</strong> {car.seatCapacity} seats
                    <br />
                    <strong>Transmission:</strong> {car.transmission}
                    <br />
                    <strong>Fuel:</strong> {car.fuel}
                    <br />
                    <strong>Availability:</strong> {car.isActive ? "Active" : "Not Active"}
                  </Card.Text>
                  <Button
                    variant="primary"
                    onClick={() => navigate(`/car/${car._id}`)}
                  >
                    <Link to={`/car/info/${car._id}`} className="text-white">
                        View Details
                    </Link>
                  </Button>
                  <Button
                    className="btn-success"
                    onClick={() => handleEditClick(car._id)}
                  >
                    Edit Details
                  </Button>
                </Card.Body>
              </Card>
            </div>
          ))}
        </div>
      ) : (
        <>
          <h2>You have no cars added.</h2>
        </>
      )}
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{modalTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={modalTitle == "Add Car" ? handleNewCarSubmit : handleUpdateCarSubmit}>
            <Form.Group controlId="formBrand">
              <Form.Label>Brand</Form.Label>
              <Form.Control
                type="text"
                name="brand"
                value={newCar.brand}
                onChange={handleNewCarChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="formModel">
              <Form.Label>Model</Form.Label>
              <Form.Control
                type="text"
                name="model"
                value={newCar.model}
                onChange={handleNewCarChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="formYear">
              <Form.Label>Year</Form.Label>
              <Form.Control
                type="number"
                name="year"
                value={newCar.year}
                onChange={handleNewCarChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="formPricePerDay">
              <Form.Label>Price Per Day</Form.Label>
              <Form.Control
                type="number"
                name="pricePerDay"
                value={newCar.pricePerDay}
                onChange={handleNewCarChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="formVehicleType">
              <Form.Label>Vehicle Type</Form.Label>
              <Form.Control
                as="select"
                name="vehicleType"
                value={newCar.vehicleType}
                onChange={handleNewCarChange}
                required
              >
                <option value="">Select Vehicle Type</option>
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="Sport Car">Sport Car</option>
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="formSeatCapacity">
              <Form.Label>Seat Capacity</Form.Label>
              <Form.Control
                type="number"
                name="seatCapacity"
                value={newCar.seatCapacity}
                onChange={handleNewCarChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="formTransmission">
              <Form.Label>Transmission</Form.Label>
              <Form.Control
                as="select"
                name="transmission"
                value={newCar.transmission}
                onChange={handleNewCarChange}
                required
              >
                <option value="">Select Transmission</option>
                <option value="Manual">Manual</option>
                <option value="Automatic">Automatic</option>
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="formFuel">
              <Form.Label>Fuel</Form.Label>
              <Form.Control
                as="select"
                name="fuel"
                value={newCar.fuel}
                onChange={handleNewCarChange}
                required
              >
                <option value="">Select Fuel</option>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Electric">Electric</option>
                <option value="Plugin Hybrid">Plugin Hybrid</option>
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="formIsActive">
              <Form.Label>Availability</Form.Label>
              <Form.Control
                as="select"
                name="isActive"
                value={newCar.isActive}
                onChange={handleNewCarChange}
                required
              >
                <option value="true">Active</option>
                <option value="false">Not Active</option>
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="formIsAutoApproved">
              <Form.Label>Auto Approve</Form.Label>
              <Form.Control
                as="select"
                name="isAutoApproved"
                value={newCar.isAutoApproved}
                onChange={handleNewCarChange}
                required
              >
                <option value="true">On</option>
                <option value="false">Off</option>
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="formDisplacement">
              <Form.Label>Displacement</Form.Label>
              <Form.Control
                type="number"
                name="displacement"
                value={newCar.displacement}
                onChange={handleNewCarChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="formMileage">
              <Form.Label>Mileage</Form.Label>
              <Form.Control
                type="number"
                name="mileage"
                value={newCar.mileage}
                onChange={handleNewCarChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="formDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                name="description"
                value={newCar.description}
                onChange={handleNewCarChange}
              />
            </Form.Group>
            <Form.Group controlId="formTermsAndConditions">
              <Form.Label>Terms and Conditions</Form.Label>
              <Form.Control
                type="text"
                name="termsAndConditions"
                value={newCar.termsAndConditions}
                onChange={handleNewCarChange}
              />
            </Form.Group>
            <Form.Group controlId="formPickUpLocation">
              <Form.Label>Pickup Location</Form.Label>
              <Form.Control
                type="text"
                name="pickUpLocation"
                value={newCar.pickUpLocation}
                onChange={handleNewCarChange}
              />
            </Form.Group>
            <Form.Group controlId="formImage">
              <Form.Label>Images</Form.Label>
              <Form.Control
                type="file"
                name="images"
                multiple
                onChange={handleNewCarChange}
              />
            </Form.Group>
            
            {oldImages.map(img => (
                <img src={img.url} key={img.url} alt="Images Preview" className="mt-3 mr-2" width="100" height="100" style={{objectFit: "cover"}} />
            ))}
            <Button variant="primary" type="submit">
              Submit
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default MyCars;
