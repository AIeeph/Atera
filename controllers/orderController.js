import Order from "../models/Order.js";
import Game from "../models/Game.js";

export const createOrder = async (req, res) => {
  try {
    const { game_id } = req.body || {};

    if (!game_id) {
      return res.status(400).json({ message: "game_id is required." });
    }

    const game = await Game.findById(game_id);
    if (!game) {
      return res.status(404).json({ message: "Game not found." });
    }

    const order = await Order.create({
      user_id: req.user.id,
      game_id: game._id
    });

    return res.status(201).json(order);
  } catch {
    return res.status(500).json({ message: "Failed to create order." });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user_id: req.user.id })
      .sort({ created_at: -1 })
      .populate("game_id", "title price description");

    return res.status(200).json(orders);
  } catch {
    return res.status(500).json({ message: "Failed to fetch orders." });
  }
};
