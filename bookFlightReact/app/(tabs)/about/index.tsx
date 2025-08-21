import { useAppContext } from "@/context/AppContextProvider";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button, TextInput } from "react-native-paper";

export default function About() {
  const { apiUrl, setApiUrl } = useAppContext();
  const [inputUrl, setInputUrl] = useState("");
  return (
    <View style={styles.container}>
    <Text style={styles.text}>about page.</Text>
    <View style={{ width: '80%', marginBottom: 20 }}>
      <TextInput
        label="set the api url"
        mode="outlined"
        value={inputUrl}
        onChangeText={setInputUrl}
        style={{ width: '100%' }}  // Add this
      />
    </View>
    <Button 
      mode="contained" 
      onPress={() => setApiUrl(inputUrl.trim().toLowerCase() + ":8080")}
    >
      set url
    </Button>
<Text>api set to :{apiUrl}</Text>
  </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",  // Changed from center
    alignItems: "center",
    backgroundColor: "black",
    paddingTop: 50,  // Add some top padding
  },
  text: {
    color: "white",
    marginBottom: 20,  // Add some spacing
  }
});