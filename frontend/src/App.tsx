import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import { AuthProvider, useAuth } from './context/AuthContext'
import { DataProvider } from './context/DataContext'
import { ThemeProvider } from './context/ThemeContext'
import AuthPage from './pages/AuthPage'
import Boards from './pages/Boards'
import CalendarPage from './pages/CalendarPage'
import Dashboard from './pages/Dashboard'
import Notes from './pages/Notes'
import Settings from './pages/Settings'
import Tasks from './pages/Tasks'

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#eef0f8] dark:bg-[#0c0d16]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
      </div>
    )
  }

  if (!user) {
    return <AuthPage />
  }

  return (
    <DataProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/boards" element={<Boards />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </DataProvider>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
