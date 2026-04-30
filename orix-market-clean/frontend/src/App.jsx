import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider }  from './context/AuthContext'
import { CartProvider }  from './context/CartContext'
import { SocketProvider } from './context/SocketContext'
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute'
import Navbar          from './components/Navbar'
import Footer          from './components/Footer'
import HomePage        from './pages/HomePage'
import ProductsPage    from './pages/ProductsPage'
import CartPage        from './pages/CartPage'
import CheckoutPage    from './pages/CheckoutPage'
import OrdersPage      from './pages/OrdersPage'
import LoginPage       from './pages/LoginPage'
import RegisterPage    from './pages/RegisterPage'
import AdminDashboard  from './pages/AdminDashboard'
import AnalyticsPage   from './pages/AnalyticsPage'
import ProfilePage     from './pages/ProfilePage'
import PaymentPage     from './pages/PaymentPage'

const BARE_ROUTES = ['/login', '/register', '/admin']

function Layout({ children }) {
  const isBare = BARE_ROUTES.some(r => window.location.pathname.startsWith(r))
  return isBare ? children : (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <SocketProvider>
          <Layout>
            <Routes>
              {/* Public */}
              <Route path="/"         element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/cart"     element={<CartPage />} />
              <Route path="/login"    element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected */}
              <Route path="/checkout"          element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
              <Route path="/orders"            element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
              <Route path="/payment/:orderId"  element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
              <Route path="/profile"           element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

              {/* Admin */}
              <Route path="/admin"            element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/admin/*"          element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/admin/analytics"  element={<AdminRoute><AnalyticsPage /></AdminRoute>} />

              {/* 404 */}
              <Route path="*" element={
                <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
                  <span className="text-6xl">🔍</span>
                  <h1 className="text-2xl font-bold text-gray-800">Sahifa topilmadi</h1>
                  <p className="text-gray-500">Siz qidirayotgan sahifa mavjud emas</p>
                  <a href="/" className="btn-primary mt-2">Bosh sahifaga qaytish</a>
                </div>
              }/>
            </Routes>
          </Layout>

          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 2500,
              style: { borderRadius: '12px', fontSize: '14px' },
            }}
          />
        </SocketProvider>
      </CartProvider>
    </AuthProvider>
  )
}
