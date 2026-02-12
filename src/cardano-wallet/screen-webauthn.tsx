import { useState } from "react";

import { IFetcher, ISubmitter } from "@meshsdk/common";
import { MeshCardanoHeadlessWallet, AddressType } from "@meshsdk/wallet";

import { Button } from "../common/button";
import { Input } from "../common/input";
import { Label } from "../common/label";
import { useWallet } from "../hooks";
import { screens } from "./data";

export default function ScreenWebauthn({
  url,
  networkId,
  provider,
  setOpen,
}: {
  url: string;
  networkId: 0 | 1;
  provider: IFetcher & ISubmitter;
  setOpen: (open: boolean) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const { setWallet } = useWallet();

  async function createWallet(root: string) {
    const wallet = await MeshCardanoHeadlessWallet.fromBip32Root({
      bech32: root,
      networkId: networkId,
      walletAddressType: AddressType.Base,
      fetcher: provider,
      submitter: provider,
    });
    setWallet(wallet, screens.webauthn.title);
    setLoading(false);
    setOpen(false);
  }

  async function handleConnect() {
    setLoading(true);
    // TODO: The `connect` function was removed from @meshsdk/wallet v2.
    // WebAuthn wallet derivation needs to be re-implemented using
    // the WebAuthn API directly or via a compatible package.
    const connectModule = await import("@meshsdk/wallet" as any);
    if (typeof connectModule.connect === "function") {
      const res = await connectModule.connect({ username: userName, password, serverUrl: url });
      if (res.success && res.wallet) {
        await createWallet(res.wallet.bech32PrivateKey);
      }
    } else {
      console.error("WebAuthn connect is not available in this version of @meshsdk/wallet");
      setLoading(false);
    }
  }

  return (
    <div className="mesh-flex mesh-flex-row mesh-flex-gap-4 mesh-items-center mesh-justify-center">
      {loading ? (
        <>Connecting wallet...</>
      ) : (
        <>
          <div className="mesh-flex mesh-flex-col mesh-gap-6 mesh-w-full mesh-mx-8">
            <div className="mesh-grid mesh-gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="username"
                placeholder="adalovelace"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
              <p className="mesh-text-gray-500 mesh-text-xs">
                Unique to the application you are connecting.
              </p>
            </div>
            <div className="mesh-grid mesh-gap-2">
              <div className="mesh-flex mesh-items-center">
                <Label htmlFor="password">Unique Code</Label>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <p className="mesh-text-gray-500 mesh-text-xs">
                Additional security to derive your wallet.
              </p>
            </div>
            <Button
              className="mesh-w-full"
              onClick={() => handleConnect()}
              disabled={!userName || userName.length < 6}
            >
              Connect
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
