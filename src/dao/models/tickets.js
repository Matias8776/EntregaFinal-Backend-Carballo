import mongoose from 'mongoose';

const ticketsCollection = 'tickets';
const ticketsSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  purchaser: { type: String, required: true },
  purchase_datetime: { type: Date, default: Date.now() },
  products: { type: Array, required: true },
  amount: { type: Number, required: true }
});
const ticketsModel = mongoose.model(ticketsCollection, ticketsSchema);

export default ticketsModel;
