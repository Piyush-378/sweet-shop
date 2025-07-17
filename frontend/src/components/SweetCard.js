import React from 'react';

const SweetCard = ({ sweet }) => {
  return (
    <div className="sweet-card">
      <div className="sweet-header">
        <div className="sweet-name">{sweet.name}</div>
        <div className="sweet-id">ID: {sweet._id}</div>
      </div>
      <div className="sweet-category">{sweet.category}</div>
      <div className="sweet-details">
        <div className="sweet-price">₹{sweet.price}</div>
        <div className="sweet-quantity">Qty: {sweet.quantity}</div>
      </div>
      <div className="sweet-actions">
        <button className="btn btn-small">Buy</button>
        <button className="btn btn-danger btn-small">Restock</button>
      </div>
    </div>
  );
};

export default SweetCard;
