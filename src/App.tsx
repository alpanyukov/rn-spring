import React from 'react';
import {
  View,
  StatusBar,
  StyleSheet,
  SafeAreaView,
  Platform
} from 'react-native';
import Animated from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { useSpring } from './animations/spring';

export const App = () => {
  const { translateX, translateY, onGestureEvent } = useSpring();

  return (
    <SafeAreaView style={styles.container}>
      <PanGestureHandler
        onHandlerStateChange={onGestureEvent}
        onGestureEvent={onGestureEvent}
      >
        <Animated.View
          style={[
            styles.box,
            {
              transform: [{ translateX, translateY }]
            }
          ]}
        />
      </PanGestureHandler>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    alignItems: 'center',
    justifyContent: 'center'
  },
  box: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,

    backgroundColor: '#41b3a3',
    width: 120,
    height: 120
  }
});
