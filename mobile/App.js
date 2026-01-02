import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import Navigation from "./src/Navigation";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <Navigation />
      <StatusBar barStyle="dark-content" />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
