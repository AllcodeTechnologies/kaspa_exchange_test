import axios from "axios";
import { Wallet, initKaspaFramework } from "@kaspa/wallet";
import pkg from "@kaspa/core-lib";
import createHttpError from "http-errors";
let { PrivateKey, PublicKey, Address, Transaction, crypto, Script } = pkg;

const testApi = async (req, res) => {
  res.status(200).json({
    status: true,
    message: "The Api is Working",
  });
};

const generateWallet = async (req, res, next) => {
  try {
    await initKaspaFramework();
    const randomSecretKey = new PrivateKey();
    console.info("randomSecretKey\t\t\t\t\t\t\t", randomSecretKey.toString());
    const randomSecretKey_toAddress = randomSecretKey
      .toAddress("kaspa")
      .toString();
    console.info(
      'randomSecretKey.toAddress("kaspa")\t\t\t\t',
      randomSecretKey_toAddress
    );
    const randomSecretKey_toPublicKey = randomSecretKey
      .toPublicKey()
      .toString();
    console.info(
      "randomSecretKey.toPublicKey().toString()\t\t\t",
      randomSecretKey_toPublicKey
    );
    const randomSecretKey_toPublicKey_toAddress = randomSecretKey
      .toPublicKey()
      .toAddress("kaspa")
      .toString();
    console.info(
      'randomSecretKey.toPublicKey().toAddress("kaspa").toString()\t',
      randomSecretKey_toPublicKey_toAddress
    );

    // From BIP 0340
    const sk = new PrivateKey(randomSecretKey);
    const pk = sk.toPublicKey();

    // Returns the x-coord hex representation of the public key
    console.info(pk.toString());
    console.info(pk.toObject());

    res.status(200).json({
      status: true,
      randomSecretKey: randomSecretKey,
      randomSecretKey_toAddress: randomSecretKey_toAddress,
      randomSecretKey_toPublicKey: randomSecretKey_toPublicKey,
      randomSecretKey_toPublicKey_toAddress:
        randomSecretKey_toPublicKey_toAddress,
      sk: sk,
      pk: pk,
    });
  } catch (e) {
    res.status(500).json({
      status: true,
      message: e.message,
    });
  }
};
const checkBalance = async (req, res, next) => {
  try {
    const sk = new PrivateKey(
      "907248b9876c36622931f76f96046b5ccd64e3059fec2d25c78e804c48af49b"
    );
    const pk = sk.toPublicKey();
    const xCoordHex = pk.toObject().x;
    const yCoordHex = pk.toObject().y;
    const fullDERRepresentation = "04" + xCoordHex + yCoordHex;
    const kaspaAddress = pk.toAddress("kaspa").toCashAddress();
    const { data: utxos } = await axios.get(
      `https://api.kaspa.org/addresses/${kaspaAddress}/utxos`
    );
    console.info(utxos);

    const amount = sumAmounts(utxos);
    res.status(200).json({
      status: true,
      utxos_count: utxos.length,
      amount: `${(amount * 0.00000001).toFixed(8)} KAS`,
      utxos: utxos,
    });
  } catch (e) {
    return next(createHttpError(500, e.message));
  }
};
function sumAmounts(utxos) {
  return utxos.reduce(
    (total, utxo) => total + parseInt(utxo.utxoEntry.amount),
    0
  );
}
/// This is Your Task, You have to work on This Send Kaspa Api,
/// Currently it is working but not for all the Case. May be Sometings Fee is not Matching or I dont know whats going on.
/// I dont know how you gonna do it, but i just need an api to transfer Kaspa Coin From my Wallet to Another Kaspa Address. But I should be able to send less than 0.1 Kaspa. I want to send .009 KAsPa
const sendKaspa = async (req, res) => {
  try {
    const { amount, to } = req.body;
    const amountToBeSent = Number(amount);
    const sk = new PrivateKey(
      "907248b9876c36622931f76f96046b5ccd64e3059fec2d25c78e804c48af49b"
    );
    const pk = sk.toPublicKey();
    // const xCoordHex = pk.toObject().x;
    //const yCoordHex = pk.toObject().y;
    //const fullDERRepresentation = "04" + xCoordHex + yCoordHex;
    const kaspaAddress = pk.toAddress("kaspa").toCashAddress(); // Should be kaspa:qr0lr4ml9fn3chekrqmjdkergxl93l4wrk3dankcgvjq776s9wn9jkdskewva
    const highFee = 11277;
    const lowFee = 2069;
    console.info(kaspaAddress);
    console.info("--- Getting UTXOs from API");
    const { data: utxos } = await axios.get(
      `https://api.kaspa.org/addresses/${kaspaAddress}/utxos`
    );
    //console.info(utxos);
    let utxosInAscending = utxos.sort(
      (a, b) => a.utxoEntry.amount - b.utxoEntry.amount
    );
    let selectedUtxo = null;

    for (const utxo of utxosInAscending) {
      // We need to work with at least 0.001 KAS
      console.log(`Amount in Wallet- ${utxo.utxoEntry.amount},`);

      if (utxo.utxoEntry.amount >= amountToBeSent + highFee) {
        selectedUtxo = utxo;
        break;
      } else {
        console.log(
          `Amount to Send- ${amountToBeSent}, is Less than (Total Needed in Wallet) - ${
            amountToBeSent + highFee
          }, But I have Amount in Wallet only- ${utxo.utxoEntry.amount}`
        );
      }
    }

    if (!selectedUtxo) {
      return res.status(500).json({
        status: false,
        error: `Send at least 0.001 kaspa to ${kaspaAddress} before proceeding with the demo`,
      });
    }

    const tx = new Transaction();
    tx.setVersion(0); // Very important!

    const txInput = new Transaction.Input.PublicKey({
      prevTxId: selectedUtxo.outpoint.transactionId,
      outputIndex: selectedUtxo.outpoint.index,
      script: selectedUtxo.utxoEntry.scriptPublicKey.scriptPublicKey,
      sequenceNumber: 0,
      output: new Transaction.Output({
        script: selectedUtxo.utxoEntry.scriptPublicKey.scriptPublicKey,
        satoshis: Number(selectedUtxo.utxoEntry.amount),
      }),
    });

    const fee = amountToBeSent > 100000000 ? highFee : lowFee;
    const amountToSend = Math.round(Number(amountToBeSent));
    const amountAsChange =
      Number(selectedUtxo.utxoEntry.amount) - amountToSend - fee;

    if (amountAsChange < 0) {
      return res.status(500).json({
        status: false,
        error: "Amount Too High",
      });
    }
    const txOutput = new Transaction.Output({
      script: new Script(new Address(to)).toBuffer().toString("hex"),
      satoshis: amountToSend,
    });

    const txChange = new Transaction.Output({
      script: new Script(new Address(kaspaAddress)).toBuffer().toString("hex"),
      satoshis: amountAsChange,
    });

    tx.addInput(txInput);
    tx.addOutput(txOutput);
    tx.addOutput(txChange);
    const signedInputs = tx.inputs.map((input, index) => {
      const inputSignature = input.getSignatures(
        tx,
        sk,
        0,
        crypto.Signature.SIGHASH_ALL,
        null,
        "schnorr"
      )[0];
      const signature = inputSignature.signature
        .toBuffer("schnorr")
        .toString("hex");

      return {
        previousOutpoint: {
          transactionId: input.prevTxId.toString("hex"),
          index: input.outputIndex,
        },
        signatureScript: `41${signature}01`,
        sequence: input.sequenceNumber,
        sigOpCount: 1,
      };
    });

    // Construct the REST API JSON
    const restApiJson = {
      transaction: {
        version: tx.version,
        inputs: signedInputs,
        outputs: [
          {
            amount: amountToSend,
            scriptPublicKey: {
              version: 0,
              scriptPublicKey: txOutput.script.toBuffer().toString("hex"),
            },
          },
          {
            amount: amountAsChange,
            scriptPublicKey: {
              version: 0,
              scriptPublicKey: txChange.script.toBuffer().toString("hex"),
            },
          },
        ],
        lockTime: 0,
        subnetworkId: "0000000000000000000000000000000000000000",
      },
      allowOrphan: true,
    };

    ///console.info("---- Transaction Success");
    const { data: successTxResponse } = await axios.post(
      `https://api.kaspa.org/transactions`,
      restApiJson
    );

    console.info(successTxResponse);
    res.status(200).json({
      status: true,
      tx: successTxResponse.transactionId,
    });
  } catch (e) {
    console.info("---- Transaction Failed");
    if (e.isAxiosError) {
      console.log(`Axios Error- ${e.response?.data?.error}`);
      res.status(500).json({
        status: false,
        error: e.response?.data?.error || "Some Error Occured",
      });
    } else {
      console.log(`Error - ${e.message}`);
      res.status(500).json({
        status: false,
        error: e.message,
      });
    }
  }
};
export { testApi, generateWallet, checkBalance, sendKaspa };
