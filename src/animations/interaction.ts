import { useRef } from 'react';
import Animated from 'react-native-reanimated';
import { State } from 'react-native-gesture-handler';

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

export function useInteraction(mass = 1, tension = 300, damp = 18) {
  const gestureX = useRef(new Value(0));
  const gestureY = useRef(new Value(0));
  const gestureState = useRef(new Value(State.UNDETERMINED));

  const onGestureEvent = useRef(
    event([
      {
        nativeEvent: {
          translationX: gestureX.current,
          translationY: gestureY.current,
          state: gestureState.current
        }
      }
    ])
  ).current;

  const translateX = useRef(
    interaction(gestureX.current, gestureState.current, mass, tension, damp)
  ).current;
  const translateY = useRef(
    interaction(gestureY.current, gestureState.current, mass, tension, damp)
  ).current;

  return { translateX, translateY, onGestureEvent };
}

function interaction(
  translate: ANumber,
  state: ANumber,
  mass = 1,
  tension = 300,
  damp = 16
): any {
  const start = new Value(0);
  const dragging = new Value(0);
  const anchor = new Value(0);
  const position = new Value(0);
  const velocity = new Value(0);

  const clock = new Clock();
  const dt = divide(diff(clock), 1000);

  const step = cond(
    eq(state, State.ACTIVE),
    [
      cond(eq(dragging, 0), [set(dragging, 1), set(start, position)]),
      set(anchor, add(start, translate)),
      spring(dt, position, velocity, anchor, mass, tension),
      damping(dt, velocity, mass, damp),

      spring(dt, position, velocity, start, mass, tension),
      damping(dt, velocity, mass, damp)
    ],
    [
      set(dragging, 0),
      startClock(clock),
      spring(dt, position, velocity, start, mass, tension),
      damping(dt, velocity, mass, damp)
    ]
  );

  return block([
    step,
    stopWhenNeeded(position, clock),
    set(position, add(position, multiply(velocity, dt))),
    position
  ]);
}

type ANumber = Animated.Value<number>;
const EPS = 1e-3;
const EMPTY_FRAMES_THRESHOLDS = 5;

function stopWhenNeeded(position: ANumber, clock: Animated.Clock) {
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

function damping(
  dt: Animated.Node<number>,
  velocity: ANumber,
  mass: number,
  damping: number
) {
  const acc = divide(multiply(-1, damping, velocity), mass);
  return set(velocity, add(velocity, multiply(dt, acc)));
}

function spring(
  dt: Animated.Node<number>,
  position: ANumber,
  velocity: ANumber,
  anchor: ANumber,
  mass: number,
  tension: number
) {
  const distance = sub(position, anchor);
  const acc = divide(multiply(-1, tension, distance), mass);
  return set(velocity, add(velocity, multiply(dt, acc)));
}
