import express from "express";
import {
  testApi,
  generateWallet,
  checkBalance,
  sendKaspa,
} from "../controllers/kaspa_controller.js";

const router = express.Router();

router.get("/test", testApi);
router.post("/generateWallet", generateWallet);
router.post("/checkBalance", checkBalance);
router.post("/sendKaspa", sendKaspa);

export default router;
