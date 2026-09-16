import express from "express";
import { getCurrentForecast } from "../controllers/freightForecastController.js";

const router = express.Router();

router.get("/current", getCurrentForecast);

export default router;