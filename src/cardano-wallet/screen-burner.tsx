import { useEffect, useState } from "react";

import { IFetcher, ISubmitter, generateMnemonic } from "@meshsdk/common";
import { MeshCardanoHeadlessWallet, AddressType } from "@meshsdk/wallet";

import { Button } from "../common/button";
import { useWallet } from "../hooks";
import { screens } from "./data";

const localstoragekey = "mesh-burnerwallet";

export default function ScreenBurner({
  networkId,
  provider,
  setOpen,
}: {
  networkId: 0 | 1;
  provider: IFetcher & ISubmitter;
  setOpen: (open: boolean) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [hasKeyInStorage, setHasKeyInStorage] = useState(false);
  const { setWallet } = useWallet();

  function getKeyFromStorage() {
    return localStorage.getItem(localstoragekey);
  }

  useEffect(() => {
    const key = getKeyFromStorage();
    if (key) {
      setHasKeyInStorage(true);
    }
  }, []);

  async function createWalletFromMnemonic(mnemonic: string[]) {
    const wallet = await MeshCardanoHeadlessWallet.fromMnemonic({
      mnemonic,
      networkId: networkId,
      walletAddressType: AddressType.Base,
      fetcher: provider,
      submitter: provider,
    });

    if (!hasKeyInStorage) {
      localStorage.setItem(localstoragekey, mnemonic.join(" "));
    }

    setWallet(wallet, screens.burner.title);
    setLoading(false);
    setOpen(false);
  }

  async function handleRestoreWallet() {
    setLoading(true);
    const stored = getKeyFromStorage();
    if (stored) {
      if (stored.includes(" ")) {
        await createWalletFromMnemonic(stored.split(" "));
      } else {
        // Legacy bech32 root key format
        const wallet = await MeshCardanoHeadlessWallet.fromBip32Root({
          bech32: stored,
          networkId: networkId,
          walletAddressType: AddressType.Base,
          fetcher: provider,
          submitter: provider,
        });
        setWallet(wallet, screens.burner.title);
        setLoading(false);
        setOpen(false);
      }
    }
  }

  async function handleCreateWallet() {
    setLoading(true);
    const mnemonic = generateMnemonic(256).split(" ");
    await createWalletFromMnemonic(mnemonic);
  }

  return (
    <div className="mesh-flex mesh-flex-row mesh-flex-gap-4 mesh-items-center mesh-justify-center">
      {loading ? (
        <>Setting up wallet...</>
      ) : (
        <>
          {hasKeyInStorage && (
            <Button
              variant="outline"
              onClick={() => {
                handleRestoreWallet();
              }}
              disabled={loading}
            >
              Restore wallet
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => {
              handleCreateWallet();
            }}
            disabled={loading}
          >
            Create wallet
          </Button>
        </>
      )}
    </div>
  );
}
