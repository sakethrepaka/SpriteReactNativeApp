import { Stack } from "expo-router";
import { Provider } from "react-redux";
import "react-native-reanimated";
import { store } from "../Store";

export default function RootLayout() {
  return (
    <Provider store={store}>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            headerTitle: "Scratch",
            headerTitleStyle: { color: "orange", fontWeight: "bold" },
          }}
        />
        <Stack.Screen
          name="SpriteAction"
          options={{
            headerTitle: "Sprite Actions",
            headerTitleStyle: { color: "orange", fontWeight: "bold" },
          }}
        />
      </Stack>
    </Provider>
  );
}
