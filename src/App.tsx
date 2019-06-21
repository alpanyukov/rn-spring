import React from 'react';
import {
  View,
  StatusBar,
  StyleSheet,
  SafeAreaView,
  Platform
} from 'react-native';
import Animated from 'react-native-reanimated';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

const { Value, event, cond, eq, set, add } = Animated;

export class App extends React.Component {
  private translateX = new Value(0);
  private translateY = new Value(0);

  private animationState = new Value(State.UNDETERMINED);

  private onGestureEvent = event([
    {
      nativeEvent: {
        translationX: this.translateX,
        translationY: this.translateY,
        state: this.animationState
      }
    }
  ]);

  render() {
    const translateX = interaction(this.translateX, this.animationState);
    const translateY = interaction(this.translateY, this.animationState);

    return (
      <SafeAreaView style={styles.container}>
        <PanGestureHandler
          onHandlerStateChange={this.onGestureEvent}
          onGestureEvent={this.onGestureEvent}
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
  }
}

function interaction(
  translate: Animated.Value<number>,
  state: Animated.Value<number>
): any {
  const start = new Value(0);
  const dragging = new Value(0);
  const position = new Value(0);

  return cond(
    eq(state, State.ACTIVE),
    [
      cond(eq(dragging, 0), [set(dragging, 1), set(start, position)]),
      set(position, add(start, translate))
    ],
    [set(dragging, 0), position]
  );
}

/**
 * 
 * 
function interaction() {
 let dragging = 0;
 let start = 0;
 let position = 0;

 return (gestureTranslation, gestureState) => {
   if (gestureState === State.ACTIVE) {
     if (dragging === 0) {
       dragging = 1;
       start = position;
     }
     position = start + gestureTranslation;
   } else {
     dragging = 0;
   }
   return position;
 };
}

 */

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
