import { useContext, useEffect, useState } from "react";

import type { AssetExtended } from "@meshsdk/common";
import { POLICY_ID_LENGTH, resolveFingerprint } from "@meshsdk/common";

import { WalletContext } from "../contexts";

export const useAssets = () => {
  const [assets, setAssets] = useState<AssetExtended[]>();
  const { hasConnectedWallet, connectedWalletInstance } =
    useContext(WalletContext);

  useEffect(() => {
    if (hasConnectedWallet) {
      connectedWalletInstance.getBalanceMesh().then((balance) => {
        const derived = balance
          .filter((v) => v.unit !== "lovelace")
          .map((v) => {
            const policyId = v.unit.slice(0, POLICY_ID_LENGTH);
            const assetName = v.unit.slice(POLICY_ID_LENGTH);
            const fingerprint = resolveFingerprint(policyId, assetName);
            return { unit: v.unit, policyId, assetName, fingerprint, quantity: v.quantity };
          });
        setAssets(derived);
      });
    }
  }, [hasConnectedWallet, connectedWalletInstance]);

  return assets;
};
