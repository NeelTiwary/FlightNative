import { Link, Stack } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
        <Stack.Screen options={{ title: "Oops, not found" }} />
        <View
            style={styles.container}
        >
            <Link href={"/"} style={styles.button}>
                Got to home
            </Link>
        </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black"
  },
  text: {
    color: "#fff"
  },
  button: {
    fontSize: 20,
    textDecorationColor: "blue",
    textDecorationLine: "underline",
    color: "white"
  }
});