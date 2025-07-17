import React, { useEffect, useState } from 'react';
import SweetCard from './SweetCard';
import axios from 'axios';

const SweetInventory = () => {
  const [sweets, setSweets] = useState([]);
  const [query, setQuery] = useState("");

  const fetchSweets = async () => {
    const res = await axios.get(`http://localhost:5000/search?q=${query}`);
    setSweets(res.data);
  };

  useEffect(() => {
    fetchSweets();
  }, [query]);

  return (
    <>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by name/category/price"
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="inventory-grid">
        {sweets.map(sweet => (
          <SweetCard key={sweet._id} sweet={sweet} />
        ))}
      </div>
    </>
  );
};

export default SweetInventory;
