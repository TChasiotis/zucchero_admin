//npx expo start και μολις φανει το qr, παταω a για να ξεκινησει η εφαρμογη, και r για να κανει reload

import { Stack } from "expo-router";

export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
