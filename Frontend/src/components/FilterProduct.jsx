import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom"; // Import useParams

function FilterProduct({ cart, setCart }) {
  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [cartItems, setCartItems] = useState(new Set());

  // Get the product ID from the URL
  const { id } = useParams();

  useEffect(() => {
    console.log("Cart updated");
  }, [cart]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "http://192.168.254.9:3001/api/product"
        );
        if (Array.isArray(response.data)) {
          setProducts(response.data);

          const savedData = JSON.parse(localStorage.getItem("data")) || [];
          const savedQuantities = savedData.reduce((acc, item) => {
            acc[item.id] = item.quantity;
            return acc;
          }, {});
          setQuantities(savedQuantities);

          const savedCartItems = new Set(savedData.map((item) => item.id));
          setCartItems(savedCartItems);
          setCart(savedCartItems.size);
        } else {
          console.log("Unexpected response format:", response.data);
        }
      } catch (error) {
        console.log("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Filter products based on the product ID from the URL
  const filteredProducts = id
    ? products.filter((product) => product._id === id)
    : products;

  const handleQuantityChange = (productId, value) => {
    setQuantities((prev) => {
      const newQuantity = Math.max(value, 1); // Ensure quantity is at least 1

      const updatedQuantities = { ...prev, [productId]: newQuantity };

      const updatedCartData = products
        .filter((product) => cartItems.has(product._id))
        .map((item) => ({
          id: item._id,
          quantity: updatedQuantities[item._id] || 0,
        }));

      localStorage.setItem("data", JSON.stringify(updatedCartData));

      return updatedQuantities;
    });
  };

  const handleAddOrRemoveCart = (item) => {
    const isInCart = cartItems.has(item._id);

    setQuantities((prev) => {
      const updatedQuantities = {
        ...prev,
        [item._id]: isInCart ? 0 : prev[item._id] || 1,
      };

      return updatedQuantities;
    });

    if (isInCart) {
      setCart((prev) => Math.max(prev - 1, 0));

      setCartItems((prev) => {
        const updatedCart = new Set(prev);
        updatedCart.delete(item._id);
        return updatedCart;
      });

      const updatedCartData = [...cartItems]
        .filter((id) => id !== item._id)
        .map((id) => ({
          id,
          quantity: quantities[id] || 0,
        }));

      localStorage.setItem("data", JSON.stringify(updatedCartData));
    } else {
      setCart((prev) => prev + 1);

      setCartItems((prev) => new Set(prev).add(item._id));

      const updatedCartData = [
        ...JSON.parse(localStorage.getItem("data") || "[]"),
        { id: item._id, quantity: quantities[item._id] || 1 },
      ];

      localStorage.setItem("data", JSON.stringify(updatedCartData));
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen">
      <div className="pt-20 container mx-auto p-4">
        <h1 className="text-2xl font-semibold text-center mb-4 text-white">
          Product List
        </h1>

        <table className="bg-gray-800 table-auto w-full shadow-md rounded-t-lg border-2 border-white/60">
          <thead>
            <tr className="dark:bg-gray-700 text-white uppercase text-xs leading-normal">
              <th className="p-4 border-b border-gray-600 font-semibold text-center">
                S.N
              </th>
              <th className="p-4 border-b border-gray-600 font-semibold text-left">
                Name
              </th>
              <th className="p-4 border-b border-gray-600 font-semibold text-center">
                Volume
              </th>
              <th className="p-4 border-b border-gray-600 font-semibold text-center">
                Rate
              </th>
              <th className="p-4 border-b border-gray-600 font-semibold text-center">
                PV
              </th>
              <th className="p-4 border-b border-gray-600 font-semibold text-center">
                BV
              </th>
              <th className="p-4 border-b border-gray-600 font-semibold text-center">
                Quantity
              </th>
              <th className="p-4 border-b border-gray-600 font-semibold text-center">
                Add to Cart
              </th>
            </tr>
          </thead>
          <tbody className="border-2 border-white/50 overflow-hidden">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((item, index) => (
                <tr
                  key={item._id || index}
                  className="border-b border-gray-600 bg-gray-800 hover:bg-gray-700"
                >
                  <td className="py-2 px-4 text-white text-center">
                    {index + 1}
                  </td>
                  <td className="py-2 px-4 text-white text-left">
                    {item.name}
                  </td>
                  <td className="py-2 px-4 text-white text-center">
                    {item.volume || "N/A"}
                  </td>
                  <td className="py-2 px-4 text-white text-center">
                    {item.rate || "$..."}
                  </td>
                  <td className="py-2 px-4 text-white text-center">
                    {item.pv}
                  </td>
                  <td className="py-2 px-4 text-white text-center">
                    {item.bv}
                  </td>
                  <td className="py-2 px-4 text-left flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleQuantityChange(item._id, quantities[item._id] - 1)
                      }
                      className="flex items-center justify-center h-8 w-8 text-white bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400"
                    >
                      <svg
                        className="h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 18 2"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M1 1h16"
                        />
                      </svg>
                    </button>

                    <input
                      type="number"
                      min="1"
                      className="w-12 text-center bg-gray-700 text-white px-1 py-2 rounded-md border-2 border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={quantities[item._id] || "0"}
                      onChange={(e) =>
                        handleQuantityChange(item._id, e.target.value)
                      }
                    />

                    <button
                      type="button"
                      onClick={() =>
                        handleQuantityChange(item._id, quantities[item._id] + 1)
                      }
                      className="flex items-center justify-center h-8 w-8 text-white bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400"
                    >
                      <svg
                        className="h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 18 18"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 1v16M1 9h16"
                        />
                      </svg>
                    </button>
                  </td>

                  <td className="py-2 px-4 text-center">
                    <button
                      onClick={() => handleAddOrRemoveCart(item)}
                      className={`py-2 px-4 text-white rounded-lg ${
                        cartItems.has(item._id) ? "bg-red-500" : "bg-blue-600"
                      }`}
                    >
                      {cartItems.has(item._id) ? "Remove" : "Add to Cart"}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="py-2 text-center text-white">
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default FilterProduct;
