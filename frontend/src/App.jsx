import {Routes, Route } from 'react-router-dom'
import Register from '../components/Register/index'
import Login from '../components/login/index'

function App() {

  return (
    <>
      <h1 style={{"text-align": "center"}}>Welcome to BMW</h1>
      <Routes>
        <Route path="/register" exact element={<Register />}/> 
        <Route path="/login" exact element={<Login />}/> 
      </Routes>
    </>
  )
}

export default App
