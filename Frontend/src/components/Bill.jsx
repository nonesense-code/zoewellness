import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import html2canvas from "html2canvas"; // Import html2canvas
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Helper function to show toasts
const showToast = (type, message) => {
  const toastOptions = {
    position: "top-center",
    autoClose: 1000,
    pauseOnHover: false,
    draggable: false,
  };

  switch (type) {
    case "error":
      toast.error(message, toastOptions);
      break;
    case "success":
      toast.success(message, toastOptions);
      break;
    case "warn":
      toast.warn(message, toastOptions);
      break;
    default:
      toast.info(message, toastOptions);
  }
};

const Bill = ({ data, setData }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const url = import.meta.env.VITE_BACKEND_URL;

  // Fetch product suggestions based on the search query
  const fetchSuggestions = async (query) => {
    const input = query.toUpperCase();
    if (input) {
      try {
        const response = await axios.get(`${url}/search/item/${input}`);
        setSuggestions(response.data);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        showToast("error", "There was an error fetching suggestions.");
      }
    } else {
      setSuggestions([]);
    }
  };

  // Normalize the search query string
  const normalizeSearchQuery = (query) => {
    return query
      .replace(/[^a-zA-Z0-9\s-]/g, "")
      .replace(/\s+/g, " ")
      .replace(/-/g, " ")
      .replace(/\s/g, "")
      .toLowerCase();
  };

  // Handle search query submission
  const handleSearchSubmit = async (e) => {
    if (e.key === "Enter" || e.type === "click") {
      const normalizedSearchQuery = normalizeSearchQuery(searchQuery);

      if (!normalizedSearchQuery) {
        showToast("error", "Please enter a valid search query.");
        return;
      }

      setLoading(true);

      try {
        const response = await axios.get(
          `${url}/search/item/${normalizedSearchQuery}`
        );
        if (response.data.length > 0) {
          setSuggestions([]);
          const productId = response.data[0]._id;
          fetchProductDetails(productId);
        } else {
          showToast("warn", "No products found.");
        }
      } catch (error) {
        console.error("Error searching for product:", error);
        showToast("error", "There was an error searching for products.");
      } finally {
        setLoading(false);
      }
    }
  };

  // Fetch product details based on productId
  const fetchProductDetails = async (productId) => {
    const productExists = products.some(
      (product) => String(product.product._id) === String(productId)
    );

    if (productExists) {
      showToast("warn", "This product is already in the list.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`${url}/api/product/${productId}`);
      if (response.data) {
        const newProduct = response.data;
        const updatedProducts = [
          ...products,
          { ...newProduct, id: newProduct._id },
        ];
        setProducts(updatedProducts);
        localStorage.setItem("products", JSON.stringify(updatedProducts));
        showToast("success", "Product added to the list.");
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
      showToast("error", "There was an error fetching product details.");
    } finally {
      setLoading(false);
    }
  };

  // Handle suggestion click and fetch product details
  const handleSuggestionClick = async (suggestionName) => {
    setSearchQuery(suggestionName);
    setSuggestions([]);

    setLoading(true);
    try {
      const response = await axios.get(`${url}/search/item/${suggestionName}`);
      if (response.data.length > 0) {
        const productId = response.data[0]._id;
        fetchProductDetails(productId);
      }
    } catch (error) {
      console.error("Error fetching product data:", error);
      showToast("error", "There was an error fetching product data.");
    } finally {
      setLoading(false);
    }
  };

  // Load saved products from local storage
  useEffect(() => {
    const savedProducts = JSON.parse(localStorage.getItem("products"));
    if (savedProducts) {
      setProducts(savedProducts);
    }
  }, []);

  // Remove a product from the list
  const handleRemoveProduct = (productId) => {
    const updatedProducts = products.filter(
      (product) => String(product.product._id) !== String(productId)
    );
    setProducts(updatedProducts);
    localStorage.setItem("products", JSON.stringify(updatedProducts));

    const storedData = JSON.parse(localStorage.getItem("data")) || [];
    const updatedData = storedData.filter(
      (item) => String(item.id) !== String(productId)
    );
    localStorage.setItem("data", JSON.stringify(updatedData));

    setData(updatedData);
    showToast("success", "Product removed from the list.");
  };

  // Handle quantity change for a product
  const handleQuantityChange = (e, productId) => {
    let updatedQuantity = e.target.value;

    // If the input is empty, keep it empty, don't set it to 0
    if (updatedQuantity === "") {
      updatedQuantity = ""; // Allow empty string when quantity is cleared
    } else {
      // Ensure the value is a valid positive number, or reset it to 1
      updatedQuantity = parseInt(updatedQuantity, 10);
      if (isNaN(updatedQuantity) || updatedQuantity < 1) {
        updatedQuantity = 1; // You can adjust this based on your requirements
      }
    }

    const storedData = JSON.parse(localStorage.getItem("data")) || [];
    const existingProductIndex = storedData.findIndex(
      (product) => product.id === productId
    );

    if (existingProductIndex !== -1) {
      storedData[existingProductIndex].quantity = updatedQuantity;
    } else {
      storedData.push({ id: productId, quantity: updatedQuantity });
    }

    localStorage.setItem("data", JSON.stringify(storedData));
    setData(storedData);
  };

  // Calculate the total amounts for the bill
  const calculateTotals = () => {
    let totalPV = 0;
    let totalBV = 0;
    let totalQuantity = 0;
    let totalRate = 0;

    products.forEach((product) => {
      const quantity =
        data?.find((item) => item.id === product?.product._id)?.quantity || 0;

      const rate = product?.product?.rate || 0;
      const pv = product?.product?.pv || 0;
      const bv = product?.product?.bv || 0;

      totalRate += rate * quantity;
      totalPV += pv * quantity;
      totalBV += bv * quantity;
      totalQuantity += quantity;
    });

    return { totalRate, totalPV, totalBV, totalQuantity };
  };

  const { totalRate, totalPV, totalBV, totalQuantity } = calculateTotals();

  // Handle saving the bill as an image
  const handleSaveBill = () => {
    // Check if any product has quantity of 0
    const hasZeroQuantity = products.some((product) => {
      const quantity =
        data?.find((item) => item.id === product?.product._id)?.quantity || 0;
      return quantity === 0;
    });

    if (hasZeroQuantity) {
      showToast("error", "Quantity must be entered for all products.");
      document.getElementById("quantity-field").focus();
      return;
    }

    const billTable = document.getElementById("bill-table");

    html2canvas(billTable, {
      ignoreElements: (element) => element.classList.contains("remove-button"),
    }).then((canvas) => {
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = "bill.png";
      link.click();
      showToast("success", "Bill saved as PNG.");
    });
  };

  return (
    <div className="w-full min-h-screen py-20 px-8 bg-gray-900 text-white">
      <h1 className="text-3xl font-bold text-center mb-4">Search Products</h1>

      <div className="mb-4">
        <input
          type="text"
          id="search-items"
          className="p-2 border rounded-lg w-full bg-gray-800 text-white placeholder-gray-400"
          placeholder="Search for a product..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            fetchSuggestions(e.target.value);
          }}
          onKeyDown={handleSearchSubmit}
        />
        {suggestions.length > 0 && (
          <ul className="mt-2 border rounded-lg max-h-40 overflow-y-auto bg-gray-800">
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                className="p-2 hover:bg-gray-700 cursor-pointer"
                onClick={() => handleSuggestionClick(suggestion.name)}
              >
                {suggestion.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        {loading ? (
          <div className="text-center">Loading...</div>
        ) : products.length > 0 ? (
          <div>
            <div className="mb-4 text-center">
              <button
                onClick={handleSaveBill}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                Save Bill as PNG
              </button>
            </div>

            <table
              id="bill-table"
              className="w-full bg-gray-900 table-auto border-collapse border border-gray-600"
            >
              <thead className="bg-gray-800">
                <tr className="">
                  <th className="px-4 py-2 pb-4 border-b text-center">Name</th>
                  <th className="px-4 py-2 pb-4 border-b text-center">
                    Volume
                  </th>
                  <th className="px-4 py-2 pb-4 border-b text-center">Rate</th>
                  <th className="px-4 py-2 pb-4 border-b text-center">PV</th>
                  <th className="px-4 py-2 pb-4 border-b text-center">BV</th>
                  <th className="px-4 py-2 pb-4 border-b text-center">
                    Quantity
                  </th>
                  <th className="px-4 py-2 pb-4 border-b text-center">
                    Total PV
                  </th>
                  <th className="px-4 py-2 pb-4 border-b text-center">
                    Total BV
                  </th>
                  <th className="px-4 py-2 pb-4 border-b text-center">
                    Total Rate
                  </th>
                  <th className="remove-button px-4 py-2 pb-4 border-b text-center">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => {
                  const quantity =
                    data?.find((item) => item.id === product?.product._id)
                      ?.quantity || 0;

                  const rate = product?.product?.rate || 0;
                  const pv = product?.product?.pv || 0;
                  const bv = product?.product?.bv || 0;

                  const totalPV = pv * quantity;
                  const totalBV = bv * quantity;
                  const totalRate = rate * quantity;

                  return (
                    <tr key={index}>
                      <td className="px-4 py-2 border-b text-center">
                        {product?.product?.name || "N/A"}
                      </td>
                      <td className="px-4 py-2 border-b text-center">
                        {product?.product?.volume || "N/A"}
                      </td>
                      <td className="px-4 py-2 border-b text-center">
                        {rate || "N/A"}
                      </td>
                      <td className="px-4 py-2 border-b text-center">
                        {pv || "N/A"}
                      </td>
                      <td className="px-4 py-2 border-b text-center">
                        {bv || "N/A"}
                      </td>
                      <td className="px-4 py-2 border-b text-center">
                        <input
                          type="number"
                          value={quantity === 0 ? "" : quantity}
                          placeholder="Enter qnt"
                          id="quantity-field"
                          onChange={(e) =>
                            handleQuantityChange(e, product?.product._id)
                          }
                          className="w-20 bg-transparent h-10 text-center placeholder:text-sky-500/50"
                          onKeyDown={(e) => {
                            if (e.key === "Backspace" && quantity === "") {
                              return;
                            }
                          }}
                        />
                      </td>
                      <td className="px-4 py-2 border-b text-center">
                        {totalPV.toFixed(2)}
                      </td>
                      <td className="px-4 py-2 border-b text-center">
                        {totalBV.toFixed(2)}
                      </td>
                      <td className="px-4 py-2 border-b text-center">
                        {totalRate.toFixed(2)}
                      </td>
                      <td className="px-4 py-2 border-b text-center">
                        <div
                          className="remove-button p-2 bg-red-600 rounded-lg text-sm font-semibold tracking-wide cursor-pointer"
                          onClick={() =>
                            handleRemoveProduct(product?.product._id)
                          }
                        >
                          Remove
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="text-xs bg-gray-800 uppercase text-white">
                <tr>
                  <th scope="col" className="px-6 py-4 text-sm">
                    Total
                  </th>
                  <th scope="col" className="px-6 py-4 text-sm"></th>
                  <th scope="col" className="px-6 py-4 text-sm"></th>
                  <th scope="col" className="px-6 py-4 text-sm">
                    {totalPV.toFixed(2)}
                  </th>
                  <th scope="col" className="px-6 py-4 text-sm">
                    {totalBV.toFixed(2)}
                  </th>
                  <th scope="col" className="px-6 py-4 text-sm">
                    {totalQuantity}
                  </th>
                  <th scope="col" className="px-6 py-4 text-sm">
                    {totalPV.toFixed(2)}
                  </th>
                  <th scope="col" className="px-6 py-4 text-sm">
                    {totalBV.toFixed(2)}
                  </th>
                  <th scope="col" className="px-6 py-4 text-sm">
                    {totalRate.toFixed(2)}
                  </th>
                  <th
                    scope="col"
                    className="remove-button px-6 py-4 text-sm"
                  ></th>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 px-4 bg-gray-800 rounded-lg shadow-lg max-w-xl mx-auto">
            <h2 className="text-2xl font-semibold text-yellow-400 mb-4">
              Oops! No Products Found
            </h2>
            <p className="text-lg text-gray-300 mb-6">
              It looks like you haven’t added any products yet. No worries, you
              can add items easily by searching from the search bar above.
            </p>
            <button
              onClick={() => document.getElementById("search-items")?.focus()}
              className="px-6 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition duration-300 ease-in-out"
            >
              Search Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bill;
