import {Routes, Route } from 'react-router-dom'
import Register from './components/Register/index'
import Login from './components/login/index'
import Header from './components/layout/Header'
import Home from './components/Home'
import './App.css'

function App() {

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" exact element={<Home />}/>
        <Route path="/register" exact element={<Register />}/> 
        <Route path="/login" exact element={<Login />}/> 
      </Routes>
    </>
  )
}

export default App
