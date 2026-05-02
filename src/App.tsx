import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Chatbot from './components/Chatbot';
import HomePage from './pages/Home';
import PropertiesPage from './pages/Properties';
import PropertyDetailPage from './pages/PropertyDetail';
import BookingsPage from './pages/Bookings';
import AgentDashboard from './pages/AgentDashboard';
import { seedDatabase } from './lib/seed';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/properties" element={<PropertiesPage />} />
          <Route path="/properties/:id" element={<PropertyDetailPage />} />
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="/admin" element={<AgentDashboard />} />
        </Routes>
        <Chatbot />
      </Layout>
    </Router>
  );
}
