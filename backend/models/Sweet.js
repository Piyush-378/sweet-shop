import { Schema, model } from "mongoose";

const sweetSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['Chocolate', 'Milk', 'Dry Fruit', 'Traditional', "Nut-Based", "Milk-Based", "Vegetable-Based", "Other"],
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
});

export default model("Sweet", sweetSchema);
