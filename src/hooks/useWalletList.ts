import { useEffect, useState } from "react";

import type { Wallet } from "@meshsdk/common";
import { MeshCardanoBrowserWallet } from "@meshsdk/wallet";

export const useWalletList = ({
  injectFn = undefined,
}: {
  injectFn?: () => Promise<void>;
} = {}) => {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  useEffect(() => {
    async function get() {
      if (injectFn) {
        await injectFn();
      }
      setWallets(MeshCardanoBrowserWallet.getInstalledWallets());
    }
    get();
  }, []);

  return wallets;
};
