import React, { useState, useEffect } from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

function Cart({ cart, setCart, data, setData }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [id, setId] = useState([]);
  const [price, setPrice] = useState(0);

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("data")) || [];
    const storedCart = parseInt(localStorage.getItem("cart"), 10) || 0;

    setData(storedData);
    setCart(storedCart);
    const ids = storedData.map((item) => item.id);
    setId(ids);
  }, [setData, setCart]);

  useEffect(() => {
    if (data.length > 0) {
      const ids = data.map((item) => item.id);
      setId(ids);
    } else {
      setId([]);
    }
  }, [data]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        if (id.length > 0) {
          const requests = id.map((itemId) =>
            axios.get(`http://192.168.254.9:3001/api/product/${itemId}`)
          );
          const responses = await Promise.all(requests);

          const productsData = responses.map((response) => response.data);
          setProducts(productsData);
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
  }, [id]);

  useEffect(() => {
    const totalprice = products.reduce((total, product) => {
      const productQuantity =
        data.find((item) => item.id === product.product._id)?.quantity || 0;
      const productTotalPrice = productQuantity * (product.product.rate || 0);
      return total + productTotalPrice;
    }, 0);

    setPrice(totalprice);
  }, [products, data]);

  const handleRemoveFromCart = (productId) => {
    const updatedData = data.filter((item) => item.id !== productId);
    setData(updatedData);

    const updatedCartCount = updatedData.length;
    setCart(updatedCartCount);
    localStorage.setItem("cart", updatedCartCount.toString());
    localStorage.setItem("data", JSON.stringify(updatedData));
  };

  const handleQuantityChange = (productId, action) => {
    const updatedData = data.map((item) => {
      if (item.id === productId) {
        const newQuantity =
          action === "increase"
            ? parseInt(item.quantity) + 1
            : parseInt(item.quantity) - 1;
        return { ...item, quantity: Math.max(newQuantity, 1) };
      }
      return item;
    });

    setData(updatedData);
    localStorage.setItem("data", JSON.stringify(updatedData));
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <section className="bg-white antialiased dark:bg-gray-900">
      {products.length > 0 ? (
        <div className="mx-auto max-w-screen-xl min-h-screen px-4 2xl:px-0 py-20">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
            Cart Items
          </h2>
          <div className="mt-6 sm:mt-8 md:gap-6 lg:flex lg:items-start xl:gap-8 gap-8 flex flex-row flex-wrap items-start justify-center">
            <div className="gap-2 md:gap-6 flex-col lg:flex lg:items-start xl:gap-8">
              {products.map((product) => {
                console.log(product.product._id);
                const productQuantity =
                  data.find((item) => item.id === product.product._id)
                    ?.quantity || 0;
                return (
                  <div
                    key={product.product._id}
                    className="mx-auto w-full flex-none lg:max-w-2xl xl:max-w-4xl"
                  >
                    <div className="space-y-6">
                      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 md:p-6">
                        <div className="space-y-4 md:flex md:items-center md:justify-between md:gap-6 md:space-y-0">
                          <Link to="#" className="shrink-0 md:order-1">
                            <img
                              className="h-20 w-20 dark:hidden"
                              src={
                                product.imageUrl ||
                                "https://flowbite.s3.amazonaws.com/blocks/e-commerce/imac-front.svg"
                              }
                              alt="product image"
                            />
                            <img
                              className="hidden h-20 w-20 dark:block"
                              src={
                                product.imageUrl ||
                                "https://flowbite.s3.amazonaws.com/blocks/e-commerce/imac-front-dark.svg"
                              }
                              alt="product image"
                            />
                          </Link>

                          <label for="counter-input" className="sr-only">
                            Choose quantity:
                          </label>
                          <div className="flex items-center justify-between md:order-3 md:justify-end">
                            <div className="flex items-center">
                              <button
                                type="button"
                                onClick={() =>
                                  handleQuantityChange(
                                    product.product._id,
                                    "decrease"
                                  )
                                }
                                className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-gray-300 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-gray-700"
                              >
                                <svg
                                  className="h-2.5 w-2.5 text-gray-900 dark:text-white"
                                  aria-hidden="true"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 18 2"
                                >
                                  <path
                                    stroke="currentColor"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M1 1h16"
                                  />
                                </svg>
                              </button>
                              <input
                                type="text"
                                value={productQuantity}
                                readOnly
                                className="w-10 shrink-0 border-0 bg-transparent text-center text-sm font-medium text-gray-900 focus:outline-none focus:ring-0 dark:text-white"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  handleQuantityChange(
                                    product.product._id,
                                    "increase"
                                  )
                                }
                                className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-gray-300 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-gray-700"
                              >
                                <svg
                                  className="h-2.5 w-2.5 text-gray-900 dark:text-white"
                                  aria-hidden="true"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 18 18"
                                >
                                  <path
                                    stroke="currentColor"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M9 1v16M1 9h16"
                                  />
                                </svg>
                              </button>
                            </div>
                            <div className="text-end md:order-4 md:w-32">
                              <p className="text-base font-bold text-gray-900 dark:text-white">
                                {product.product.rate || "0.00"}
                              </p>
                            </div>
                          </div>

                          <div className="w-full min-w-0 flex-1 space-y-4 md:order-2 md:max-w-md">
                            <div className="text-base font-medium text-gray-900 hover:underline dark:text-white">
                              {product.product.name || "Product Name"}
                            </div>

                            <div className="flex items-center gap-4">
                              <button
                                type="button"
                                className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 hover:underline dark:text-gray-400 dark:hover:text-white"
                              >
                                <svg
                                  className="me-1.5 h-5 w-5"
                                  aria-hidden="true"
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="24"
                                  height="24"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    stroke="currentColor"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M12.01 6.001C6.5 1 1 8 5.782 13.001L12.011 20l6.23-7C23 8 17.5 1 12.01 6.002Z"
                                  />
                                </svg>
                                Add to Favorites
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveFromCart(product.product._id)
                                }
                                className="inline-flex items-center text-sm font-medium text-red-600 hover:underline dark:text-red-500"
                              >
                                <svg
                                  className="me-1.5 h-5 w-5"
                                  aria-hidden="true"
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="24"
                                  height="24"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    stroke="currentColor"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M6 6l12 12M6 18L18 6"
                                  />
                                </svg>
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mx-auto mt-6 max-w-4xl flex-1 space-y-6 lg:mt-0 lg:w-full">
              <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6">
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  Order summary
                </p>

                <div className="sp`ace-y-4">
                  <div className="space-y-2">
                    <dl className="flex items-center justify-between gap-4">
                      <dt className="text-base font-normal text-gray-500 dark:text-gray-400">
                        Original price
                      </dt>
                      <dd className="text-base font-medium text-gray-900 dark:text-white">
                        ${price}
                      </dd>
                    </dl>

                    <dl className="flex items-center justify-between gap-4">
                      <dt className="text-base font-normal text-gray-500 dark:text-gray-400">
                        Savings
                      </dt>
                      <dd className="text-base font-medium text-green-600">
                        $0.00
                      </dd>
                    </dl>

                    <dl className="flex items-center justify-between gap-4">
                      <dt className="text-base font-normal text-gray-500 dark:text-gray-400">
                        Store Pickup
                      </dt>
                      <dd className="text-base font-medium text-gray-900 dark:text-white">
                        $0.00
                      </dd>
                    </dl>

                    <dl className="flex items-center justify-between gap-4">
                      <dt className="text-base font-normal text-gray-500 dark:text-gray-400">
                        Tax
                      </dt>
                      <dd className="text-base font-medium text-gray-900 dark:text-white">
                        $0.00
                      </dd>
                    </dl>
                  </div>

                  <dl className="flex items-center justify-between gap-4 border-t border-gray-200 pt-2 dark:border-gray-700">
                    <dt className="text-base font-bold text-gray-900 dark:text-white">
                      Total
                    </dt>
                    <dd className="text-base font-bold text-gray-900 dark:text-white">
                      $0.00
                    </dd>
                  </dl>
                </div>

                <Link
                  to="/checkout"
                  className="flex w-full items-center justify-center rounded-lg bg-primary-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                >
                  Proceed to Checkout
                </Link>

                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                    {" "}
                    or{" "}
                  </span>
                  <Link
                    to="/"
                    title=""
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary-700 underline hover:no-underline dark:text-primary-500"
                  >
                    Continue Shopping
                    <svg
                      className="h-5 w-5"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 12H5m14 0-4 4m4-4-4-4"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center h-screen text-white rounded-lg">
          <div className="text-center">
            <h2 className="text-3xl font-semibold mb-4">Your Cart is Empty</h2>
            <p className="text-lg mb-6">
              Looks like you haven't added anything to your cart yet.
            </p>
            <p className="text-sm mb-4">
              Start shopping and fill your cart with amazing products!
            </p>
            <button
              onClick={() => (window.location.href = "/")}
              className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-400 transition-all duration-300"
            >
              Go to Shop
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default Cart;
