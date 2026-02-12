# @meshsdk/react

React component library for Cardano blockchain wallet integration. Provides wallet connection UI components, React hooks for wallet state management, and context providers for the [MeshSDK](https://meshjs.dev/) ecosystem.

**Docs:** [meshjs.dev/react](https://meshjs.dev/react) | **Formats:** ESM + CJS + TypeScript declarations

## Quick Start

```bash
npm install @meshsdk/react @meshsdk/wallet @meshsdk/common
```

```tsx
import { MeshProvider, CardanoWallet } from "@meshsdk/react";
import "@meshsdk/react/styles.css";

function App() {
  return (
    <MeshProvider>
      <CardanoWallet />
    </MeshProvider>
  );
}
```

> All hooks and wallet components **must** be rendered inside a `<MeshProvider>`.
> The CSS import (`styles.css`) is required for component styling.

## Wallet API (v2 — Breaking Changes)

The wallet instance exposed via `useWallet().wallet` is typed as `MeshCardanoBrowserWallet`, which provides **two sets of methods**:

### Base methods (breaking — raw CIP-30 passthrough)

These return the raw data from the browser wallet's CIP-30 API. **This is a breaking change** from v1 where these methods returned human-friendly formats.

| Method | Returns | v1 behavior (old) | v2 behavior (new) |
|--------|---------|--------------------|--------------------|
| `wallet.getChangeAddress()` | `Promise<string>` | bech32 address | **hex address** |
| `wallet.getUsedAddresses()` | `Promise<string[]>` | bech32 addresses | **hex addresses** |
| `wallet.getUnusedAddresses()` | `Promise<string[]>` | bech32 addresses | **hex addresses** |
| `wallet.getRewardAddresses()` | `Promise<string[]>` | bech32 addresses | **hex addresses** |
| `wallet.signTx(tx, partialSign)` | `Promise<string>` | full signed transaction | **witness set CBOR only** |
| `wallet.getBalance()` | `Promise<string>` | `Asset[]` | **CBOR hex string** |
| `wallet.getUtxos()` | `Promise<string[]>` | `UTxO[]` | **CBOR hex strings** |
| `wallet.getCollateral()` | `Promise<string[]>` | `UTxO[]` | **CBOR hex strings** |
| `wallet.signData(addressHex, data)` | `Promise<DataSignature>` | `(payload, address?)` | **address first, required; params swapped** |
| `wallet.getNetworkId()` | `Promise<number>` | unchanged | unchanged |
| `wallet.submitTx(tx)` | `Promise<string>` | unchanged | unchanged |

### Convenience methods (new — human-friendly formats)

These restore the v1 behavior under new explicit method names:

| Method | Returns | Description |
|--------|---------|-------------|
| `wallet.getChangeAddressBech32()` | `Promise<string>` | Change address in bech32 format |
| `wallet.getUsedAddressesBech32()` | `Promise<string[]>` | Used addresses in bech32 format |
| `wallet.getUnusedAddressesBech32()` | `Promise<string[]>` | Unused addresses in bech32 format |
| `wallet.getRewardAddressesBech32()` | `Promise<string[]>` | Reward addresses in bech32 format |
| `wallet.signTxReturnFullTx(tx, partialSign?)` | `Promise<string>` | Sign and return full signed transaction |
| `wallet.getBalanceMesh()` | `Promise<Asset[]>` | Balance as Mesh `Asset[]` objects |
| `wallet.getUtxosMesh()` | `Promise<UTxO[]>` | UTxOs as Mesh `UTxO[]` objects |
| `wallet.getCollateralMesh()` | `Promise<UTxO[]>` | Collateral as Mesh `UTxO[]` objects |

### Migration from v1

| v1 call | v2 equivalent |
|---------|---------------|
| `wallet.getChangeAddress()` (expected bech32) | `wallet.getChangeAddressBech32()` |
| `wallet.getUsedAddresses()` (expected bech32) | `wallet.getUsedAddressesBech32()` |
| `wallet.signTx(tx)` (expected full signed tx) | `wallet.signTxReturnFullTx(tx)` |
| `wallet.signTx(tx, partial, false)` (witness set) | `wallet.signTx(tx, partial)` |
| `wallet.getBalance()` (expected Asset[]) | `wallet.getBalanceMesh()` |
| `wallet.getUtxos()` (expected UTxO[]) | `wallet.getUtxosMesh()` |
| `wallet.getCollateral()` (expected UTxO[]) | `wallet.getCollateralMesh()` |
| `wallet.getLovelace()` | `(await wallet.getBalanceMesh()).find(v => v.unit === "lovelace")?.quantity` |
| `wallet.getAssets()` | Derive from `wallet.getBalanceMesh()` — filter non-lovelace assets |
| `wallet.signData(payload, address?)` | `wallet.signData(address, hexPayload)` — params swapped, address required |
| `BrowserWallet.enable(name)` | `MeshCardanoBrowserWallet.enable(name)` |
| `BrowserWallet.getInstalledWallets()` | `MeshCardanoBrowserWallet.getInstalledWallets()` |
| `new MeshWallet({...key})` | `await MeshCardanoHeadlessWallet.fromMnemonic({...})` or `.fromBip32Root({...})` |

### Removed methods (no v2 equivalent)

These methods were removed from `@meshsdk/wallet` v2 and have no direct replacement:

- `wallet.getDRep()` / `wallet.getPubDRepKey()` — Use raw CIP-95 API
- `wallet.getRegisteredPubStakeKeys()` / `wallet.getUnregisteredPubStakeKeys()` — Use raw CIP-95 API
- `wallet.getExtensions()` — Check raw wallet instance
- `wallet.signTxs(txs, partial)` — Loop with `signTxReturnFullTx()` individually
- `BrowserWallet.getAvailableWallets()` — Use `MeshCardanoBrowserWallet.getInstalledWallets()` (synchronous)
- `BrowserWallet.getSupportedExtensions(name)` — Use `globalThis?.cardano?.[name]?.supportedExtensions`
- `MeshWallet.brew()` — Use `generateMnemonic()` from `@meshsdk/common`

### Internal usage

All hooks and context code in this package use the **convenience methods** internally. The base (breaking) methods are only exposed for consumers who need raw CIP-30 data.

## Class Hierarchy

```
CardanoBrowserWallet (implements ICardanoWallet)
  └── MeshCardanoBrowserWallet (adds Bech32/Mesh/FullTx convenience methods)

CardanoHeadlessWallet (implements ICardanoWallet)
  └── MeshCardanoHeadlessWallet (adds Bech32/Mesh/FullTx convenience methods)
```

- **`CardanoBrowserWallet`** — Thin CIP-30 passthrough for browser extension wallets
- **`MeshCardanoBrowserWallet`** — Adds `*Bech32()`, `*Mesh()`, `signTxReturnFullTx()` methods
- **`CardanoHeadlessWallet`** — Server-side/headless wallet (mnemonic, keys)
- **`MeshCardanoHeadlessWallet`** — Adds convenience methods to headless wallet
- **`ICardanoWallet`** — Base interface all wallets implement (CIP-30 shape)

The `useWallet().wallet` is always `MeshCardanoBrowserWallet`. When non-browser wallets (headless, Web3) are passed via `setWallet()`, they are automatically wrapped in `MeshCardanoBrowserWallet` to ensure the convenience methods are available.

## Architecture

### State Management

Wallet state flows through React Context with a three-state machine:

```
NOT_CONNECTED  ──connectWallet()──>  CONNECTING  ──success──>  CONNECTED
                                         |
                                      error──>  NOT_CONNECTED
```

- **`WalletContext.ts`** defines the store via `useWalletStore()` hook (internal)
- **`MeshProvider`** wraps children with `WalletContext.Provider`
- The `connectedWalletInstance` is typed as `MeshCardanoBrowserWallet`
- Sessions persist to `localStorage` under key `"mesh-wallet-persist"`
- On mount, persisted sessions auto-reconnect (except `utxos` web3 wallets which require re-auth)

### Wallet Connection Flow

1. **Browser wallet:** `MeshCardanoBrowserWallet.enable(walletName, extensions)` returns a `MeshCardanoBrowserWallet` directly
2. **Headless wallet (burner):** `MeshCardanoHeadlessWallet.fromMnemonic({...})` creates wallet, passed to `setWallet()` which wraps it in `MeshCardanoBrowserWallet`
3. **Web3 wallet (social login):** `Web3Wallet.enable(options)` returns a wallet, its `.cardano` property is wrapped in `MeshCardanoBrowserWallet` via `setWallet()`

All paths result in `connectedWalletInstance` being a `MeshCardanoBrowserWallet` with both base and convenience methods available.

### Address Resolution (after connection)

```typescript
// WalletContext.ts — runs after wallet connects
let address = (await connectedWalletInstance.getUnusedAddressesBech32())[0];
if (!address) address = await connectedWalletInstance.getChangeAddressBech32();
```

### Component Hierarchy

```
<MeshProvider>                          # contexts/index.tsx — required wrapper
  <CardanoWallet />                     # cardano-wallet/index.tsx — dialog variant
    +-- <ConnectedButton />             # Shows wallet info when connected
    +-- <Dialog>                        # Radix dialog with screen navigation
         +-- <ScreenMain />             # Lists installed wallets
         +-- <ScreenBurner />           # In-browser burner wallet
         +-- <ScreenWebauthn />         # Passkey-derived wallet
```

### Styling Conventions

- **Tailwind CSS** with `mesh-` prefix on all utility classes (avoids conflicts with consumer apps)
- **Dark mode** via `class` strategy — toggle with `isDark` prop or `mesh-dark` class
- **`cn()` utility** (`src/common/cn.ts`) merges classes using `clsx` + `tailwind-merge`
- Source styles: `src/styles.css` -> compiled to `dist/index.css`
- Consumer import: `import "@meshsdk/react/styles.css"`

### Build Pipeline

- **TSUP** bundles `src/index.ts` -> `dist/index.js` (ESM) + `dist/index.cjs` (CJS) + `dist/index.d.ts` (types)
- **Tailwind** compiles `src/styles.css` -> `dist/index.css`
- Both run concurrently in dev mode

## Exported API

### Components

#### `CardanoWallet` (from `cardano-wallet/`)

Dialog-based wallet connection component. Shows a "Connect Wallet" button that opens a modal listing available browser wallets, with optional burner wallet and WebAuthn/passkey screens.

```tsx
<CardanoWallet
  label="Connect Wallet"       // Button text (default: "Connect Wallet")
  onConnected={() => {}}       // Callback after successful connection
  isDark={false}               // Dark mode toggle
  persist={false}              // Persist session to localStorage
  injectFn={async () => {}}    // Custom wallet injection function
  burnerWallet={{              // Enable burner wallet screen
    networkId: 0,              //   0 = testnet, 1 = mainnet
    provider: fetcher,         //   IFetcher & ISubmitter instance
  }}
  webauthn={{                  // Enable WebAuthn/passkey screen
    networkId: 0,
    provider: fetcher,
    url: "https://...",
  }}
  showDownload={true}          // Show wallet download links
  web3Services={options}       // EnableWeb3WalletOptions for social login
/>
```

#### `CardanoWallet` (from `cardano-wallet-dropdown/`)

Dropdown (hover-based) variant. Simpler API, no dialog — shows wallet list in a dropdown menu.

```tsx
import { CardanoWallet } from "@meshsdk/react"; // Both export as CardanoWallet
// The dialog variant from cardano-wallet/ is the one exported from the barrel

<CardanoWallet
  label="Connect Wallet"
  onConnected={() => {}}
  isDark={false}
  persist={false}
/>
```

> **Note:** Only the **dialog variant** (`cardano-wallet/`) is exported from the package barrel (`src/index.ts`). The dropdown variant exists in the source but is not currently re-exported.

#### `MeshProvider`

Required context wrapper. Must be an ancestor of any component or hook from this library.

```tsx
<MeshProvider>
  {children}
</MeshProvider>
```

#### `MeshBadge`

Branding badge linking to meshjs.dev.

```tsx
<MeshBadge isDark={false} />
```

### Hooks

All hooks must be called within a `<MeshProvider>`. They read from `WalletContext`.

| Hook | Returns | Description |
|------|---------|-------------|
| `useWallet()` | `{ name, connecting, connected, wallet, connect, disconnect, setWallet, setPersist, setWeb3Services, web3UserData, setWeb3UserData, error, address, state }` | Primary hook. `wallet` is typed as `MeshCardanoBrowserWallet`. |
| `useAddress(accountId?)` | `string \| undefined` | Bech32 used address. Internally calls `getUsedAddressesBech32()`. `accountId` defaults to `0`. |
| `useAssets()` | `AssetExtended[] \| undefined` | All non-lovelace assets with policyId, assetName, fingerprint. Derived from `getBalanceMesh()`. |
| `useLovelace()` | `string \| undefined` | ADA balance in lovelace. Derived from `getBalanceMesh()`. Fetches once per connection. |
| `useNetwork()` | `number \| undefined` | Network ID (`0` = testnet, `1` = mainnet). Calls `getNetworkId()`. |
| `useRewardAddress(accountId?)` | `string \| undefined` | Bech32 staking/reward address. Internally calls `getRewardAddressesBech32()`. `accountId` defaults to `0`. |
| `useWalletList({ injectFn? })` | `Wallet[]` | Browser-installed Cardano wallets. Calls `MeshCardanoBrowserWallet.getInstalledWallets()`. |
| `useWalletSubmit()` | `{ submitTx, submitting, result, error }` | Submit a signed transaction. Calls `wallet.submitTx()`. Returns tx hash on success. |

### Context & Types

| Export | From | Description |
|--------|------|-------------|
| `WalletContext` | `contexts/WalletContext.ts` | The React Context object (for advanced use with `useContext`) |
| `WalletState` | `contexts/WalletContext.ts` | Enum: `NOT_CONNECTED`, `CONNECTING`, `CONNECTED` |
| `MeshProvider` | `contexts/index.tsx` | Context provider component |
| `MeshCardanoBrowserWallet` | re-exported from `@meshsdk/wallet` | Browser wallet with convenience methods |
| `MeshCardanoHeadlessWallet` | re-exported from `@meshsdk/wallet` | Headless wallet with convenience methods |
| `CardanoBrowserWallet` | re-exported from `@meshsdk/wallet` | Base browser wallet (CIP-30 passthrough) |
| `CardanoHeadlessWallet` | re-exported from `@meshsdk/wallet` | Base headless wallet |
| `ICardanoWallet` | re-exported from `@meshsdk/wallet` | Base interface for all wallet types |

## Build & Development

```bash
# Build (bundles JS + compiles Tailwind CSS)
pnpm run build

# Dev mode (watch mode for both tsup and tailwind, concurrent)
pnpm run dev

# Type checking only
pnpm run type-check

# Lint (ESLint)
pnpm run lint

# Format check (Prettier)
pnpm run format

# Create npm tarball in dist/
pnpm run pack

# Clean all build artifacts (dist/, node_modules/, .turbo/)
pnpm run clean
```

**Output files after build:**
- `dist/index.js` — ESM bundle
- `dist/index.cjs` — CJS bundle
- `dist/index.d.ts` — TypeScript declarations
- `dist/index.css` — Compiled Tailwind styles

## Dependencies

### Runtime
| Package | Purpose |
|---------|---------|
| `@meshsdk/common` | Shared types (`Asset`, `AssetExtended`, `UTxO`, `Wallet`, `DataSignature`), utilities (`POLICY_ID_LENGTH`, `resolveFingerprint`, `generateMnemonic`) |
| `@meshsdk/wallet` | `MeshCardanoBrowserWallet`, `MeshCardanoHeadlessWallet`, `CardanoBrowserWallet`, `CardanoHeadlessWallet`, `ICardanoWallet` — wallet adapters for browser and headless wallets |
| `@utxos/sdk` | Web3 wallet services (`Web3Wallet` for social login via Google/Discord/Twitter) |
| `@radix-ui/react-dialog` | Accessible dialog/modal primitive |
| `@radix-ui/react-dropdown-menu` | Accessible dropdown menu primitive |
| `@radix-ui/react-icons` | Icon set |
| `@radix-ui/react-label` | Accessible label primitive |
| `@radix-ui/react-tooltip` | Accessible tooltip primitive |
| `class-variance-authority` | Type-safe CSS variant management for Button |
| `tailwind-merge` | Intelligent Tailwind class merging |
| `tailwindcss-animate` | Animation utilities for Tailwind |

### Peer Dependencies
- `react` >= 16 < 20
- `react-dom` >= 16 < 20

## Known Gaps

- **WebAuthn `connect` function** was removed from `@meshsdk/wallet` v2. The `screen-webauthn.tsx` has a runtime fallback that will log an error if the function is unavailable. Needs re-implementation via WebAuthn API or a compatible package.
- **`@utxos/sdk` type mismatch**: `Web3Wallet.cardano` returns a `MeshWallet` (old type from bundled dependency). It is cast as `any` and wrapped in `MeshCardanoBrowserWallet`. This will resolve when `@utxos/sdk` updates to `@meshsdk/wallet` v2.

## License

Apache-2.0
