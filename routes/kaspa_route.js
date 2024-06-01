const express = require("express");
const {
  generateWallet,
  generateWalletFromMnemonic,
  sendKaspa,
  testApi,
} = require("../controllers/kaspa_controller");

const router = express.Router();

router.get("/test", testApi);
router.post("/generateWallet", generateWallet);
router.post("/generateWalletFromMnemonic", generateWalletFromMnemonic);
router.post("/sendKaspa", sendKaspa);

module.exports = router;
