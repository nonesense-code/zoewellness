import React, { useState, useEffect } from "react";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
} from "@headlessui/react";
import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { BrowserRouter as Router, Link, useNavigate } from "react-router-dom";
import { IoCart } from "react-icons/io5";
import axios from "axios";

const navigation = [
  { name: "Home", href: "/", current: true },
  { name: "Cart", href: "/cart", current: false },
  { name: "About", href: "/about", current: false },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}

function removeToken(name) {
  document.cookie = `${name}=; Max-Age=-99999999;`;
}

function Navbar({ cart, setCart, id, setId }) {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const token = getCookie("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    removeToken("token");
    setIsLoggedIn(false);
    navigate("/");
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    navigate("/login");
  };

  const url = import.meta.env.VITE_BACKEND_URL;

  async function fetchSuggestions(query) {
    const input = query.toUpperCase();
    if (input) {
      try {
        const response = await axios.get(`${url}/${input}`);
        setSuggestions(response.data);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      }
    } else {
      setSuggestions([]);
    }
  }

  const handleSearchSubmit = async (e) => {
    e.preventDefault();

    const normalizedSearchQuery = searchQuery
      .replace(/[^a-zA-Z0-9\s-]/g, "") // Remove any non-alphanumeric characters except spaces and hyphens
      .replace(/\s+/g, " ") // Normalize spaces to a single space
      .replace(/-/g, " ") // Replace hyphens with spaces (to treat "anti-acne" and "anti acne" as same)
      .toLowerCase();

    try {
      const response = await axios.get(
        `${url}/search/item/${normalizedSearchQuery}`
      );
      if (response.data.length > 0) {
        const productId = response.data[0]._id; // Assuming the first match is the correct one
        navigate(`/product/${productId}`);
      } else {
        document.getElementById("search-input").focus(); // Focus back on the search input if not found
      }
    } catch (error) {
      console.error("Error searching for product:", error);
      document.getElementById("search-input").focus(); // Focus on input if an error occurs
    }
  };

  return (
    <Disclosure as="nav" className="fixed top-0 left-0 w-full bg-gray-800 z-50">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="absolute inset-y-0 left-0 flex items-center lg:hidden">
            <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
              <span className="absolute -inset-0.5" />
              <span className="sr-only">Open main menu</span>
              <Bars3Icon
                aria-hidden="true"
                className="block h-6 w-6 group-data-[open]:hidden"
              />
              <XMarkIcon
                aria-hidden="true"
                className="hidden h-6 w-6 group-data-[open]:block"
              />
            </DisclosureButton>
          </div>
          <div className="flex flex-1 items-center justify-center lg:items-stretch lg:justify-start">
            <div className="flex shrink-0 items-center">
              <Link
                to="/"
                className="text-2xl font-extrabold text-indigo-600 outline-none select-none"
              >
                ZOE
              </Link>
            </div>
            <div className="hidden sm:ml-6 lg:flex">
              <div className="flex space-x-4 items-center justify-center">
                {navigation.map((item, index) => (
                  <React.Fragment key={item.name}>
                    <Link
                      to={item.href}
                      aria-current={item.current ? "page" : undefined}
                      className={classNames(
                        item.current
                          ? "bg-gray-900 text-white outline-none"
                          : "text-gray-300 hover:bg-gray-700 hover:text-white flex items-center justify-center outline-none",
                        "rounded-md px-3 py-2 text-sm font-medium"
                      )}
                    >
                      {item.name}
                      {index === 1 && (
                        <Link
                          to="/cart"
                          className="relative outline-none rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                        >
                          <IoCart className="text-gray-300 text-xl hover:text-white" />
                          <span className="absolute h-4 w-4 top-1 left-6 text-sm flex items-center justify-center rounded-full bg-black">
                            {cart}
                          </span>
                        </Link>
                      )}
                    </Link>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                id="search-input"
                name="search_items"
                placeholder="Search..."
                className="w-72 h-10 border border-gray-300 rounded-full pl-4 pr-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  fetchSuggestions(e.target.value);
                }}
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-indigo-600"
              >
                <i className="fa-solid fa-magnifying-glass"></i>
              </button>
              <div
                id="suggestions"
                className={`absolute top-12 w-full bg-white rounded-lg shadow-lg overflow-y-auto max-h-40 ${
                  suggestions.length > 0 ? "" : "hidden"
                }`}
              >
                <ul id="suggestions-list" className="space-y-2 py-2 px-4">
                  {suggestions.map((suggestion) => (
                    <li
                      key={suggestion._id}
                      className="cursor-pointer hover:bg-gray-300 p-2"
                      onClick={() => {
                        document.getElementById("search-input").value =
                          suggestion.name;
                        document
                          .getElementById("suggestions")
                          .classList.add("hidden");
                        navigate(`/product/${suggestion._id}`);
                      }}
                    >
                      {suggestion.name}
                    </li>
                  ))}
                </ul>
              </div>
            </form>
            <button
              type="button"
              className="relative rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
            >
              <span className="absolute -inset-1.5" />
              <span className="sr-only">View notifications</span>
              <BellIcon aria-hidden="true" className="h-6 w-6" />
            </button>

            <Menu as="div" className="relative ml-3">
              <div>
                <MenuButton className="relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                  <span className="sr-only">Open user menu</span>
                  <img
                    alt="Profile"
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    className="h-8 w-8 rounded-full"
                  />
                </MenuButton>
              </div>
              <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <MenuItem>
                  {({ active }) => (
                    <Link
                      to="/"
                      className={classNames(
                        active ? "bg-gray-100" : "",
                        "block px-4 py-2 text-sm text-gray-700"
                      )}
                    >
                      Home
                    </Link>
                  )}
                </MenuItem>
                <MenuItem>
                  {({ active }) => (
                    <Link
                      to="/about"
                      className={classNames(
                        active ? "bg-gray-100" : "",
                        "block px-4 py-2 text-sm text-gray-700"
                      )}
                    >
                      About
                    </Link>
                  )}
                </MenuItem>
                <MenuItem>
                  {({ active }) =>
                    !isLoggedIn ? (
                      <Link
                        to="/login"
                        className={classNames(
                          active ? "bg-gray-100" : "",
                          "block px-4 py-2 text-sm text-gray-700"
                        )}
                        onClick={handleLogin}
                      >
                        Log in
                      </Link>
                    ) : (
                      <div
                        className={classNames(
                          active ? "bg-gray-100" : "",
                          "block px-4 py-2 text-sm text-gray-700"
                        )}
                        onClick={handleLogout}
                      >
                        Logout
                      </div>
                    )
                  }
                </MenuItem>
              </Menu.Items>
            </Menu>
          </div>
        </div>
      </div>

      <DisclosurePanel className="min-h-screen lg:hidden px-4">
        <div className="space-y-1 px-2 pb-3 pt-2">
          {navigation.map((item) => (
            <DisclosureButton
              key={item.name}
              as={Link}
              to={item.href}
              aria-current={item.current ? "page" : undefined}
              className={classNames(
                item.current
                  ? "bg-gray-900 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white",
                "block rounded-md px-3 py-2 text-base font-medium"
              )}
            >
              {item.name}
            </DisclosureButton>
          ))}
        </div>
      </DisclosurePanel>
    </Disclosure>
  );
}

export default Navbar;
