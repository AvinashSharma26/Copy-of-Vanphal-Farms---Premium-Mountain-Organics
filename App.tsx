
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { TicketProvider } from './context/TicketContext';
import { DataProvider } from './context/DataContext';
import { Layout } from './components/Layout';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Story from './pages/Story';
import Cart from './pages/Cart';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import Contact from './pages/Contact';
import Checkout from './pages/Checkout';
import Success from './pages/Success';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <TicketProvider>
        <DataProvider>
          <CartProvider>
            <HashRouter>
              <Layout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/story" element={<Story />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/dashboard" element={<UserDashboard />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/success" element={<Success />} />
                </Routes>
              </Layout>
            </HashRouter>
          </CartProvider>
        </DataProvider>
      </TicketProvider>
    </AuthProvider>
  );
};

export default App;
