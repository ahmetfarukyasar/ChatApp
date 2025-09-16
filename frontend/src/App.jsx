import React from 'react'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
import RootLayout from './layouts/RootLayout'
import AuthPage from './pages/AuthPage'
import HomePage from './pages/HomePage'
import ChatPage from './pages/ChatPage'
import ProtectedRoute from './Routes/ProtectedRoute'
import AuthRoute from './Routes/AuthRoute'
import GroupChatPage from './pages/GroupChatPage'

function App() {
  
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path='/' element={<RootLayout />}>
        <Route index element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }/>
        <Route path='chat/group/:id' element={
          <ProtectedRoute>
            <GroupChatPage />
          </ProtectedRoute>
          }/>
        <Route path='chat/:id' element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
          }/>
        <Route path='auth' element={
          <AuthRoute>
            <AuthPage />
          </AuthRoute>
          }/>
      </Route>
    )
  )

  return (
    <RouterProvider router={router}/>
  )
}

export default App