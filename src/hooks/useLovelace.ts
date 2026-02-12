import { useContext, useEffect, useMemo, useRef, useState } from "react";

import { WalletContext } from "../contexts";

export const useLovelace = () => {
  const [lovelace, setLovelace] = useState<string>();
  const { hasConnectedWallet, connectedWalletInstance } =
    useContext(WalletContext);
  const hasFetchedLovelace = useRef(false);

  useEffect(() => {
    async function getLovelace() {
      if (hasConnectedWallet && !hasFetchedLovelace.current) {
        const balance = await connectedWalletInstance.getBalanceMesh();
        const lovelaceAmount = balance.find((v) => v.unit === "lovelace")?.quantity ?? "0";
        setLovelace(lovelaceAmount);
        hasFetchedLovelace.current = true;
      }
    }
    getLovelace();
  }, [hasConnectedWallet, connectedWalletInstance]);

  const _lovelace = useMemo(() => {
    return lovelace;
  }, [lovelace]);

  return _lovelace;
};
