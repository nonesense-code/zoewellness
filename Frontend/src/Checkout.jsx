import React, { useState, useEffect } from "react";
import html2canvas from "html2canvas";
import axios from "axios";

function Checkout({ data }) {
  const [customerDetails, setCustomerDetails] = useState({
    name: "",
    id: "",
    address: "",
    phoneNumber: "",
  });

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [billGenerated, setBillGenerated] = useState(false);
  const [price, setPrice] = useState(0);
  const [pv, setPV] = useState(null);
  const [bv, setBV] = useState(null);
  const [totalQuantity, setTotalQuantity] = useState(0);

  const url = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const total = products.reduce((total, product) => {
      const productQuantity =
        data.find((item) => item.id === product.product._id)?.quantity || 0;
      return total + productQuantity;
    }, 0);

    setTotalQuantity(total);
  }, [products, data]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const storedData = JSON.parse(localStorage.getItem("data")) || [];
        const ids = storedData.map((item) => item.id);

        if (ids.length > 0) {
          const requests = ids.map((itemId) => {
            return axios.get(`${url}/api/product/${itemId}`);
          });
          const responses = await Promise.all(requests);
          const productsData = responses.map((response) => response.data);

          const productsWithQuantity = productsData.map((product, index) => {
            const quantity =
              storedData.find((item) => item.id === product.id)?.quantity || 1;
            return { ...product, quantity };
          });

          setProducts(productsWithQuantity);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerDetails({ ...customerDetails, [name]: value });
  };

  const handleProductChange = (e, index, field) => {
    const value = e.target.value;
    const updatedProducts = [...products];
    updatedProducts[index][field] = value;
    setProducts(updatedProducts);
  };

  const handleSaveBill = () => {
    const billDiv = document.getElementById("bill");
    html2canvas(billDiv).then((canvas) => {
      const img = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = img;
      link.download = "bill.png";
      link.click();
    });
  };

  async function fetchSuggestions(query) {
    const input = query.toUpperCase();
    if (input) {
      try {
        const response = await axios.get(`${url}/search/item/${input}`);
        setSuggestions(response.data);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      }
    } else {
      setSuggestions([]);
    }
  }

  useEffect(() => {
    const totals = products.reduce(
      (totals, product) => {
        const productData = data.find(
          (item) => item.id === product.product._id
        );
        const productQuantity = productData?.quantity || 0;

        const productTotalPrice = productQuantity * (product.product.rate || 0);
        const productTotalBV = productQuantity * (product.product.bv || 0);
        const productTotalPV = productQuantity * (product.product.pv || 0);

        totals.price += productTotalPrice;
        totals.bv += productTotalBV;
        totals.pv += productTotalPV;

        return totals;
      },
      { price: 0, bv: 0, pv: 0 }
    );

    setPrice(totals.price);
    setBV(totals.bv);
    setPV(totals.pv);
  }, [products, data]);

  return (
    <div className="container mx-auto p-6 mt-16">
      <h1 className="text-2xl font-bold text-center mb-4">Create a Bill</h1>

      <div className="mb-6">
        <label className="block text-sm font-semibold">Customer Name</label>
        <input
          type="text"
          name="name"
          value={customerDetails.name}
          onChange={handleInputChange}
          className="border p-2 w-full mt-1"
        />

        <label className="block text-sm font-semibold mt-4">Customer ID</label>
        <input
          type="text"
          name="id"
          value={customerDetails.id}
          onChange={handleInputChange}
          className="border p-2 w-full mt-1"
        />

        <label className="block text-sm font-semibold mt-4">Address</label>
        <textarea
          name="address"
          value={customerDetails.address}
          onChange={handleInputChange}
          className="border p-2 w-full mt-1"
        />

        <label className="block text-sm font-semibold mt-4">Phone Number</label>
        <input
          type="text"
          name="phoneNumber"
          value={customerDetails.phoneNumber}
          onChange={handleInputChange}
          className="border p-2 w-full mt-1"
        />
      </div>

      <button
        onClick={() => setBillGenerated(true)}
        className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-400"
      >
        Generate Bill
      </button>

      {billGenerated && (
        <div
          className="flex items-center justify-center flex-col mt-8 p-6 bg-white rounded-lg"
          style={{ width: "100%", maxWidth: "600px", margin: "0 auto" }}
        >
          <h2 className="text-3xl font-semibold text-center mb-4">Bill</h2>

          <h3 className="text-xl font-semibold mt-4">Products</h3>
          <table className="w-full mt-2 border-collapse" id="bill">
            <div className="p-2 pb-4 bg-zinc-200 rounded-t-lg">
              <p>
                <strong>Name:</strong> {customerDetails.name}
              </p>
              <p>
                <strong>ID:</strong> {customerDetails.id}
              </p>
              <p>
                <strong>Address:</strong> {customerDetails.address}
              </p>
              <p>
                <strong>Phone:</strong> {customerDetails.phoneNumber}
              </p>
            </div>
            <tbody>
              <div class="relative overflow-x-auto">
                <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                  <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-stone-600 dark:text-zinc-200">
                    <tr>
                      <th scope="col" class="px-6 py-2 text-sm">
                        Product
                      </th>
                      <th scope="col" class="px-6 py-2 text-sm">
                        Volume
                      </th>
                      <th scope="col" class="px-6 py-2 text-sm">
                        Rate
                      </th>
                      <th scope="col" class="px-6 py-2 text-sm">
                        PV
                      </th>
                      <th scope="col" class="px-6 py-2 text-sm">
                        BV
                      </th>
                      <th scope="col" class="px-6 py-2 text-sm">
                        Quantity
                      </th>
                      <th scope="col" class="px-6 py-2 text-sm">
                        Total PV
                      </th>
                      <th scope="col" class="px-6 py-2 text-sm">
                        Total BV
                      </th>
                      <th scope="col" class="px-6 py-2 text-sm">
                        Total Amount
                      </th>
                    </tr>
                  </thead>
                  {products.map((product, index) => (
                    <tbody>
                      <tr class="bg-white border-b dark:bg-stone-900 dark:border-gray-400">
                        <th
                          scope="row"
                          class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                        >
                          {product.product.name}
                        </th>
                        <th
                          scope="row"
                          class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                        >
                          {product.product.volume}
                        </th>
                        <th
                          scope="row"
                          class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                        >
                          {product.product.rate}
                        </th>
                        <th
                          scope="row"
                          class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                        >
                          {product.product.pv
                            ? product.product.pv.toFixed(2)
                            : "n/a"}
                        </th>
                        <th
                          scope="row"
                          class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                        >
                          {product.product.bv
                            ? product.product.bv.toFixed(2)
                            : "n/a"}
                        </th>
                        <th
                          scope="row"
                          class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                        >
                          {data.find((item) => item.id === product.product._id)
                            ?.quantity || 0}
                        </th>
                        <th
                          scope="row"
                          class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                        >
                          {data.find((item) => item.id === product.product._id)
                            ? (
                                product.product.pv *
                                data.find(
                                  (item) => item.id === product.product._id
                                ).quantity
                              ).toFixed(2)
                            : "0.00"}{" "}
                        </th>
                        <th
                          scope="row"
                          class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                        >
                          {data.find((item) => item.id === product.product._id)
                            ? (
                                product.product.bv *
                                data.find(
                                  (item) => item.id === product.product._id
                                ).quantity
                              ).toFixed(2)
                            : "0.00"}
                        </th>
                        <th
                          scope="row"
                          class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                        >
                          {data.find((item) => item.id === product.product._id)
                            ? (
                                product.product.rate *
                                data.find(
                                  (item) => item.id === product.product._id
                                ).quantity
                              ).toFixed(2)
                            : "0.00"}{" "}
                        </th>
                      </tr>
                      <tr class="bg-white border-b dark:bg-stone-900 dark:border-gray-400">
                        <th
                          scope="row"
                          class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                        >
                          <input
                            type="text"
                            className="p-2 text-white rounded-lg bg-gray-600 text-[14px] outline-none"
                          />
                        </th>
                        <th
                          scope="row"
                          class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                        >
                          {product.product.volume}
                        </th>
                        <th
                          scope="row"
                          class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                        >
                          {product.product.rate}
                        </th>
                        <th
                          scope="row"
                          class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                        >
                          {product.product.pv
                            ? product.product.pv.toFixed(2)
                            : "n/a"}
                        </th>
                        <th
                          scope="row"
                          class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                        >
                          {product.product.bv
                            ? product.product.bv.toFixed(2)
                            : "n/a"}
                        </th>
                        <th
                          scope="row"
                          class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                        >
                          {data.find((item) => item.id === product.product._id)
                            ?.quantity || 0}
                        </th>
                        <th
                          scope="row"
                          class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                        >
                          {data.find((item) => item.id === product.product._id)
                            ? (
                                product.product.pv *
                                data.find(
                                  (item) => item.id === product.product._id
                                ).quantity
                              ).toFixed(2)
                            : "0.00"}{" "}
                        </th>
                        <th
                          scope="row"
                          class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                        >
                          {data.find((item) => item.id === product.product._id)
                            ? (
                                product.product.bv *
                                data.find(
                                  (item) => item.id === product.product._id
                                ).quantity
                              ).toFixed(2)
                            : "0.00"}
                        </th>
                        <th
                          scope="row"
                          class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                        >
                          {data.find((item) => item.id === product.product._id)
                            ? (
                                product.product.rate *
                                data.find(
                                  (item) => item.id === product.product._id
                                ).quantity
                              ).toFixed(2)
                            : "0.00"}{" "}
                        </th>
                      </tr>
                    </tbody>
                  ))}
                  <tfoot class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-stone-600 dark:text-zinc-200">
                    <tr>
                      <th scope="col" class="px-6 py-4 text-sm">
                        Total
                      </th>
                      <th scope="col" class="px-6 py-4 text-sm"></th>
                      <th scope="col" class="px-6 py-4 text-sm"></th>
                      <th scope="col" class="px-6 py-4 text-sm">
                        {pv.toFixed(2)}
                      </th>
                      <th scope="col" class="px-6 py-4 text-sm">
                        {bv.toFixed(2)}
                      </th>
                      <th scope="col" class="px-6 py-4 text-sm">
                        {" "}
                        {totalQuantity}
                      </th>
                      <th scope="col" class="px-6 py-4 text-sm">
                        {" "}
                        {pv.toFixed(2)}
                      </th>
                      <th scope="col" class="px-6 py-4 text-sm">
                        {" "}
                        {bv.toFixed(2)}
                      </th>
                      <th scope="col" class="px-6 py-4 text-sm">
                        {" "}
                        {price}
                      </th>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </tbody>
          </table>

          <div className="mt-4">
            <button
              onClick={handleSaveBill}
              className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-400 mt-4"
            >
              Save Bill as Image
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Checkout;
