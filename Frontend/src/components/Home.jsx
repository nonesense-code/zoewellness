import React from "react";
import Table from "./Table";

function Home({ cart, setCart, id, setId }) {
  return (
    <div className="dark:bg-gray-900 mt-6 min-h-screen flex items-start justify-center bg-gray-50">
      <div className="w-full max-w-7xl p-4">
        <Table cart={cart} setCart={setCart} />
      </div>
    </div>
  );
}

export default Home;
