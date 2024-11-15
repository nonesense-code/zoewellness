import React from "react";
import Table from "./Table";

function Home({ cart, setCart, id, setId }) {
  return (
    <div className="flex items-center justify-center bg-gray-900">
      <Table cart={cart} setCart={setCart} />
    </div>
  );
}

export default Home;
