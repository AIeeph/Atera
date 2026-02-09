import { Router } from "express";
import { getGames, createGame, updateGame, deleteGame } from "../controllers/gameController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = Router();

router.get("/", getGames);
router.post("/", authMiddleware, adminMiddleware, createGame);
router.put("/:id", authMiddleware, adminMiddleware, updateGame);
router.delete("/:id", authMiddleware, adminMiddleware, deleteGame);

export default router;
