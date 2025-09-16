import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { io } from 'socket.io-client';
import OnlineUsers from '../components/OnlineUsers';
import TopGroups from '../components/TopGroups';

function HomePage() {

  const [user, setUser] = useState(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        
        // Reconnect to socket.io when page reload
        const socket = io(`${backendUrl}`);
        socket.on("connect", () => {
          socket.emit("userConnected", parsedUser._id);
        });

        return () => socket.close();
    }
  }, []);

  return (
    <div className='flex flex-row max-w-screen justify-around gap-16 p-4'>
        <OnlineUsers />        
        <TopGroups />    
    </div>
  )
}

export default HomePage