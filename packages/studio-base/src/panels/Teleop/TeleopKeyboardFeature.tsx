// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { useLayoutEffect } from "react";

import { DirectionalPadAction } from "@foxglove/studio-base/panels/Teleop/DirectionalPad";

import {
  ACCELERATION_SENITIVITY,
  BASE_KICKSTART_FROM_REST,
  BREAK_SENSITIVITY,
  FRONT_MAX_SPEED,
  KEYS,
  LEFT_MAX_TURN,
  REST_THRESHOLD,
  REVERSE_MAX_SPEED,
  RIGHT_MAX_TURN,
  TURNING_SENSITIVITY,
} from "./constants";

function TeleopKeyboardFeature(props: TeleopKeyboardFeatureProps): JSX.Element {
  const { handleVehicleMovement } = props;

  useLayoutEffect(() => {
    let linearVelocity = 0,
      angularVelocity = 0,
      currentKey: DirectionalPadAction | number;

    const timeout: {
      linear: NodeJS.Timeout[];
      angular: NodeJS.Timeout[];
    } = {
      linear: [],
      angular: [],
    };

    const setCurrentKey = (value: DirectionalPadAction | number) => (currentKey = value);

    const setLinearVelocity = (value: number) => {
      if (value === linearVelocity) {
        return;
      }
      linearVelocity = value;
      handleVehicleMovement(currentKey, linearVelocity, angularVelocity);
    };

    const setAngularVelocity = (value: number) => {
      if (value === angularVelocity) {
        return;
      }
      angularVelocity = value;
      handleVehicleMovement(currentKey, linearVelocity, angularVelocity);
    };

    const keyUpHandler = (event: { keyCode: number }) => {
      setCurrentKey(-1); // it stays undefined and not state change happens!!
      // should it be continous emitssion of the data or still make it event bound!!
      if (event.keyCode === KEYS.TOP || event.keyCode === KEYS.DOWN) {
        bringRobotToRest();
      } else if (event.keyCode === 37 || event.keyCode === 39) {
        makeRobotDirectionStraight();
      }
    };

    const keyDownHandler = (event: { keyCode: number }) => {
      if (event.keyCode === KEYS.TOP) {
        increaseSpeed();
        setCurrentKey(DirectionalPadAction.UP);
      } else if (event.keyCode === KEYS.DOWN) {
        decreaseSpeed();
        setCurrentKey(DirectionalPadAction.DOWN);
      } else if (event.keyCode === KEYS.LEFT) {
        turnRight();
        setCurrentKey(DirectionalPadAction.RIGHT);
      } else if (event.keyCode === KEYS.RIGHT) {
        turnLeft();
        setCurrentKey(DirectionalPadAction.LEFT);
      }
    };

    const increaseSpeed = () => {
      if (linearVelocity > FRONT_MAX_SPEED) {
        setLinearVelocity(FRONT_MAX_SPEED);
        return;
      }

      if (linearVelocity < 0) {
        // increase speed towards positive end
        if (linearVelocity > -REST_THRESHOLD) {
          // bring vehicle to rest mode
          setLinearVelocity(0);
          return;
        }
        setLinearVelocity(linearVelocity / BREAK_SENSITIVITY);
      } else if (linearVelocity === 0) {
        // activate front movement;
        setLinearVelocity(BASE_KICKSTART_FROM_REST);
      } else {
        setLinearVelocity(Math.min(FRONT_MAX_SPEED, linearVelocity * ACCELERATION_SENITIVITY));
      }
    };

    const decreaseSpeed = () => {
      // ! reverse mode is handled with negetive values, comparision operators are opposite.
      if (linearVelocity < REVERSE_MAX_SPEED) {
        setLinearVelocity(REVERSE_MAX_SPEED);
        return;
      }

      if (linearVelocity > 0) {
        if (linearVelocity < REST_THRESHOLD) {
          setLinearVelocity(0);
          return;
        }
        setLinearVelocity(linearVelocity / BREAK_SENSITIVITY);
      } else if (linearVelocity === 0) {
        setLinearVelocity(-BASE_KICKSTART_FROM_REST);
      } else {
        setLinearVelocity(Math.max(REVERSE_MAX_SPEED, linearVelocity * ACCELERATION_SENITIVITY));
      }
    };

    const turnRight = () => {
      // right max speed : +1
      // analogus to increase speed. we increment the value by turning factor.
      if (angularVelocity > RIGHT_MAX_TURN) {
        setAngularVelocity(RIGHT_MAX_TURN);
        return;
      }

      if (angularVelocity < 0) {
        // left max speed : -1
        // vehicle turning left, bring it right.
        setAngularVelocity(angularVelocity / TURNING_SENSITIVITY);
      } else if (angularVelocity === 0) {
        // activate right movement;
        setAngularVelocity(BASE_KICKSTART_FROM_REST);
      } else {
        // keep turning right.
        setAngularVelocity(Math.min(RIGHT_MAX_TURN, angularVelocity * TURNING_SENSITIVITY));
      }
    };

    const turnLeft = () => {
      // analogus to decrease speed. we decrement the value by turning factor.
      if (angularVelocity < LEFT_MAX_TURN) {
        setAngularVelocity(LEFT_MAX_TURN);
        return;
      }

      if (angularVelocity > 0) {
        // vehicle turning left, bring it right.
        setAngularVelocity(angularVelocity / TURNING_SENSITIVITY);
      } else if (angularVelocity === 0) {
        // activate right movement;
        setAngularVelocity(-BASE_KICKSTART_FROM_REST);
      } else {
        // keep turning right.
        setAngularVelocity(Math.max(LEFT_MAX_TURN, angularVelocity * TURNING_SENSITIVITY));
      }
    };

    const bringRobotToRest = () => {
      const timeOut = setTimeout(() => {
        if (
          (linearVelocity < REST_THRESHOLD && linearVelocity > 0) ||
          (linearVelocity > -REST_THRESHOLD && linearVelocity < 0)
        ) {
          setLinearVelocity(0);
          timeout.linear.forEach((el) => clearTimeout(el));
          return;
        }
        setLinearVelocity(linearVelocity / BREAK_SENSITIVITY);
        setCurrentKey(currentKey - 1);
        bringRobotToRest();
      }, 300);
      timeout.linear.push(timeOut);
    };

    const makeRobotDirectionStraight = () => {
      const timeOut = setTimeout(() => {
        if (
          (angularVelocity < REST_THRESHOLD && angularVelocity > 0) ||
          (angularVelocity > -REST_THRESHOLD && angularVelocity < 0)
        ) {
          setAngularVelocity(0);
          timeout.angular.forEach((el) => clearTimeout(el));
          return;
        }
        setAngularVelocity(angularVelocity / TURNING_SENSITIVITY);
        setCurrentKey(currentKey - 1);
        makeRobotDirectionStraight();
      }, 300);
      timeout.angular.push(timeOut);
    };

    document.addEventListener("keydown", keyDownHandler);
    document.addEventListener("keyup", keyUpHandler);

    setLinearVelocity(0);
    setAngularVelocity(0);

    return () => {
      document.removeEventListener("keyup", keyUpHandler);
      document.removeEventListener("keydown", keyUpHandler);
      setLinearVelocity(0);
      setAngularVelocity(0);
      [...timeout.linear, ...timeout.angular].forEach((el) => clearTimeout(el));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <></>;
}

type TeleopKeyboardFeatureProps = {
  handleVehicleMovement: (
    key: DirectionalPadAction | number,
    linearVelcity: number,
    angularVelocity: number,
  ) => void;
};

export default TeleopKeyboardFeature;
