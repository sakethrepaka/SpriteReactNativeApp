import { StyleSheet, Text, View, Pressable } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { Link } from "expo-router";

export const SpriteManager = ({ sprites, addSprite, removeSprite }) => {
  return (
    <View style={styles.spriteManagerContainer}>
      {sprites.map((sprite) => (
        <View key={sprite.id} style={styles.spriteBox}>
          <Text style={{ marginTop: 40 }}>Sprite {sprite.id}</Text>
          <Pressable
            style={styles.removeButton}
            onPress={() => removeSprite(sprite.id)}
          >
            <FontAwesome name="minus-circle" size={30} color="red" />
          </Pressable>
          <Link
            style={{
              backgroundColor: "green",
              color: "white",
              padding: 10,
              width: "100%",
              position: "absolute",
              bottom: 0,
              borderBottomLeftRadius: 10,
              borderBottomRightRadius: 10,
            }}
            href={{
              pathname: "/SpriteAction",
              params: {
                spriteId: sprite.id,
              },
            }}
          >
            Add Action
          </Link>
        </View>
      ))}

      <Pressable style={styles.addSpriteBox} onPress={addSprite}>
        <FontAwesome name="plus-circle" size={50} color="gray" />
        <Text style={{ textAlign: "center" }}>Add New Sprite</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  spriteManagerContainer: {
    flexDirection: "row",
    marginTop: 20,
    flexWrap: "wrap",
    rowGap: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  spriteBox: {
    width: "28%",
    height: 120,
    borderWidth: 2,
    borderColor: "gray",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 10,
    position: "relative",
    paddingBottom: 10,
  },
  addSpriteBox: {
    width: 100,
    height: 100,
    borderWidth: 2,
    borderColor: "gray",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  removeButton: {
    position: "absolute",
    top: 5,
    right: 5,
  },
});
