import React, { useState, useRef, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  PanResponder,
  Animated,
  ScrollView,
  FlatList,
  Modal,
  TouchableWithoutFeedback,
  Pressable,
} from "react-native";
import { AnimalIcon, TigerIcon, elephant_icon, Ball_Icon } from "../SVG/icons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { SvgXml } from "react-native-svg";
import { useSelector, useDispatch } from "react-redux";
import { deleteSprite, addAction } from "../slices/spriteSlice";
import { Link } from "expo-router";

export default function Index() {
  const spriteCoordsRef = useRef({});
  const repeatRef = useRef(0);
  const [sprites, setSprites] = useState([]);
  const [nextId, setNextId] = useState(1);
  const actionsBySprite = useSelector((state) => state.actions);
  const [selectedSvg, setSelectedSvg] = useState(AnimalIcon);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const dispatch = useDispatch();
  const availableSvgs = [
    { name: "Animal", xml: AnimalIcon },
    { name: "Tiger", xml: TigerIcon },
    { name: "Elephant", xml: elephant_icon },
    { name: "Ball", xml: Ball_Icon },
  ];

  function createNewSprite(id, svgxml = AnimalIcon) {
    const pan = new Animated.ValueXY();
    const rotate = new Animated.Value(0);
    const scale = new Animated.Value(1);
    const shake = new Animated.Value(0);
    const pulse = new Animated.Value(1);
    const colorShift = new Animated.Value(0);
    const scaleFactor = 0.06;
    const maxMovement = 20;
    const minX = -90;
    const maxX = 90;
    const minY = -140;
    const maxY = 140;
    let isVisible = true;
    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (e, gestureState) => {
        const currentCoords = spriteCoordsRef.current[id] || { x: 0, y: 0 }; // Get current position
        let newX = Math.round(currentCoords.x + gestureState.dx * scaleFactor);
        let newY = Math.round(currentCoords.y + gestureState.dy * scaleFactor);

        // Apply boundaries
        newX = Math.max(minX, Math.min(newX, maxX)); // Enforce X boundaries
        newY = Math.max(minY, Math.min(newY, maxY)); // Enforce Y boundaries

        const newCoords = { x: newX, y: newY };

        pan.setValue(newCoords); // Set new value for animation
        spriteCoordsRef.current[id] = newCoords; // Update ref with new coordinates
        setSprites((prevSprites) =>
          prevSprites.map((sprite) =>
            sprite.id === id ? { ...sprite, coordinates: newCoords } : sprite
          )
        );
      },
      onPanResponderRelease: () => {
        spriteCoordsRef.current[id] = {
          x: spriteCoordsRef.current[id].x + pan.x._value,
          y: spriteCoordsRef.current[id].y + pan.y._value,
        };
        pan.flattenOffset();
      },
    });

    spriteCoordsRef.current[id] = { x: 0, y: 0 };

    return {
      id,
      pan,
      panResponder,
      coordinates: { x: 0, y: 0 },
      rotate,
      scale,
      isVisible,
      svgxml,
      shake,
      pulse,
      colorShift,
    };
  }
  const resetPosition = () => {
    setSprites((prevSprites) =>
      prevSprites.map((sprite) => {
        Animated.spring(sprite.pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
        spriteCoordsRef.current[sprite.id] = { x: 0, y: 0 };
        return { ...sprite, coordinates: { x: 0, y: 0 } };
      })
    );
  };

  const addSprite = () => {
    setIsModalVisible(true);
  };

  const handleSelectSvg = (svg) => {
    setSelectedSvg(svg.xml);
    const newSprite = createNewSprite(nextId, svg.xml);
    dispatch(addAction({ spriteId: nextId }));
    setSprites((prev) => [...prev, newSprite]);
    setNextId(nextId + 1);
    setIsModalVisible(false);
  };

  const handleAddSpriteDefault = () => {
    const newSprite = createNewSprite(nextId, AnimalIcon);
    setSprites((prev) => [...prev, newSprite]);
    setNextId(nextId + 1);
    setIsModalVisible(false);
  };

  const removeSprite = (id) => {
    setSprites((prev) => prev.filter((sprite) => sprite.id !== id));
    dispatch(deleteSprite({ spriteId: id }));
    delete spriteCoordsRef.current?.[id];
  };

  const startActionsForAllSprites = async () => {
    for (const sprite of sprites) {
      const spriteActions = actionsBySprite[sprite.id];
      if (spriteActions) {
        performActionsForSprite(sprite, spriteActions);
      }
    }
  };

  const performActionsForSprite = async (sprite, actions) => {
    for (const action of actions) {
      await performAction(sprite, action);
    }
  };

  const performAction = (sprite, action) => {
    return new Promise((resolve) => {
      const id = sprite.id;

      let { x, y } = spriteCoordsRef.current?.[id] || { x: 0, y: 0 }; // Default to {x: 0, y: 0} if undefined

      const animate = (newCoords) => {
        Animated.timing(sprite.pan, {
          toValue: newCoords,
          duration: 1000,
          useNativeDriver: false,
        }).start(() => {
          setSprites((prev) =>
            prev.map((s) =>
              s.id === sprite.id ? { ...s, coordinates: newCoords } : s
            )
          );
          spriteCoordsRef.current = spriteCoordsRef.current || {}; // Ensure current exists
          spriteCoordsRef.current[sprite.id] = newCoords; // Safely update with new coordinates
          resolve();
        });
      };

      switch (true) {
        case action.text.includes("Move X"):
          const moveXAmount = parseInt(action.text.match(/\d+/)[0], 10);
          const newX = x + moveXAmount;
          animate({ x: newX, y });
          break;

        case action.text.includes("Move Y"):
          const moveYAmount = parseInt(action.text.match(/\d+/)[0], 10);
          const newY = y + moveYAmount;
          animate({ x, y: newY });
          break;

        case action.text.includes("Go to 0"):
          animate({ x: 0, y: 0 });
          break;

        case action.text.includes("Rotate 360"):
          Animated.timing(sprite.rotate, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          }).start(() => {
            sprite.rotate.setValue(0);
            resolve();
          });
          break;

        case action.text.includes("Increase Size"):
          Animated.timing(sprite.scale, {
            toValue: 2,
            duration: 500,
            useNativeDriver: false,
          }).start(() => {
            // Reset to normal size after 500ms
            setTimeout(() => {
              Animated.timing(sprite.scale, {
                toValue: 1,
                duration: 500,
                useNativeDriver: false,
              }).start(() => resolve());
            }, 500); // Duration before resetting to normal size
          });
          break;

        case action.text.includes("Decrease Size"):
          Animated.timing(sprite.scale, {
            toValue: 0.5,
            duration: 500,
            useNativeDriver: false,
          }).start(() => {
            setTimeout(() => {
              Animated.timing(sprite.scale, {
                toValue: 1,
                duration: 500,
                useNativeDriver: false,
              }).start(() => resolve());
            }, 500);
          });
          break;
        case action.text.includes("Random Position"):
          const randomX = Math.floor(Math.random() * 80); // Random X between 0 and 100
          const randomY = Math.floor(Math.random() * 80); // Random Y between 0 and 100
          animate({ x: randomX, y: randomY });
          break;

        case action.text.includes("Repeat"):
          if (repeatRef.current == 1) {
            repeatRef.current = 0;
            break;
          }
          repeatRef.current = 1;
          let repeatCount = repeatRef.current;
          performRepeatActions(
            sprite,
            actionsBySprite[sprite.id],
            repeatCount
          ).then(resolve);
          break;
        case action.text.includes("Say Hello for 5 sec"):
          showHelloMessage(sprite).then(resolve);
          break;
        case action.text.includes("Say Hello for"):
          showHelloMessage(sprite, false).then(resolve);
          break;
        case action.text.includes("Hide for 3s"):
          hideSprite(sprite).then(resolve);
          break;
        case action.text.includes("Shake"):
          Animated.sequence([
            Animated.timing(sprite.shake, {
              toValue: 10,
              duration: 50,
              useNativeDriver: false,
            }),
            Animated.timing(sprite.shake, {
              toValue: -10,
              duration: 50,
              useNativeDriver: false,
            }),
            Animated.timing(sprite.shake, {
              toValue: 0,
              duration: 50,
              useNativeDriver: false,
            }),
          ]).start(() => resolve());
          break;

        case action.text.includes("Pulse"):
          const pulseAnimation = Animated.loop(
            Animated.sequence([
              Animated.timing(sprite.pulse, {
                toValue: 1.5,
                duration: 500,
                useNativeDriver: false,
              }),
              Animated.timing(sprite.pulse, {
                toValue: 1,
                duration: 500,
                useNativeDriver: false,
              }),
            ])
          );

          pulseAnimation.start();

          setTimeout(() => {
            pulseAnimation.stop();
            sprite.pulse.setValue(1);
            resolve();
          }, 3000);

          break;

        case action.text.includes("Color Shift"):
          Animated.loop(
            Animated.timing(sprite.colorShift, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: false,
            })
          ).start(() => resolve());
          break;

        default:
          resolve();
      }
    });
  };

  const showHelloMessage = (sprite, repeat = true) => {
    return new Promise((resolve) => {
      setSprites((prev) =>
        prev.map((s) => (s.id === sprite.id ? { ...s, showHello: true } : s))
      );
      if (repeat) {
        setTimeout(() => {
          setSprites((prev) =>
            prev.map((s) =>
              s.id === sprite.id ? { ...s, showHello: false } : s
            )
          );
          resolve();
        }, 5000);
      } else {
        setSprites((prev) =>
          prev.map((s) => (s.id === sprite.id ? { ...s, showHello: false } : s))
        );
      }
    });
  };

  const hideSprite = (sprite) => {
    return new Promise((resolve) => {
      setSprites((prev) =>
        prev.map((s) => (s.id === sprite.id ? { ...s, isVisible: false } : s))
      );
      setTimeout(() => {
        setSprites((prev) =>
          prev.map((s) => (s.id === sprite.id ? { ...s, isVisible: true } : s))
        );
        resolve();
      }, 3000);
    });
  };

  const performRepeatActions = async (sprite, actions, repeatCount) => {
    for (let i = 0; i < repeatCount; i++) {
      await performActionsForSprite(sprite, actions);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 200 }}
    >
      <View style={styles.miniScreen}>
        {sprites.map(
          (sprite) =>
            sprite.isVisible && (
              <Animated.View
                key={sprite.id}
                {...sprite.panResponder.panHandlers}
                style={[
                  sprite.pan.getLayout(),
                  {
                    transform: [
                      { translateX: sprite.pan.x },
                      { translateY: sprite.pan.y },
                      {
                        rotate: sprite?.rotate.interpolate({
                          inputRange: [0, 1],
                          outputRange: ["0deg", "360deg"],
                        }),
                      },
                      {
                        scale: sprite?.scale,
                      },
                      {
                        scale: sprite?.pulse,
                      },
                      {
                        translateX: sprite?.shake,
                      },
                    ],
                    backgroundColor: sprite?.colorShift.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["#f0f0f0", "#f0f0f0"],
                    }),
                  },
                  styles.animalContainer,
                ]}
              >
                <SvgXml
                  style={styles.animalIcon}
                  height="60"
                  width="60"
                  xml={sprite.svgxml}
                />
                {sprite.showHello && (
                  <View style={styles.helloMessageContainer}>
                    <Text style={styles.helloMessage}>Hello There!!</Text>
                  </View>
                )}
                <Text>Sprite {sprite.id}</Text>
              </Animated.View>
            )
        )}
        <TouchableOpacity
          style={styles.playButton}
          onPress={startActionsForAllSprites}
        >
          <FontAwesome name="play-circle" size={40} color="White" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.resetButton} onPress={resetPosition}>
          <FontAwesome name="refresh" size={40} color="white" />
        </TouchableOpacity>
      </View>

      <CoordinatesDisplay sprites={sprites} />

      <SpriteManager
        sprites={sprites}
        addSprite={addSprite}
        removeSprite={removeSprite}
      />

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={handleAddSpriteDefault}
      >
        <TouchableWithoutFeedback onPress={handleAddSpriteDefault}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select an SVG</Text>
          <FlatList
            data={availableSvgs}
            keyExtractor={(item) => item.name}
            numColumns={2}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.svgOption}
                onPress={() => handleSelectSvg(item)}
              >
                <SvgXml xml={item.xml} width="50" height="50" />
                <Text style={styles.svgLabel}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>

      <StatusBar style="auto" />
    </ScrollView>
  );
}

const CoordinatesDisplay = ({ coordinates, spriteId, sprites }) => {
  return (
    <View style={styles.coordinatesContainer}>
      {sprites.map((sprite) => {
        return (
          <Text key={sprite.id} style={styles.coordinatesText}>
            Sprite {sprite.id} - X: {sprite.coordinates["x"]}, Y:{" "}
            {sprite.coordinates["y"]}
          </Text>
        );
      })}
    </View>
  );
};

const SpriteManager = ({ sprites, addSprite, removeSprite }) => {
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
              borderRadius: 10,
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
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  miniScreen: {
    width: "100%",
    height: 550,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  animalIcon: {
    width: 100,
    height: 100,
  },
  playButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#4CAF50",
    borderRadius: 20,
    padding: 10,
  },
  resetButton: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "#FF5722",
    borderRadius: 20,
    padding: 10,
  },
  coordinatesContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#e0e0e0",
    borderRadius: 10,
  },
  coordinatesText: {
    fontSize: 16,
    color: "#333",
  },
  helloMessageContainer: {
    position: "absolute",
    bottom: "100%",
    left: "20%",
    transform: [{ translateX: -50 }],
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 10,
    padding: 5,
    zIndex: 10,
  },
  helloMessage: {
    color: "black",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "50%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  svgOption: {
    flex: 1,
    alignItems: "center",
    margin: 10,
  },
  svgLabel: {
    marginTop: 5,
    fontSize: 14,
  },
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
    justifyContent: "space-between", // Use space-between to position items
    marginHorizontal: 10,
    position: "relative",
    paddingBottom: 10, // Add some padding to the bottom for the button
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
