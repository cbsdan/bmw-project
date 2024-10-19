import {Routes, Route } from 'react-router-dom'
import Register from './components/Register/index'
import Login from './components/login/index'
import Header from './components/layout/Header'
import Home from './components/Home'
import DiscountList from './components/admin/Discount/DiscountList'
import Dashboard from './components/admin/Dashboard'
import NotFound404 from './components/NotFound404'
import NewDiscount from './components/admin/Discount/NewDiscount'
import UpdateDiscount from './components/admin/Discount/UpdateDiscount'

function App() {

  const AdminRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/discounts" element={<DiscountList />} />
            <Route path="/new-discount" element={<NewDiscount />} />
            <Route path="/update-discount/:id" element={<UpdateDiscount />} />
        </Routes>
    );
};

  return (
    <>
      <Header />
      <Routes>
        <Route path="/admin/*" element={<AdminRoutes />}/>
        <Route path="/" exact element={<Home />}/>
        <Route path="/register" exact element={<Register />}/> 
        <Route path="/login" exact element={<Login />}/> 
        <Route path="*" element={<NotFound404 />} />
      </Routes>
    </>
  )
}

export default App
