/* eslint-disable @typescript-eslint/prefer-optional-chain */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { useEffect } from "react";

import { DirectionalPadAction } from "@foxglove/studio-base/panels/Teleop/DirectionalPad";
import { DEDUPLICATION_THRESHOLD } from "@foxglove/studio-base/panels/Teleop/constants";

type JoystickControllerProps = {
  handleVehicleMovement: (
    key: DirectionalPadAction | number,
    linearVelocity: number,
    angularVelocity: number,
  ) => void;
};

function JoyStickController(props: JoystickControllerProps): JSX.Element {
  const { handleVehicleMovement } = props;

  let linearVelocity: number = 0,
    angularVelocity: number = 0;
  const setLinearVelocity = (val: number) => (linearVelocity = val);
  const setAngularVelocity = (val: number) => (angularVelocity = val);

  useEffect(() => {
    const didChange = (Ov: number, Nv: number): boolean => {
      return parseFloat(Math.abs(Ov - Nv).toFixed(2)) > DEDUPLICATION_THRESHOLD;
    };

    const handleDeduplication = (Lv: number, Av: number): void => {
      if (didChange(angularVelocity, Av) || didChange(linearVelocity, Lv)) {
        setAngularVelocity(Av);
        setLinearVelocity(Lv);
        handleVehicleMovement(1, Lv, Av);
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
      angular = angular ? -parseFloat(angular.toFixed(2)) : 0;

      handleDeduplication(linear, angular);
    })();

    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <></>;
}

export default JoyStickController;
