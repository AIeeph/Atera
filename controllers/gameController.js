import Game from "../models/Game.js";

export const getGames = async (req, res) => {
  try {
    const games = await Game.find().sort({ createdAt: -1 });
    return res.status(200).json(games);
  } catch {
    return res.status(500).json({ message: "Failed to fetch games." });
  }
};

export const createGame = async (req, res) => {
  try {
    const { title, price, description } = req.body || {};

    if (!title || price == null || !description) {
      return res.status(400).json({ message: "Title, price, and description are required." });
    }

    const game = await Game.create({
      title: String(title).trim(),
      price: Number(price),
      description: String(description).trim()
    });

    return res.status(201).json(game);
  } catch {
    return res.status(500).json({ message: "Failed to create game." });
  }
};

export const updateGame = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, price, description } = req.body || {};

    const update = {};
    if (title != null) update.title = String(title).trim();
    if (price != null) update.price = Number(price);
    if (description != null) update.description = String(description).trim();

    const game = await Game.findByIdAndUpdate(id, update, { new: true });
    if (!game) {
      return res.status(404).json({ message: "Game not found." });
    }

    return res.status(200).json(game);
  } catch {
    return res.status(500).json({ message: "Failed to update game." });
  }
};

export const deleteGame = async (req, res) => {
  try {
    const { id } = req.params;
    const game = await Game.findByIdAndDelete(id);
    if (!game) {
      return res.status(404).json({ message: "Game not found." });
    }
    return res.status(204).send();
  } catch {
    return res.status(500).json({ message: "Failed to delete game." });
  }
};
