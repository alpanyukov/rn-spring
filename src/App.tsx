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
  lessThan,
  stopClock,
  Clock,
  divide,
  diff,
  multiply,
  startClock,
  sub,
  abs,
  greaterThan,
  block
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
const EPS = 1e-3;
const EMPTY_FRAMES_THRESHOLDS = 5;

function stopWhenNeeded(
  dt: Animated.Node<number>,
  position: ANumber,
  velocity: ANumber,
  clock: Animated.Clock
) {
  const ds = diff(position);
  const noMovementFrames = new Value(0);

  return cond(
    lessThan(abs(ds), EPS),
    [
      set(noMovementFrames, add(noMovementFrames, 1)),
      cond(
        greaterThan(noMovementFrames, EMPTY_FRAMES_THRESHOLDS),
        stopClock(clock)
      )
    ],
    set(noMovementFrames, 0)
  );
}

// const VELOCITY = 100;
// function force(
//   dt: Animated.Node<number>,
//   position: ANumber,
//   velocity: ANumber
// ) {
//   return set(velocity, cond(lessThan(position, 0), VELOCITY, -VELOCITY));
// }

function damping(
  dt: Animated.Node<number>,
  velocity: ANumber,
  mass = 1,
  damping = 12
) {
  const acc = divide(multiply(-1, damping, velocity), mass);
  return set(velocity, add(velocity, multiply(dt, acc)));
}

function spring(
  dt: Animated.Node<number>,
  position: ANumber,
  velocity: ANumber,
  anchor: ANumber,
  mass = 1,
  tension = 300
) {
  const distance = sub(position, anchor);
  const acc = divide(multiply(-1, tension, distance), mass);
  return set(velocity, add(velocity, multiply(dt, acc)));
}

function interaction(translate: ANumber, state: ANumber): any {
  const start = new Value(0);
  const dragging = new Value(0);
  const anchor = new Value(0);
  const position = new Value(0);
  const velocity = new Value(0);
  const mass = 1;
  const damp = 16;

  const clock = new Clock();
  const dt = divide(diff(clock), 1000);

  const step = cond(
    eq(state, State.ACTIVE),
    [
      cond(eq(dragging, 0), [set(dragging, 1), set(start, position)]),
      set(anchor, add(start, translate)),
      spring(dt, position, velocity, anchor, mass),
      damping(dt, velocity, mass, damp)
    ],
    [
      set(dragging, 0),
      startClock(clock),
      spring(dt, position, velocity, start, mass),
      damping(dt, velocity, mass, damp)
    ]
  );

  return block([
    step,
    stopWhenNeeded(dt, position, velocity, clock),
    set(position, add(position, multiply(velocity, dt))),
    position
  ]);
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
