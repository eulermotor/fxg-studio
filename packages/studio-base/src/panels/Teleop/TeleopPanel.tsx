// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { set } from "lodash";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { DeepPartial } from "ts-essentials";

import { ros1 } from "@foxglove/rosmsg-msgs-common";
import {
  PanelExtensionContext,
  SettingsTreeAction,
  SettingsTreeNode,
  SettingsTreeNodes,
  Topic,
} from "@foxglove/studio";
import EmptyState from "@foxglove/studio-base/components/EmptyState";
import Stack from "@foxglove/studio-base/components/Stack";
import DirectionalPad, {
  DirectionalPadAction,
} from "@foxglove/studio-base/panels/Teleop/DirectionalPad";
import JoyStickController from "@foxglove/studio-base/panels/Teleop/JoyStickController";
import TeleopKeyboardFeature from "@foxglove/studio-base/panels/Teleop/TeleopKeyboardFeature";
import {
  DEFAULT_TELEOP_MODE,
  TELEOPERATION_MODES,
} from "@foxglove/studio-base/panels/Teleop/constants";
import ThemeProvider from "@foxglove/studio-base/theme/ThemeProvider";

type TeleopPanelProps = {
  context: PanelExtensionContext;
};

const geometryMsgOptions = [
  { label: "linear-x", value: "linear-x" },
  { label: "linear-y", value: "linear-y" },
  { label: "linear-z", value: "linear-z" },
  { label: "angular-x", value: "angular-x" },
  { label: "angular-y", value: "angular-y" },
  { label: "angular-z", value: "angular-z" },
];

type Config = {
  topic: undefined | string;
  publishRate: number;
  upButton: { field: string; value: number };
  downButton: { field: string; value: number };
  leftButton: { field: string; value: number };
  rightButton: { field: string; value: number };
  defaultOperatingMode: { field: string; value: string };
  operationModeOptions: { field: string; value: string[] };
};

function buildSettingsTree(config: Config, topics: readonly Topic[]): SettingsTreeNodes {
  const general: SettingsTreeNode = {
    label: "General",
    defaultExpansionState: "expanded",
    fields: {
      publishRate: { label: "Publish Rate", input: "number", value: config.publishRate },
      topic: {
        label: "Topic",
        input: "autocomplete",
        value: config.topic,
        items: topics.map((t) => t.name),
      },
    },
    children: {
      upButton: {
        label: "Up Button",
        fields: {
          field: {
            label: "Field",
            input: "select",
            value: config.upButton.field,
            options: geometryMsgOptions,
          },
          value: { label: "Value", input: "number", value: config.upButton.value },
        },
      },
      downButton: {
        label: "Down Button",
        fields: {
          field: {
            label: "Field",
            input: "select",
            value: config.downButton.field,
            options: geometryMsgOptions,
          },
          value: { label: "Value", input: "number", value: config.downButton.value },
        },
      },
      leftButton: {
        label: "Left Button",
        fields: {
          field: {
            label: "Field",
            input: "select",
            value: config.leftButton.field,
            options: geometryMsgOptions,
          },
          value: { label: "Value", input: "number", value: config.leftButton.value },
        },
      },
      rightButton: {
        label: "Right Button",
        fields: {
          field: {
            label: "Field",
            input: "select",
            value: config.rightButton.field,
            options: geometryMsgOptions,
          },
          value: { label: "Value", input: "number", value: config.rightButton.value },
        },
      },
    },
  };

  const operationMode: SettingsTreeNode = {
    label: "Vehicle handling mode",
    fields: {
      teleopOperationMode: {
        label: "Operation mode",
        input: "select",
        value: config.defaultOperatingMode.value,
        options: config.operationModeOptions.value.map((topic) => ({ label: topic, value: topic })),
      },
    },
    defaultExpansionState: "expanded",
  };
  return { general, operationMode };
}

const defaultMessage = (speed?: number, direction?: number) => {
  return {
    linear: {
      x: speed != undefined ? speed : 0,
      y: 0,
      z: 0,
    },
    angular: {
      x: 0,
      y: 0,
      z: direction != undefined ? direction : 0,
    },
  };
};

function TeleopPanel(props: TeleopPanelProps): JSX.Element {
  const { context } = props;
  const { saveState } = context;

  const [currentAction, setCurrentAction] = useState<DirectionalPadAction | number>();
  const [doesVehicleStateChange, setDoesVehicleStateChange] = useState<number>(0);
  const [topics, setTopics] = useState<readonly Topic[]>([]);

  const [_linearVelocity, setLinearVelocity] = useState<number>(0);
  const [_angularVelocity, setAngularVelocity] = useState<number>(0);

  // resolve an initial config which may have some missing fields into a full config
  const [config, setConfig] = useState<Config>(() => {
    const partialConfig = context.initialState as DeepPartial<Config>;

    const {
      topic,
      publishRate = 1,
      upButton: { field: upField = "linear-x", value: upValue = 1 } = {},
      downButton: { field: downField = "linear-x", value: downValue = -1 } = {},
      leftButton: { field: leftField = "angular-z", value: leftValue = 1 } = {},
      rightButton: { field: rightField = "angular-z", value: rightValue = -1 } = {},
      defaultOperatingMode: {
        field: defaultField = DEFAULT_TELEOP_MODE,
        value: defaultValue = DEFAULT_TELEOP_MODE,
      } = {},
      operationModeOptions: {
        field: optionsField = "options",
        value: optionsValue = TELEOPERATION_MODES,
      } = {},
    } = partialConfig;

    return {
      topic,
      publishRate,
      upButton: { field: upField, value: upValue },
      downButton: { field: downField, value: downValue },
      leftButton: { field: leftField, value: leftValue },
      rightButton: { field: rightField, value: rightValue },
      defaultOperatingMode: { field: defaultField, value: defaultValue },
      operationModeOptions: { field: optionsField, value: optionsValue },
    };
  });

  const settingsActionHandler = useCallback((action: SettingsTreeAction) => {
    if (action.action !== "update") {
      return;
    }

    setConfig((previous) => {
      const newConfig = { ...previous };
      set(newConfig, action.payload.path.slice(1), action.payload.value);
      return newConfig;
    });
  }, []);

  // setup context render handler and render done handling
  const [renderDone, setRenderDone] = useState<() => void>(() => () => {});
  const [colorScheme, setColorScheme] = useState<"dark" | "light">("light");
  useLayoutEffect(() => {
    context.watch("topics");
    context.watch("colorScheme");

    context.onRender = (renderState, done) => {
      setTopics(renderState.topics ?? []);
      setRenderDone(() => done);
      if (renderState.colorScheme) {
        setColorScheme(renderState.colorScheme);
      }
    };
  }, [context]);

  useEffect(() => {
    const tree = buildSettingsTree(config, topics);
    context.updatePanelSettingsEditor({
      actionHandler: settingsActionHandler,
      nodes: tree,
    });
    saveState(config);
  }, [config, context, saveState, settingsActionHandler, topics]);

  // advertise topic
  const { topic: currentTopic } = config;
  useLayoutEffect(() => {
    if (!currentTopic) {
      return;
    }

    context.advertise?.(currentTopic, "geometry_msgs/Twist", {
      datatypes: new Map([
        ["geometry_msgs/Vector3", ros1["geometry_msgs/Vector3"]],
        ["geometry_msgs/Twist", ros1["geometry_msgs/Twist"]],
      ]),
    });

    return () => {
      context.unadvertise?.(currentTopic);
    };
  }, [context, currentTopic]);

  useLayoutEffect(() => {
    if (currentAction == undefined || !currentTopic) {
      return;
    }

    const message = { ...defaultMessage(_linearVelocity, _angularVelocity) };
    // don't publish if rate is 0 or negative - this is a config error on user's part
    if (config.publishRate <= 0) {
      return;
    }

    const intervalMs = (1000 * 1) / config.publishRate;
    context.publish?.(currentTopic, message);
    const intervalHandle = setInterval(() => {
      context.publish?.(currentTopic, message);
    }, intervalMs);

    return () => {
      clearInterval(intervalHandle);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context, config, currentTopic, doesVehicleStateChange]);

  useLayoutEffect(() => {
    renderDone();
  }, [renderDone]);

  const canPublish = context.publish != undefined && config.publishRate > 0;
  const hasTopic = Boolean(currentTopic);
  const enabled = canPublish && hasTopic;

  const vehicleMotionChangeHandler = (
    key: DirectionalPadAction | undefined,
    linearVelocity: number,
    angularVelocity: number,
  ) => {
    // eslint-disable-next-line no-restricted-syntax
    console.log("[publish] - ", linearVelocity, angularVelocity);
    setLinearVelocity(linearVelocity);
    setAngularVelocity(angularVelocity);
    setDoesVehicleStateChange(Math.random() * Math.random() * Math.random());
    setCurrentAction(key);
  };

  return (
    <ThemeProvider isDark={colorScheme === "dark"}>
      <Stack
        fullHeight
        justifyContent="center"
        alignItems="center"
        style={{ padding: "min(5%, 8px)", textAlign: "center" }}
      >
        {!canPublish && (
          <EmptyState>
            Please connect to a datasource that supports publishing in order to use this panel
          </EmptyState>
        )}

        {canPublish && !hasTopic && (
          <EmptyState>Please select a publish topic in the panel settings</EmptyState>
        )}

        {enabled && <DirectionalPad onAction={setCurrentAction} disabled={!enabled} />}
        {enabled && <TeleopKeyboardFeature handleVehicleMovement={vehicleMotionChangeHandler} />}
        {enabled && <JoyStickController handleVehicleMovement={vehicleMotionChangeHandler} />}
      </Stack>
    </ThemeProvider>
  );
}

export default TeleopPanel;
