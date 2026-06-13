import { Routes, Route } from 'react-router'
import { Toaster } from '@/components/ui/sonner'

import LandingPage from '@/pages/LandingPage'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Dashboard from '@/pages/Dashboard'
import MyDrive from '@/pages/MyDrive'
import SharedFiles from '@/pages/SharedFiles'
import RecentFiles from '@/pages/RecentFiles'
import Favorites from '@/pages/Favorites'
import Trash from '@/pages/Trash'
import Settings from '@/pages/Settings'
import Profile from '@/pages/Profile'

import AuthLayout from '@/layouts/AuthLayout'
import DashboardLayout from '@/layouts/DashboardLayout'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
        
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/drive" element={<MyDrive />} />
          <Route path="/shared" element={<SharedFiles />} />
          <Route path="/recent" element={<RecentFiles />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/trash" element={<Trash />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
      <Toaster />
    </>
  )
}

export default App
