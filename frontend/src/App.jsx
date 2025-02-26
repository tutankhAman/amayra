import { BrowserRouter } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import { Toaster } from 'react-hot-toast';
import Navbar from './layouts/Navbar';
import Footer from './layouts/Footer';
import AppRoutes from './routes';
import { CartProvider } from './context/CartContext';
import { OrderStatusProvider } from './context/OrderStatusContext';

function App() {
  return (
    <OrderStatusProvider>
      <CartProvider>
        <BrowserRouter>
          <UserProvider>
            <Toaster position="top-right" />
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-grow">
                <AppRoutes />
              </main>
              <Footer />
            </div>
          </UserProvider>
        </BrowserRouter>
      </CartProvider>
    </OrderStatusProvider>
  );
}

export default App;
