import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import About from "./components/About";
import Cart from "./components/Cart";
import Checkout from "./Checkout";
import Login from "./components/Login";
import FilterProduct from "./components/FilterProduct";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cookies from "js-cookie";

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

  const toastId = "login-toast";

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
                <>
                  {/* Show the toast only once */}
                  {!toast.isActive(toastId) &&
                    toast.info("Please log in to proceed to checkout", {
                      toastId: toastId, // Set a unique toast ID
                    })}
                  <Navigate to="/login" />
                </>
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

      <ToastContainer
        position="bottom-right"
        autoClose={2000}
        limit={1}
        newestOnTop
        draggable={false}
        pauseOnHover={false}
      />
    </>
  );
}

export default App;
