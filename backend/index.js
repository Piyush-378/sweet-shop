import express, { json } from "express";
import mongoose from "mongoose";
// import sweetRoutes from "./routes/sweetRoutes";
import Sweet from "./models/Sweet.js";
import cors from "cors";
import dotenv from "dotenv";
// import { MONGO_URI, PORT } from './.env'

dotenv.config();

const app = express();
app.use(cors());
app.use(json());

// app.use("/api/sweets", sweetRoutes);

const port = process.env.PORT || 5000;

app.get('/api/sweets', async (req, res) => {
  try {
    const sweets = await Sweet.find();
    res.json(sweets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new sweet
app.post('/api/sweets', async (req, res) => {
  try {
    const sweet = new Sweet(req.body);
    await sweet.save();
    res.status(201).json(sweet);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE a sweet by ID
app.delete('/api/sweets/:id', async (req, res) => {
  try {
    const deleted = await Sweet.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Sweet not found' });
    res.json({ message: 'Sweet deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH - Purchase sweet
app.patch('/api/sweets/:id/purchase', async (req, res) => {
  const { quantity } = req.body;
  const purchaseQty = parseInt(quantity);

  if (!purchaseQty || purchaseQty <= 0) {
    return res.status(400).json({ message: 'Invalid quantity' });
  }

  try {
    const sweet = await Sweet.findById(req.params.id);
    if (!sweet) return res.status(404).json({ message: 'Sweet not found' });

    if (sweet.quantity === 0) {
      return res.status(400).json({ message: 'Item is out of stock' });
    }

    if (purchaseQty > sweet.quantity) {
      return res.status(400).json({ message: `Only ${sweet.quantity} left in stock` });
    }

    sweet.quantity -= purchaseQty;
    await sweet.save();

    res.json({ message: `${purchaseQty} purchased successfully`, sweet });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH - Restock sweet
app.patch('/api/sweets/:id/restock', async (req, res) => {
  try {
    const quantity = parseInt(req.body.quantity);
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Invalid quantity' });
    }

    const sweet = await Sweet.findById(req.params.id);
    if (!sweet) return res.status(404).json({ message: 'Sweet not found' });

    sweet.quantity += quantity;
    await sweet.save();
    res.json({ message: 'Restocked successfully', sweet });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


const start = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://PiyushChauhan:piyushchauhan100@cluster0.ivsaoi2.mongodb.net/"
    );
    app.listen(port, () => console.log(`Server running on port ${port}`));
  } catch (error) {
    console.log(error);
  }
};

start();