# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Configuring eas

- install eas cli - `npm install --global eas-cli`
- eas init to initialize the project and sync to expo cloud account. Only for new project - `eas init --id <uuid generated from expo>`
- run `npx expo expo-dev-client`
- create eas json for creating builds - `eas build:configure`. Select all for both android and ios.
- create build - `eas build --platform android --profile production` => profiles defined  in eas.json

## Running project locally 
- Run with "npm run start" and keep the backend running on port 8080 locally. 
- In the app terminal, press s to switch to expo go
- Open expo go app on Android phone and scan the qr after switching to expo go, otherwise it will expect the development apk.
- To change the backend api url ip, change the ip in `config/axiosConfig.ts` file
- Allow incoming requests on port 8080 through firewall. This way the backend server would be accessible on expo go app with the local network accessible ip of the system. 