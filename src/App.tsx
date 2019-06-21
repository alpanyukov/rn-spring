import React, { useRef } from 'react';
import {
  View,
  StatusBar,
  StyleSheet,
  SafeAreaView,
  Platform
} from 'react-native';
import Animated from 'react-native-reanimated';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

const {
  Value,
  event,
  cond,
  eq,
  set,
  add,
  and,
  lessThan,
  stopClock,
  Clock,
  divide,
  diff,
  multiply,
  startClock
} = Animated;

export class App extends React.Component {
  private gestureX = new Value(0);
  private gestureY = new Value(0);
  private gestureState = new Value(State.UNDETERMINED);

  private onGestureEvent = event([
    {
      nativeEvent: {
        translationX: this.gestureX,
        translationY: this.gestureY,
        state: this.gestureState
      }
    }
  ]);

  private translateX = interaction(this.gestureX, this.gestureState);
  private translateY = interaction(this.gestureY, this.gestureState);

  render() {
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
                transform: [
                  { translateX: this.translateX, translateY: this.translateY }
                ]
              }
            ]}
          />
        </PanGestureHandler>
      </SafeAreaView>
    );
  }
}
type ANumber = Animated.Value<number>;
const POSITION_THRESHOLD = 1;

function stopWhenNeeded(
  dt: Animated.Node<number>,
  position: ANumber,
  velocity: ANumber,
  clock: Animated.Clock
): any {
  return cond(
    and(
      lessThan(position, POSITION_THRESHOLD),
      lessThan(-POSITION_THRESHOLD, position)
    ),
    [stopClock(clock), set(velocity, 0), set(position, 0)]
  );
}

const VELOCITY = 100;
function force(
  dt: Animated.Node<number>,
  position: ANumber,
  velocity: ANumber
) {
  return set(velocity, cond(lessThan(position, 0), VELOCITY, -VELOCITY));
}

function interaction(translate: ANumber, state: ANumber): any {
  const start = new Value(0);
  const dragging = new Value(0);
  const position = new Value(0);
  const velocity = new Value(0);

  const clock = new Clock();
  const dt = divide(diff(clock), 1000);

  return cond(
    eq(state, State.ACTIVE),
    [
      cond(eq(dragging, 0), [set(dragging, 1), set(start, position)]),
      stopClock(clock),
      dt,
      set(position, add(start, translate))
    ],
    [
      set(dragging, 0),
      startClock(clock),
      force(dt, position, velocity),
      stopWhenNeeded(dt, position, velocity, clock),
      set(position, add(position, multiply(velocity, dt)))
    ]
  );
}

/**
 * 
 * 
function interaction() {
 let dragging = 0;
 let start = 0;
 let position = 0;
 //... Секундомер

 return (gestureTranslation, gestureState) => {
   if (gestureState === State.ACTIVE) {
     if (dragging === 0) {
       dragging = 1;
       start = position;
     }
     
     clock = 0
     //... (dt) Посчитай сколько секунд прошло с предыдущей рисовки
     
     if(position < POSITION_THRESHOLD && position > -POSITION_THRESHOLD){
        clock = 0
        velocity = 0
        position = 0
     }

     position = start + gestureTranslation;
   } else {
     dragging = 0;
     //... Запусти секундомер
     velocity = position < 0 ? VELOCITY : -VELOCITY;
     position = position + velocity * dt
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
