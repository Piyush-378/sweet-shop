import React, { useState, useEffect } from "react";
import axios from "axios";
import "./styles/App.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE = "http://localhost:5000/api/sweets";

const App = () => {
  const [sweets, setSweets] = useState([]);
  const [form, setForm] = useState({
    name: "",
    category: "",
    price: "",
    quantity: "",
  });
  const [message, setMessage] = useState({ error: "", success: "" });
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("name-asc");
  const [modal, setModal] = useState({
    type: null, // 'purchase' or 'restock'
    sweet: null, // the sweet item being modified
    quantity: "", // input quantity
    error: "", // error message
    isLoading: false, // loading state
  });

  const fetchSweets = async () => {
    try {
      const res = await fetch(API_BASE);
      const data = await res.json();
      setSweets(data);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  useEffect(() => {
    fetchSweets();
  }, []);

  const handleInput = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success("Sweet added successfully!");
      setForm({ name: "", category: "", price: "", quantity: "" });
      fetchSweets();
    } else {
      console.error("Add error:", data);
      toast.error(data.message || "Error adding sweet.");
    }
  } catch (err) {
    console.error("Network error:", err);
    toast.error("Server error. Could not add sweet.");
  }
};


  const handleSort = (e) => setSort(e.target.value);

  const sortedSweets = [...sweets].sort((a, b) => {
    if (sort === "name-asc") return a.name.localeCompare(b.name);
    if (sort === "name-desc") return b.name.localeCompare(a.name);
    if (sort === "price-asc") return a.price - b.price;
    if (sort === "price-desc") return b.price - a.price;
    if (sort === "quantity-asc") return a.quantity - b.quantity;
    if (sort === "quantity-desc") return b.quantity - a.quantity;
    if (sort === "category") return a.category.localeCompare(b.category);
    return 0;
  });

  const filteredSweets = sortedSweets.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase()) ||
      s.price.toString().includes(search)
  );

  const openPurchaseModal = (sweet) => {
    setModal({
      type: "purchase",
      sweet,
      quantity: "",
      error: "",
      isLoading: false,
    });
  };

  const openRestockModal = (sweet) => {
    setModal({
      type: "restock",
      sweet,
      quantity: "",
      error: "",
      isLoading: false,
    });
  };

  const closeModal = () => {
    setModal({
      type: null,
      sweet: null,
      quantity: "",
      error: "",
      isLoading: false,
    });
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Item deleted");
        fetchSweets();
      } else {
        toast.error(data.message || "Error deleting item");
      }
    } catch (err) {
      toast.error("Server error");
    }
  };

  const handlePurchase = async () => {
    const quantity = parseInt(modal.quantity);

    if (!quantity || quantity <= 0) {
      setModal((prev) => ({ ...prev, error: "Please enter a valid quantity" }));
      return;
    }

    if (quantity > modal.sweet.quantity) {
      setModal((prev) => ({ ...prev, error: "Not enough quantity available" }));
      return;
    }

    setModal((prev) => ({ ...prev, isLoading: true }));

    try {
      await axios.patch(`/api/sweets/${modal.sweet._id}/purchase`, { quantity });
      await fetchSweets(); // Refresh the list
      closeModal();
    } catch (error) {
      setModal((prev) => ({
        ...prev,
        error: error.response?.data?.message || "Purchase failed",
        isLoading: false,
      }));
    }
  };

  const handleRestock = async () => {
    const quantity = parseInt(modal.quantity);

    if (!quantity || quantity <= 0) {
      setModal((prev) => ({ ...prev, error: "Please enter a valid quantity" }));
      return;
    }

    setModal((prev) => ({ ...prev, isLoading: true }));

    try {
      await axios.patch(`/api/sweets/${modal.sweet._id}/restock`, { quantity });
      await fetchSweets(); // Refresh the list
      closeModal();
    } catch (error) {
      setModal((prev) => ({
        ...prev,
        error: error.response?.data?.message || "Restock failed",
        isLoading: false,
      }));
    }
  };

  const totalValue = sweets.reduce(
    (total, s) => total + s.price * s.quantity,
    0
  );
  const lowStockCount = sweets.filter((s) => s.quantity < 10).length;

  return (
    <div className="container">
      <ToastContainer />
      <div className="header">
        <h1>🍭 Sweet Shop Management</h1>
        <p>Manage your sweet inventory with ease</p>
      </div>

      <div className="stats">
        <div className="stat-card">
          <div className="stat-number">{sweets.length}</div>
          <div className="stat-label">Total Sweets</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">₹{totalValue}</div>
          <div className="stat-label">Total Value</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{lowStockCount}</div>
          <div className="stat-label">Low Stock Items</div>
        </div>
      </div>

      <div className="dashboard">
        <div className="card">
          <h2>Add New Sweet</h2>
          {message.error && (
            <div className="error-message">{message.error}</div>
          )}
          {message.success && (
            <div className="success-message">{message.success}</div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Sweet Name</label>
              <input
                type="text"
                id="name"
                value={form.name}
                onChange={handleInput}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                value={form.category}
                onChange={handleInput}
                required
              >
                <option value="">Select Category</option>
                <option value="Nut-Based">Nut-Based</option>
                <option value="Dry Fruit">Dry Fruit</option>
                <option value="Milk-Based">Milk-Based</option>
                <option value="Vegetable-Based">
                  Vegetable-Based
                </option>
                <option value="Fruit-Based">
                  Fruit-Based
                </option>
                <option value="Chocolate">Chocolate</option>
                <option value="Traditional">Traditional</option>
                <option value="Candy">Candy</option>
                <option value="Pastry">Pastry</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="price">Price (₹)</label>
              <input
                type="number"
                id="price"
                value={form.price}
                onChange={handleInput}
                min="0"
                step="0.01"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="quantity">Quantity</label>
              <input
                type="number"
                id="quantity"
                value={form.quantity}
                onChange={handleInput}
                min="0"
                required
              />
            </div>
            <button type="submit" className="btn">
              Add Sweet
            </button>
          </form>
        </div>

        <div className="card">
          <h2>Inventory Management</h2>
          <div className="controls-bar">
            <div className="search-section">
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button
                className="btn"
                onClick={() => {
                  /* optional manual search trigger */
                }}
              >
                Search
              </button>
              <button className="btn" onClick={() => setSearch("")}>
                Clear
              </button>
            </div>
            <div className="sort-section">
              <label htmlFor="sortSelect">Sort by:</label>
              <select id="sortSelect" value={sort} onChange={handleSort}>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="price-asc">Price (Low to High)</option>
                <option value="price-desc">Price (High to Low)</option>
                <option value="quantity-asc">Stock (Low to High)</option>
                <option value="quantity-desc">Stock (High to Low)</option>
                <option value="category">Category</option>
              </select>
            </div>
          </div>

          {/* <div className="inventory-grid">
            {filteredSweets.map((sweet) => (
              <div className="sweet-card" key={sweet._id}>
                <h3>{sweet.name}</h3>
                <p>
                  <strong>Category:</strong> {sweet.category}
                </p>
                <p>
                  <strong>Price:</strong> ₹{sweet.price}
                </p>
                <p>
                  <strong>Quantity:</strong> {sweet.quantity}
                </p>
                <div className="sweet-actions">
                  <button
                    className="btn-small btn"
                    onClick={() => openModal("purchase", sweet)}
                  >
                    Purchase
                  </button>
                  <button
                    className="btn-small btn"
                    onClick={() => openModal("restock", sweet)}
                  >
                    Restock
                  </button>
                  <button
                    className="btn-small btn btn-danger"
                    onClick={() => handleDelete(sweet._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div> */}

          <div className="inventory-grid">
            {filteredSweets.map((sweet) => (
              <div key={sweet._id} className="sweet-card">
                <h3>{sweet.name}</h3>
                <p>Category: {sweet.category}</p>
                <p>Price: ₹{sweet.price}</p>
                <p>Quantity: {sweet.quantity}</p>
                <div className="sweet-actions">
                  <button
                    className="btn-small btn"
                    onClick={() => openPurchaseModal(sweet)}
                    disabled={sweet.quantity <= 0}
                  >
                    Purchase
                  </button>
                  <button
                    className="btn-small btn"
                    onClick={() => openRestockModal(sweet)}
                  >
                    Restock
                  </button>
                  <button
                    className="btn-small btn btn-danger"
                    onClick={() => handleDelete(sweet._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {modal.type && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>
              {modal.type === "purchase" ? "Purchase Sweet" : "Restock Sweet"}
            </h2>
            <p>
              <strong>{modal.sweet?.name}</strong>
              (Current: {modal.sweet?.quantity})
            </p>
            <input
              type="number"
              min={modal.type === "purchase" ? 1 : 1}
              max={
                modal.type === "purchase" ? modal.sweet?.quantity : undefined
              }
              placeholder={`Enter ${
                modal.type === "purchase" ? "purchase" : "restock"
              } quantity`}
              value={modal.quantity}
              onChange={(e) =>
                setModal((prev) => ({
                  ...prev,
                  quantity: e.target.value,
                  error: "",
                }))
              }
            />
            {modal.error && (
              <div className="error-message" role="alert">
                {modal.error}
              </div>
            )}
            <div className="modal-actions">
              <button
                className="btn"
                onClick={
                  modal.type === "purchase" ? handlePurchase : handleRestock
                }
                disabled={!modal.quantity || modal.isLoading}
              >
                {modal.isLoading ? "Processing..." : "Confirm"}
              </button>
              <button
                className="btn btn-danger"
                onClick={closeModal}
                disabled={modal.isLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;