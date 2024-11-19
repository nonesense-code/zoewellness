import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import About from "./components/About";
import Cart from "./components/Cart";
import Checkout from "./Checkout";
import Bill from "./components/Bill";
import Login from "./components/Login";
import FilterProduct from "./components/FilterProduct";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import Cookies from "js-cookie";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? Number(savedCart) : 0;
  });

  useEffect(() => {
    if (cart !== 0) {
      localStorage.setItem("cart", cart);
    }
  }, [cart]);

  const [data, setData] = useState(() => {
    const savedData = localStorage.getItem("data");
    return savedData ? JSON.parse(savedData) : [];
  });

  useEffect(() => {
    if (data.length > 0) {
      localStorage.setItem("data", JSON.stringify(data));
    }
  }, [data]);

  const isLoggedIn = !!Cookies.get("token");
  const toastId = "login-toast"; // Unique toast ID for login warning

  // Show the login toast only once when user tries to access checkout without logging in
  useEffect(() => {
    // Check if user is not logged in and if we're navigating to the `/checkout` route
    if (
      !isLoggedIn &&
      window.location.pathname === "/checkout" &&
      !toast.isActive(toastId)
    ) {
      toast.info("Please log in to proceed to checkout", {
        toastId: toastId, // Ensure unique ID so it doesn't show multiple times
        position: "top-center",
        autoClose: 1000, // Toast will disappear after 1 second
        pauseOnHover: false,
        draggable: false,
      });
    }
  }, [isLoggedIn]); // Dependency array to re-run only when login status changes

  return (
    <>
      <Router>
        <Navbar cart={cart} setCart={setCart} data={data} setData={setData} />
        <Routes>
          <Route
            path="/"
            element={
              <Home
                cart={cart}
                setCart={setCart}
                data={data}
                setData={setData}
              />
            }
          />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/bill"
            element={<Bill data={data} setData={setData} />}
          />
          <Route
            path="/product/:id"
            element={
              <FilterProduct
                cart={cart}
                data={data}
                setCart={setCart}
                setData={setData}
              />
            }
          />
          <Route
            path="/checkout"
            element={
              isLoggedIn ? (
                <Checkout cart={cart} data={data} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/cart"
            element={
              <Cart
                cart={cart}
                setCart={setCart}
                data={data}
                setData={setData}
              />
            }
          />
        </Routes>
      </Router>

      {/* ToastContainer is placed here so it is available globally */}
      <ToastContainer
        position="top-center"
        autoClose={1000}
        newestOnTop
        draggable={false}
        pauseOnHover={false}
      />
    </>
  );
}

export default App;
