/// Please Note That, this is your basic test to test your knowledge about the kaspa.

const testApi = async (req, res) => {
  res.status(200).json({ status: true, message: "The Api is Working" });
};
/// You have to generate wallet from Mnemonic passed in the Body
const generateWalletFromMnemonic = async (req, res) => {
  const { mnemonic } = req.body;
  res.status(200).json({ status: true, message: "Complete The task" });
};

/// Generate New/Fresh Wallet for Kaspa
const generateWallet = async (req, res, next) => {
  res.status(200).json({ status: true, message: "Complete The task" });
};

/// use The Wallet generated in the Second Task , and send Kaspa To Another Kaspa Address
/// The fee should be as minimum as possible , and the amount to send should be as small as it can be
const sendKaspa = async (req, res) => {
  const { amount, to } = req.body;
  res.status(200).json({ status: true, message: "Complete The task" });
};

module.exports = {
  testApi,
  generateWallet,
  generateWalletFromMnemonic,
  sendKaspa,
};
