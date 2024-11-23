import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  Avatar,
  Grid,
  Paper,
  TextField,
  Button,
} from "@mui/material";
import { authenticate, errMsg, getToken, getUser, succesMsg } from "../../utils/helper";
import LoadingSpinner from "../layout/LoadingSpinner";
import _ from "lodash";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [userData, setUserData] = useState({});
  const [originalUserData, setOriginalUserData] = useState({});
  const [loading, setLoading] = useState(false);
  const [disableUpdateBtn, setDisableUpdateBtn] = useState(true);
  const [newAvatar, setNewAvatar] = useState(null)

  let navigate = useNavigate()

  const handleInputFieldChange = ({ currentTarget: input }) => {
    const updatedUserData = { ...userData, [input.name]: input.value };
    setUserData(updatedUserData);
    setDisableUpdateBtn(_.isEqual(updatedUserData, originalUserData));
  };

  const handleAvatarClick = () => {
    document.getElementById("avatarUpload").click();
  };

  const fetchUserData = async () => {
    setLoading(true);

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      const url = `http://localhost:4000/api/v1/getUserInfo`;
      const { data: response } = await axios.post(
        url,
        { uid: getUser().uid },
        config
      );

      if (response.user) {
        setUserData(response.user);
        let currentAccountLoggedIn = {
            user: response.user,
            token: getToken()
        }
        authenticate(currentAccountLoggedIn, ()=>{})
        setOriginalUserData(response.user);
      }
    } catch (error) {
      errMsg("Error: " + error.message);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUserData({ ...userData, avatar: { url: e.target.result } });
        setNewAvatar(file);
      };
      reader.readAsDataURL(file);
      setDisableUpdateBtn(false)
    }
  };

  const handleSubmit = async (e)=> {
    e.preventDefault();
    setLoading(true)
    try {
        const formData = new FormData();
        for (const key in userData) {
            if (key=="avatar") {
                continue;
            }
            formData.append(key, userData[key]);
        }
        if (newAvatar) {
            formData.append('avatar', newAvatar);
        }
        const config = {
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'multipart/form-data'
            }
        };

        const response = await axios.put(`${import.meta.env.VITE_API}/update-profile/${getUser()._id}`, formData, config)
        setOriginalUserData(userData)
        setDisableUpdateBtn(true)
        console.log(response)
        succesMsg("User information updated successfully!")
        
        fetchUserData()

    } catch(error) {
        errMsg("Error: " + error.message)
        console.log(error)
    } finally {
        setLoading(false)
    }
  }
  useEffect(() => {
    fetchUserData();

  }, []);

  return (
    <>
      {loading ? (
        <LoadingSpinner message="Fetching your data" />
      ) : (
        <div className="container py-3 min-height-100vh d-flex align-items-center justify-content-center flex-column">
          <h1>Profile</h1>
          {!userData && (
            <Container maxWidth="sm">
              <Typography variant="h6" color="error">
                Failed to load user data.
              </Typography>
            </Container>
          )}
          {
            <Container maxWidth="sm">
              <Paper style={{ padding: "16px", marginTop: "16px" }}>
                <Grid container direction="column" alignItems="center">
                  <Avatar
                    alt={userData.firstName}
                    src={
                      userData.avatar?.url ||
                      "./src/assets/images/default-image.jpg"
                    }
                    style={{
                      width: "80px",
                      height: "80px",
                      marginBottom: "16px",
                    }}
                    sx={{
                        backgroundColor: "primary.main",
                        ":hover": {
                          opacity: "0.7",
                          cursor: "pointer"
                        }
                      }}
                    onClick={handleAvatarClick}
                  />
                    <input
                    id="avatarUpload"
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleAvatarChange}
                    className="d-none"
                  />
                  <TextField
                    label="First Name"
                    name="firstName"
                    value={userData.firstName}
                    onChange={handleInputFieldChange}
                    fullWidth
                    style={{ marginBottom: "16px" }}
                  />
                  <TextField
                    label="Last Name"
                    name="lastName"
                    value={userData.lastName}
                    onChange={handleInputFieldChange}
                    fullWidth
                    style={{ marginBottom: "16px" }}
                  />
                  <TextField
                    label="Role"
                    value={userData.role}
                    InputProps={{
                      readOnly: true,
                    }}
                    fullWidth
                    style={{ marginBottom: "16px" }}
                  />
                  <TextField
                    label="Account Created"
                    value={new Date(userData.createdAt).toLocaleDateString()}
                    InputProps={{
                      readOnly: true,
                    }}
                    fullWidth
                  />
                </Grid>
                <Grid
                  container
                  justifyContent="center"
                >
                  <Button
                    disabled={disableUpdateBtn}
                    variant="contained"
                    sx={{
                      backgroundColor: disableUpdateBtn
                        ? "grey"
                        : "primary.main",
                      ":hover": {
                        backgroundColor: disableUpdateBtn
                          ? "grey"
                          : "primary.dark",
                      },
                    }}
                    className="my-3"
                    onClick={handleSubmit}
                  >
                    Update
                  </Button>
                </Grid>
              </Paper>
            </Container>
          }
        </div>
      )}
    </>
  );
};

export default Profile;
