import React from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client';
import anonim from '/anonim.png'

function RootLayout() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleLogout = async () => {
    if (user) {
      // Socket.io bağlantısı oluştur ve çıkış sinyali gönder
      const socket = io(`${backendUrl}`);
      socket.emit("userDisconnected", user._id);
      
      // Socket bağlantısını kapat
      socket.close();
    }
    
    localStorage.clear();
    navigate('/auth');
  }

  return (
    <div>
      {user && (
        <nav className="bg-[#4C5C68] p-4 flex justify-between items-center">
          <div className='flex flex-row gap-4'>
            <img src={anonim} width={32}/>
            <h1 className="text-white">Welcome, {user.username}</h1>
          </div>
          <div className='flex flex-row gap-4'>
            <button 
              onClick={() => navigate('/')}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 cursor-pointer"
            >
              Home
            </button>
            <button 
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 cursor-pointer"
            >
              Logout
            </button>
          </div>
        </nav>
      )}
      <Outlet />
    </div>
  )
}

export default RootLayout