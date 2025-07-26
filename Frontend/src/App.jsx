import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AuthContext from './context/AuthContext';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import OtpVerification from './pages/auth/OtpVerification';
import OAuthSuccess from './pages/auth/OAuthSuccess';
import Home from './pages/Home';
import CreateTrip from './pages/CreateTrip';
import MyTrips from './pages/MyTrips';
import Profile from './pages/Profile'; 
import DestinationDetail from './pages/DestinationDetail';
import WeatherDetails from './pages/WeatherDetails';
import AdminDashboard from './pages/AdminDashboard';
import CreateBlog from './pages/CreateBlog'; 
import BlogPostDetail from './pages/BlogPostDetail'; 
import EditBlog from './pages/EditBlog';
import GroupTrips from './pages/GroupTrips';
import CheckList from './pages/CheckList'; // Import CheckList
import MyBlogs from './pages/MyBlogs';
import './styles/global.css';
import './styles/buttons.css'; // Import global button styles

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/signup" element={<Signup />} />
          <Route path="/auth/verify-otp" element={<OtpVerification />} />
          <Route path="/oauth-success" element={<OAuthSuccess />} />
          <Route path="/" element={<Home />} />
          <Route path="/destination/:id" element={<DestinationDetail />} />
          <Route path="/my-blogs" element={<RequireAuth><MyBlogs /></RequireAuth>} />
          
          <Route 
            path="/create-blog" 
            element={
              <RequireAuth>
                <CreateBlog />
              </RequireAuth>
            } 
          />
          <Route path="/blog/:id" element={<BlogPostDetail />} /> {/* Public access */}
          <Route path="/blog/edit/:id" element={<RequireAuth><EditBlog /></RequireAuth>} />

          <Route 
            path="/weather-details/:tripId" 
            element={
              <RequireAuth>
                <WeatherDetails />
              </RequireAuth>
            } 
          />
          <Route 
            path="/create-trip" 
            element={
              <RequireAuth>
                <CreateTrip />
              </RequireAuth>
            } 
          />
          <Route 
            path="/my-trips" 
            element={
              <RequireAuth>
                <MyTrips />
              </RequireAuth>
            } 
          />
          
          <Route 
            path="/group-trips" 
            element={
              <RequireAuth>
                <GroupTrips />
              </RequireAuth>
            } 
          />
          
          <Route 
            path="/profile" 
            element={
              <RequireAuth>
                <Profile />
              </RequireAuth>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <RequireAuth adminOnly={true}>
                <AdminDashboard />
              </RequireAuth>
            } 
          />
          <Route
            path="/checklist/:tripId"
            element={
              <RequireAuth>
                <CheckList />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

// Component to handle protected routes
function RequireAuth({ children, adminOnly = false }) {
  const { currentUser } = useContext(AuthContext);
  
  console.log("🔐 RequireAuth: Checking authentication state...");
  console.log("🔐 Current user from context:", currentUser ? "✅ User present" : "❌ No user");
  
  let user = currentUser;
  
  // Check localStorage as a fallback if no user in context
  if (!user) {
    const savedUser = localStorage.getItem('currentUser');
    const savedToken = localStorage.getItem('token');
    
    console.log("🔍 RequireAuth: Checking localStorage fallback...");
    console.log("💾 Saved user in localStorage:", savedUser ? "✅ Found" : "❌ Not found");
    console.log("💾 Saved token in localStorage:", savedToken ? "✅ Found" : "❌ Not found");
    
    if (savedUser) {
      try {
        user = JSON.parse(savedUser);
        console.log("👤 localStorage user data:", JSON.stringify(user, null, 2));
      } catch (e) {
        console.error("❌ Error parsing saved user data:", e);
        return <Navigate to="/auth/login" replace />;
      }
    } else {
      console.log("❌ RequireAuth: No user data found, redirecting to login");
      return <Navigate to="/auth/login" replace />;
    }
  }
  
  // Check if the route requires admin role
  if (adminOnly && user.role !== 'ADMIN') {
    console.log("🚫 RequireAuth: Admin route accessed by non-admin user, redirecting to home");
    return <Navigate to="/" replace />;
  }
  
  console.log("✅ RequireAuth: User authenticated, allowing access");
  return children;
}

export default App;