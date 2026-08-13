import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'

import Home from './pages/Home'
import About from './pages/About'
import Academics from './pages/Academics'
import Admissions from './pages/Admissions'
import Gallery from './pages/Gallery'
import Events from './pages/Events'
import News from './pages/News'
import NewsDetail from './pages/NewsDetail'
import Contact from './pages/Contact'
import Login from './pages/Login'
import NotFound from './pages/NotFound'

import AdminDashboard from './pages/portal/AdminDashboard'
import TeacherDashboard from './pages/portal/TeacherDashboard'
import StudentDashboard from './pages/portal/StudentDashboard'
import ParentDashboard from './pages/portal/ParentDashboard'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/academics" element={<Academics />} />
              <Route path="/admissions" element={<Admissions />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/events" element={<Events />} />
              <Route path="/news" element={<News />} />
              <Route path="/news/:slug" element={<NewsDetail />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />

              <Route path="/portal/admin" element={
                <ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>
              } />
              <Route path="/portal/teacher" element={
                <ProtectedRoute allowedRoles={['teacher']}><TeacherDashboard /></ProtectedRoute>
              } />
              <Route path="/portal/student" element={
                <ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>
              } />
              <Route path="/portal/parent" element={
                <ProtectedRoute allowedRoles={['parent']}><ParentDashboard /></ProtectedRoute>
              } />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}
