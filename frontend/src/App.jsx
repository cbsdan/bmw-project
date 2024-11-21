import {Routes, Route } from 'react-router-dom'
import { Navigate } from 'react-router-dom'
import Register from './components/Register/index'
import Login from './components/login/index'
import Header from './components/layout/Header'
import Home from './components/Home'
import NotFound404 from './components/NotFound404'
import Dashboard from './components/admin/Dashboard'
import DiscountList from './components/admin/Discount/DiscountList'
import NewDiscount from './components/admin/Discount/NewDiscount'
import UpdateDiscount from './components/admin/Discount/UpdateDiscount'
import CreateCar from './components/admin/Car/CreateCar'
import UpdateCar from './components/admin/Car/UpdateCar'
import CarList from './components/admin/Car/CarList'
import {isAdmin, isAuthenticated} from './utils/helper'
import UserList from './components/admin/User/UserList'
import FavoriteCars from './components/user/FavoriteCars'
import Car from './components/cars/Car'
import RentalList from './components/admin/Rental/RentalList'
import MyRentals from './components/user/MyRentals'

function App() {

  const AdminRoutes = () => {
    if (!isAdmin()) {
      return <Navigate to="/" />
    }
    
    return (
        <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />

            <Route path="/all-users" element={<UserList />} />

            <Route path="/discounts" element={<DiscountList />} />
            <Route path="/new-discount" element={<NewDiscount />} />
            <Route path="/update-discount/:id" element={<UpdateDiscount />} />
            
            <Route path="/cars" element={<CarList />} />
            <Route path="/create-car" element={<CreateCar />} />
            <Route path="/update-car/:id" element={<UpdateCar />} />

            <Route path="/rentals" element={<RentalList />} />
        </Routes>
    );
  };

  const UserRoute = () => {
    if (!isAuthenticated()) {
      return <Navigate to="/" />
    }

    return (
      <Routes>
        <Route path="/favorite-cars" element={<FavoriteCars />} />
        <Route path="/my-rentals" element={<MyRentals />} />
      </Routes>
    )
  }

  const CarRoutes = () => {
    return (
      <Routes>
        <Route path="/info/:id" element={<Car />} />
      </Routes>
    )
  }
  return (
    <>
      <Header />
      <Routes>
        <Route path="/admin/*" element={<AdminRoutes />}/>
        <Route path="/car/*" element={<CarRoutes />}/>
        <Route path="/*" element={<UserRoute />}/>
        <Route path="/" exact element={<Home />}/>
        <Route path="/register" exact element={<Register />}/> 
        <Route path="/login" exact element={<Login />}/> 
        <Route path="*" element={<NotFound404 />} />
      </Routes>
    </>
  )
}

export default App
