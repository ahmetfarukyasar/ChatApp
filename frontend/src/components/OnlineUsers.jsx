import axios from 'axios';
import defaultPicture from '/user-icon.png'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';

function OnlineUsers() {
      const [users, setUsers] = useState([]);
      const [socket, setSocket] = useState(null);
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      // Fetching users and update user status
      useEffect(() => {
        const newSocket = io("http://localhost:5000");
        setSocket(newSocket);

        const fetchUsers = async () => {
          try {
            const response = await axios.get(`${backendUrl}/users`);
            console.log("Fetched users:", response.data);
            setUsers(response.data);
          } catch (error) {
            console.error("Error fetching users:", error);
          }
        };

        fetchUsers();

        newSocket.on("userStatusChanged", ({ userId, isOnline }) => {
            console.log("Status update received:", userId, isOnline);
            setUsers(prevUsers =>
                prevUsers.map(user =>
                    user._id === userId ? { ...user, isOnline } : user
                )
            );
        });

        return () => newSocket.close();
      }, []);

  return (
    <div className='bg-[#C5C3C6] p-4 pt-2'>
        <h1 className='p-2 text-xl text-center'>Users</h1>
        <hr /><br />
        <div className='grid grid-cols-2 gap-2 w-150 '>
            
            {
                users.map((user) => (
                    <Link key={user._id} to={`/chat/${user._id}`}>
                        <div className='flex flex-row items-center gap-4 justify-between bg-[#DCDCDD] p-2'>
                            <img src={defaultPicture} width={32} />
                            <h1>{user.username}</h1>
                            {user.isOnline == true ? <p className='text-xs text-green-600'>Online</p> : <p className='text-xs text-red-600'>Offline</p>}
                        </div>
                    </Link>
                ))
            }
        </div>
    </div>
  )
}

export default OnlineUsers