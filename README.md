# QRCodzz

QRCodzz is a local-first React Native app for scanning, creating, organizing, styling, exporting, and backing up QR codes and barcodes.

The product principle is simple: **your QR codes stay on your device**. QR creation, barcode creation, scan history, folders, templates, collections, and settings are all modeled around local storage first.

## Features

- Camera and image-based QR/barcode scanning
- Structured QR generators for websites, Wi-Fi, contacts, email, SMS, phone, WhatsApp, location, calendar events, social links, payments, apps, products, and text
- Barcode generators and validation for common 1D and 2D formats
- Library with search, folders, favorites, collections, detail actions, and secure-vault metadata
- QR Studio with scan-safe styling, colors, gradients, eyes, modules, frames, logo placeholders, and contrast checks
- Batch generation from pasted values, CSV, TXT, JSON, or sequences
- PNG export jobs, backup/import JSON validation, collection export, and print sheet manifests
- Configuration-driven templates and premium feature gates
- Privacy-safe analytics wrapper and contextual permission copy

## Architecture

The app is organized by product feature and shared service boundaries.

```text
src/
  app/                 navigation and root providers
  components/          reusable UI, forms, layout, and feedback
  database/            local schema, migrations, repositories, entities
  features/            scanner, generator, library, export, premium, privacy
  hooks/               app-level hooks over services and settings
  services/            scanner, permissions, analytics, biometrics, sharing
  theme/               tokens, themes, and theme provider
  utils/               small shared utilities
```

Important boundaries:

- Screens use repositories and services instead of knowing storage internals.
- Generators are configuration-driven and reusable, not one screen per QR type.
- Premium access goes through `FeatureGate` and `usePremium`, not scattered `isPro` checks.
- Privacy-sensitive display and analytics sanitization go through `features/security`.

## Local Database

Storage uses a local database abstraction backed by AsyncStorage in the app and an in-memory adapter in tests. Migrations live in `src/database/migrations/migrations.ts` and preserve user records while adding defaults for new schema versions.

Backups are JSON payloads with schema and backup version checks. Import validation rejects corrupted JSON, unsupported versions, duplicate IDs, and malformed records before merging.

## Permissions

The app should not request every permission at startup.

- Camera: requested when the camera scanner opens
- Photos: requested when scanning an image or selecting a QR logo
- Contacts: requested when Import Contact is tapped
- Location: requested when Use Current Location is tapped
- Calendar: requested when Add Event to Calendar is requested

Contextual permission explanations are centralized in `src/features/security/index.ts`.

## Privacy And Security

Local MVP privacy guarantees:

- QR contents are not uploaded.
- Scan values are not sent to analytics.
- No account is required.
- Sensitive previews can be hidden in Library and detail views.
- Privacy-safe analytics only records product interaction events such as `scanner_opened`, `qr_created`, and `batch_started`.

Secure vault support is architected with `isProtected` code metadata and a biometric service boundary. Native device authentication is not connected yet, so vault authentication reports unavailable in this local build rather than faking success.

## Premium Architecture

Premium is provider-agnostic. `PurchaseService` defines:

- `getProducts()`
- `purchase()`
- `restore()`
- `hasProAccess()`

The default implementation returns unavailable results until a real billing provider is connected. Monthly, annual, and lifetime product structures are defined, and Restore Purchase is always visible on the Premium screen.

## Native Dependencies

Core native packages:

- `react-native-vision-camera`
- `react-native-vision-camera-barcode-scanner`
- `react-native-image-picker`
- `react-native-nitro-image`
- `@react-native-async-storage/async-storage`
- React Navigation native stack and bottom tabs

After native dependency changes, reinstall iOS pods and rebuild native apps.

## Android Setup

1. Install the React Native Android environment.
2. Install dependencies:

```sh
npm install
```

3. Start Metro:

```sh
npm start
```

4. Run Android debug:

```sh
npm run android
```

5. Build release when ready:

```sh
cd android
./gradlew assembleRelease
```

## iOS Setup

1. Install the React Native iOS environment and CocoaPods.
2. Install dependencies:

```sh
npm install
bundle install
cd ios
bundle exec pod install
```

3. Run iOS:

```sh
npm run ios
```

4. For release validation, build/archive from Xcode after pods are installed.

## Testing

Run TypeScript:

```sh
npm run typecheck
```

Run unit tests:

```sh
npm test
```

Run lint:

```sh
npm run lint
```

Current test coverage includes:

- QR generator encoding and validation
- Barcode validation and checksum behavior
- Scan result parsing
- Scanner duplicate, debounce, pause/resume, manual confirmation, empty image, and error states
- Repository CRUD, folders, settings, templates, and collections
- Database migrations
- Export, backup, import validation, collection export, and print manifests
- QR design contrast and scan-safety checks
- Premium feature architecture
- Privacy redaction, analytics sanitization, and vault fallback

## Performance Notes

- Scanner state is isolated in `ScannerSessionMachine` to reduce rendering churn.
- Batch generation saves rows in chunks so large batches do not monopolize the JS thread.
- Library rendering uses `FlatList`.
- QR design validation is pure and testable.
- Export and print workflows currently produce manifests/jobs; native renderers can be attached later.

## Accessibility Notes

- Main actions include accessibility labels.
- Empty states are explicit for Library, Favorites, folders, and missing records.
- UI does not rely only on color for major states.
- Touch targets use shared button/chip components with stable minimum heights.

## Final Readiness Report

Implemented features:

- Scanner, QR generation, barcode generation, library, folders, collections, QR Studio, batch generation, exports/imports, templates, premium gates, privacy/security helpers, and settings surfaces.

Known limitations:

- Native billing provider is not connected.
- Native biometric vault authentication is not connected.
- Native PDF/SVG/ZIP renderers are represented as export jobs/manifests.
- Photo permission and native logo selection need final platform integration.
- Secure storage for selected sensitive values is architected but not backed by a native keychain/keystore service yet.

Android status:

- Project contains Android native configuration and debug setup.
- Release build should be validated with `cd android && ./gradlew assembleRelease` on a fully configured Android environment.

iOS status:

- Project contains iOS native configuration and pods.
- Release archive should be validated from Xcode after `bundle exec pod install`.

Tests:

- TypeScript and Jest are the required local gates.
- Native release builds should be added to CI when signing and platform credentials are available.

Release blockers:

- Connect real billing provider before enabling purchases.
- Connect biometric/keychain or keystore implementation before claiming vault protection.
- Validate Android and iOS release builds on configured machines.
- Review final app store permission strings and privacy disclosures.

Future roadmap:

- Real billing integration behind `PurchaseService`
- Native secure vault storage and device authentication
- Production PDF/SVG/ZIP exporters
- Optional backend sync with end-to-end privacy guarantees
- Automated E2E tests for camera, gallery, permissions, and native export flows
