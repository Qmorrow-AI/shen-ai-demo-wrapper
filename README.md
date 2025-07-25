This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

>**Note**: Make sure you have completed the [React Native - Environment Setup](https://reactnative.dev/docs/environment-setup) instructions till "Creating a new application" step, before proceeding.

## Step 1: Start the Metro Server

First, you will need to start **Metro**, the JavaScript _bundler_ that ships _with_ React Native.

To start Metro, run the following command from the _root_ of your React Native project:

```bash
# using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Start your Application

Let Metro Bundler run in its _own_ terminal. Open a _new_ terminal from the _root_ of your React Native project. Run the following command to start your _Android_ or _iOS_ app:

### For Android

```bash
# using npm
npm run android

# OR using Yarn
yarn android
```

### For iOS

```bash
# using npm
npm run ios

# OR using Yarn
yarn ios
```

> ⚠️ **Important – unpack the SDK binaries first!**  
> The iOS build requires the pre-compiled `ShenaiSDK.framework` which is kept out of version control to keep the repository size small.  
> After cloning the repo (or after running the ZIP creation command shown earlier) make sure you unpack `shenai-sdk-large-files-only.zip` **from the `minimal_app` folder** before building:
>
> ```bash
> # from mobile-app-demo/react-native/minimal_app
> unzip shenai-sdk-large-files-only.zip
> ```
>
> If you split the archive with `-s 50m`, keep all parts in the same directory; `unzip` will re-assemble them automatically.

If everything is set up _correctly_, you should see your new app running in your _Android Emulator_ or _iOS Simulator_ shortly provided you have set up your emulator/simulator correctly.

This is one way to run your app — you can also run it directly from within Android Studio and Xcode respectively.

## Step 3: Modifying your App

Now that you have successfully run the app, let's modify it.

1. Open `App.tsx` in your text editor of choice and edit some lines.
2. For **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Developer Menu** (<kbd>Ctrl</kbd> + <kbd>M</kbd> (on Window and Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (on macOS)) to see your changes!

   For **iOS**: Hit <kbd>Cmd ⌘</kbd> + <kbd>R</kbd> in your iOS Simulator to reload the app and see your changes!

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [Introduction to React Native](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you can't get this to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.

## Note on npm vs yarn installs for the local Shen AI SDK

If you work with **npm** instead of **yarn**, you will notice that `npm install` fails with an error coming from `react-native-shenai-sdk`:

```
Error: The module field in package.json points to a non-existent file: lib/module/index.js
```

Why does it happen?

1. The SDK is included as a local dependency:
   ```jsonc
   "react-native-shenai-sdk": "file:./react-native-shenai-sdk"
   ```
2. That folder already contains the pre-built `lib/module/*.js` files, **but** its `package.json` still has a lifecycle script:
   ```jsonc
   "prepare": "bob build"
   ```
3. `npm install` executes *all* lifecycle scripts for local `file:` packages.  The **bob** tool starts by deleting `lib/module`, then looks for the original `src/` TypeScript to rebuild—but the source is not shipped in this directory—so the build fails.
4. Yarn (classic) skips lifecycle scripts for linked / workspace packages, which is why the same folder installs fine with `yarn install`.

### Quick fix for npm users
Add an `installConfig` section to the SDK’s `package.json` so npm ignores its scripts:

```jsonc
// minimal_app/react-native-shenai-sdk/package.json
{
  // …
  "scripts": {
    "prepare": "bob build"
  },
  "installConfig": {
    "ignoreScripts": true
  }
}
```

Alternatively, simply delete the `prepare` line if you do not need to rebuild the SDK locally.

Once the script is disabled, `npm install` works exactly like `yarn install` and keeps the pre-built files intact.

---

## Helper script – `develop.sh`

To make onboarding easier we ship a small helper script:

```bash
./develop.sh
```

1. Runs `yarn install --silent` to get all dependencies (Yarn skips the SDK’s build step automatically).
2. Starts the Metro bundler via `npm start`.

Feel free to adapt the script if your team prefers an all-npm workflow.
