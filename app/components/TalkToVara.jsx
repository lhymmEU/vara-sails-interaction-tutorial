"use client";

import { useState, useEffect } from "react";
import { GearApi } from "@gear-js/api";
import {
  web3Enable,
  web3Accounts,
  web3FromSource,
} from "@polkadot/extension-dapp";
import { Program } from "@/lib";

const VNFT_PROGRAM_ID =
  "0xbb164a2a6f53a17cf06624621a7d94d41526e3806616332a02ccfe4d90d69ed8";

const TalkToVara = () => {
  const [gearApi, setGearApi] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isConnected, setConnected] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const connectToGearApi = async () => {
        try {
          const api = await GearApi.create({
            providerAddress: "wss://testnet.vara.network",
          });
          setGearApi(api);
          console.log("Connected to Vara testnet");
        } catch (error) {
          console.error("Failed to connect to Gear API:", error);
        }
      };

      connectToGearApi();
    }
  }, []);

  const connectWallet = async () => {
    try {
      const extensions = await web3Enable("My Gear App");
      if (extensions.length === 0) {
        console.log("No extension found");
        return;
      }

      const allAccounts = await web3Accounts();
      setAccounts(allAccounts);

      if (allAccounts.length > 0) {
        setSelectedAccount(allAccounts[0]);
        setConnected(true);
        console.log("Wallet connected:", allAccounts[0].address);
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  const mintExample = async () => {
    const to =
      "0x726db3a23fc98b838572bfcc641776dd9f510071f400d77fac526266c0fcdca7";
    const token_metadata = {
      name: "I The Magician, upright",
      description: "this is a sample answer",
      media: "test_ipfs_url",
      reference: "test_json",
    };
    const vnft = new Program(gearApi, VNFT_PROGRAM_ID);
    const transaction = vnft.vnft.mint(to, token_metadata);
    const injector = await web3FromSource(selectedAccount.meta.source);
    transaction.withAccount(selectedAccount.address, {
      signer: injector.signer,
    });
    await transaction.calculateGas();
    const { msgId, blockHash, response } = await transaction.signAndSend();
    await response();
    console.log("VNFT minted successfully");
  };

  const handleAccountChange = (event) => {
    const account = accounts.find((acc) => acc.address === event.target.value);
    setSelectedAccount(account);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">
          Connect to Vara Network
        </h1>

        <button
          onClick={connectWallet}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors mb-4"
        >
          Connect Wallet
        </button>

        {accounts.length > 0 && (
          <div className="mb-4">
            <label
              htmlFor="account-select"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Select Account
            </label>
            <select
              id="account-select"
              onChange={handleAccountChange}
              value={selectedAccount?.address || ""}
              className="w-full border border-gray-300 p-2 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              {accounts.map((account) => (
                <option key={account.address} value={account.address}>
                  {account.meta.name || account.address}
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedAccount && (
          <p className="text-sm text-gray-600">
            Connected Account:{" "}
            <span className="font-semibold text-gray-800">
              {selectedAccount.address}
            </span>
          </p>
        )}

        {gearApi && (
          <p className="mt-4 text-sm text-green-600">
            Gear API connected successfully!
          </p>
        )}

        <button
          onClick={mintExample}
          className="w-full bg-green-500 text-white py-2 px-4 mt-6 rounded-md hover:bg-green-600 transition-colors"
        >
          Mint Example
        </button>
      </div>
    </div>
  );
};

export default TalkToVara;