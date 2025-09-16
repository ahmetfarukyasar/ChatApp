import React from 'react'
import axios from 'axios';
import { useState } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

function Auth() {
    const navigate = useNavigate();
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    // Login
    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${backendUrl}/login`, {username, password});
            
            localStorage.clear();
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.user));
            // Connect the socket and handle connection
            const socket = io(`${backendUrl}`);
            socket.on("connect", () => {
                socket.emit("userConnected", res.data.user._id);
                setMessage("Welcome " + res.data.user.username);
                navigate('/');
            });

            // Save the socket conn to local storage
            localStorage.setItem("socketConnected", "true");
            
        } catch (err) {
            console.error("Login error:", err);
            setMessage(err.response?.data?.message || "Login failed");
        }
    }
    // Register
    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${backendUrl}/register`, {username, password, isOnline: false});
            setMessage(res.data.message);
        } catch (err) {
            setMessage("Failed.");
        }
    }

  return (
    <div className='bg-[#C5C3C6] p-16 rounded-xl'>
        <form className='flex flex-col gap-4'>
            <input
                type="text" 
                name='username'
                placeholder='Username'
                onChange={(e) => setUsername(e.target.value)}
                className='bg-[#DCDCDD] p-2 rounded-xl'
            />
            <input 
                type="password"
                name='password'
                placeholder='Password'
                onChange={(e) => setPassword(e.target.value)}
                className='bg-[#DCDCDD] p-2 rounded-xl'
            />
            <button type='submit' onClick={handleLogin} className='bg-[#4C5C68] p-2 text-white rounded-xl cursor-pointer'>Login</button>
            <button type='submit' onClick={handleRegister} className='bg-[#4C5C68] p-2 text-white rounded-xl cursor-pointer'>Register</button>
        </form>
        <p>{message}</p>
    </div>
  )
}

export default Auth