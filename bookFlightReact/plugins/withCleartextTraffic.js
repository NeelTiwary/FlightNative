// import { withAndroidManifest } from "@expo/config-plugins";
// const { withAndroidManifest } = require('@expo/config-plugins');
import configPlugins from '@expo/config-plugins';

const { withAndroidManifest } = configPlugins;


export default function withCleartextTraffic(config) {
  return withAndroidManifest
  (config, async (config) => {
    const application = config.modResults.manifest.application[0];
    application.$['android:usesCleartextTraffic'] = 'true';
    return config;
  });
};
