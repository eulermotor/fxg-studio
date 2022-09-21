/* eslint-disable @typescript-eslint/prefer-optional-chain */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { useEffect, useState } from "react";

import { DirectionalPadAction } from "@foxglove/studio-base/panels/Teleop/DirectionalPad";
import { JOYSTICK_CHANGE_THRESHOLD } from "@foxglove/studio-base/panels/Teleop/constants";

type JoystickControllerProps = {
  handleVehicleMovement: (
    key: DirectionalPadAction | number,
    linearVelcity: number,
    angularVelocity: number,
  ) => void;
};

function JoyStickController(props: JoystickControllerProps): JSX.Element {
  const { handleVehicleMovement } = props;
  const [linearVelocity, setLinearVelocity] = useState<number>(0);
  const [angularVeclocity, setAngularVeclocity] = useState<number>(0);

  const joyStickDetected: boolean = false;

  useEffect(() => {
    const didChange = (Ov: number, Nv: number): boolean => {
      return parseFloat(Math.abs(Ov - Nv).toFixed(2)) > JOYSTICK_CHANGE_THRESHOLD;
    };

    const handleDedulication = (Lv: number, Av: number): void => {
      if (didChange(linearVelocity, Lv)) {
        setLinearVelocity(Lv);
        handleVehicleMovement(1, Lv, angularVeclocity);
      }
      if (didChange(angularVeclocity, Av)) {
        setAngularVeclocity(Av);
        handleVehicleMovement(1, linearVelocity, Av);
      }
    };

    (function checkAvailableGamePads() {
      requestAnimationFrame(checkAvailableGamePads);
      const newGamepad = navigator.getGamepads()[0];
      if (typeof newGamepad === "undefined" || !newGamepad) {
        return;
      }

      let linear = newGamepad && newGamepad.axes ? newGamepad.axes[1] : 0;
      let angular = newGamepad && newGamepad.axes ? newGamepad.axes[0] : 0;

      linear = linear ? -parseFloat(linear.toFixed(2)) : 0;
      angular = angular ? parseFloat(angular.toFixed(2)) : 0;

      handleDedulication(linear, angular);
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {joyStickDetected && (
        <div>
          <h2>Connected joystick</h2>
          <p>Please use the right joystick on Logitech joystick for moving the robot.</p>
        </div>
      )}

      {!joyStickDetected && (
        <div>
          <h3>Please consider connecting joystick</h3>
          <button className="" onClick={() => window.location.reload()}>
            Retry Connection
          </button>
        </div>
      )}
    </>
  );
}

export default JoyStickController;
