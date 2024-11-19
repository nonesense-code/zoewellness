import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Bill = ({ data, setData }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const url = import.meta.env.VITE_BACKEND_URL;

  async function fetchSuggestions(query) {
    const input = query.toUpperCase();
    if (input) {
      try {
        const response = await axios.get(`${url}/search/item/${input}`);
        setSuggestions(response.data);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        alert("There was an error fetching suggestions.");
      }
    } else {
      setSuggestions([]);
    }
  }

  const handleSearchSubmit = async (e) => {
    if (e.key === "Enter" || e.type === "click") {
      const normalizedSearchQuery = searchQuery
        .replace(/[^a-zA-Z0-9\s-]/g, "")
        .replace(/\s+/g, " ")
        .replace(/-/g, " ")
        .replace(/\s/g, "")
        .toLowerCase();

      if (!normalizedSearchQuery) {
        alert("Please enter a valid search query.");
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
          alert("No products found");
        }
      } catch (error) {
        console.error("Error searching for product:", error);
        alert("There was an error searching for products.");
      } finally {
        setLoading(false);
      }
    }
  };

  const fetchProductDetails = async (productId) => {
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
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
      alert("There was an error fetching product details.");
    } finally {
      setLoading(false);
    }
  };

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
      alert("There was an error fetching product data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedProducts = JSON.parse(localStorage.getItem("products"));
    if (savedProducts) {
      setProducts(savedProducts);
    }
  }, []);

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
  };

  const handleQuantityChange = (e, productId) => {
    let updatedQuantity = e.target.value;

    if (updatedQuantity === "") {
      updatedQuantity = 0;
    } else {
      updatedQuantity = parseInt(updatedQuantity, 10);
      if (isNaN(updatedQuantity) || updatedQuantity < 1) {
        updatedQuantity = 1;
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

  // Calculate Total PV, BV, Quantity, and Rate for all products
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

  return (
    <div className="w-full min-h-screen py-20 px-8 bg-gray-900 text-white">
      <h1 className="text-3xl font-bold text-center mb-4">Search Products</h1>

      <div className="mb-4">
        <input
          type="text"
          id="search-input"
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
          <table className="min-w-full table-auto border-collapse border border-gray-600">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-4 py-2 border-b text-center">Name</th>
                <th className="px-4 py-2 border-b text-center">Volume</th>
                <th className="px-4 py-2 border-b text-center">Rate</th>
                <th className="px-4 py-2 border-b text-center">PV</th>
                <th className="px-4 py-2 border-b text-center">BV</th>
                <th className="px-4 py-2 border-b text-center">Quantity</th>
                <th className="px-4 py-2 border-b text-center">Total PV</th>
                <th className="px-4 py-2 border-b text-center">Total BV</th>
                <th className="px-4 py-2 border-b text-center">Total Rate</th>
                <th className="px-4 py-2 border-b text-center">Action</th>
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
                        value={quantity}
                        onChange={(e) =>
                          handleQuantityChange(e, product?.product._id)
                        }
                        className="w-20 p-1 border rounded-md text-center bg-gray-800"
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
                        className="p-2 bg-red-600 rounded-lg text-sm font-semibold tracking-wide cursor-pointer"
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
                <th scope="col" class="px-6 py-4 text-sm">
                  Total
                </th>
                <th scope="col" class="px-6 py-4 text-sm"></th>
                <th scope="col" class="px-6 py-4 text-sm"></th>
                <th scope="col" class="px-6 py-4 text-sm">
                  {totalPV.toFixed(2)}
                </th>
                <th scope="col" class="px-6 py-4 text-sm">
                  {totalBV.toFixed(2)}
                </th>
                <th scope="col" class="px-6 py-4 text-sm">
                  {totalQuantity}
                </th>
                <th scope="col" class="px-6 py-4 text-sm">
                  {totalPV.toFixed(2)}
                </th>
                <th scope="col" class="px-6 py-4 text-sm">
                  {totalBV.toFixed(2)}
                </th>
                <th scope="col" class="px-6 py-4 text-sm">
                  {totalRate.toFixed(2)}
                </th>
                <th scope="col" class="px-6 py-4 text-sm"></th>
              </tr>
            </tfoot>
          </table>
        ) : (
          <div className="text-center">No products selected.</div>
        )}
      </div>
    </div>
  );
};

export default Bill;
