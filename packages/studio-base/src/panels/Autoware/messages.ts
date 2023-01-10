export interface AdvertisableTopic {
  topic: string;
  schemaName: string;
  options?: Record<string, unknown>;
}

export const AUTOWARE_MSG = {
  ENGAGE: "/autoware/engage",
  CONTROL_STATE: "/control/current_gate_mode",
  CONTROL: "/external/selected/control_cmd",
  GEAR_CMD: "/external/selected/gear_cmd",
};

export const CONTROL_MODE_ENUM = {
  NO_COMMAND: 0,
  AUTONOMOUS: 1,
  MANUAL: 2,
};

export const GEAR_CMD_ENUM = {
  NONE: 0,
  NEUTRAL: 1,
  DRIVE: 2,
  REVERSE: 20,
  PARK: 22,
  LOW: 23,
} as const;

export const autowareAdvertisableTopicsList: AdvertisableTopic[] = [
  {
    topic: AUTOWARE_MSG.ENGAGE,
    schemaName: "autoware_auto_vehicle_msgs/msg/Engage",
  },
  {
    topic: AUTOWARE_MSG.CONTROL_STATE,
    schemaName: "tier4_control_msgs/msg/GateMode",
  },
  {
    topic: AUTOWARE_MSG.CONTROL,
    schemaName: "autoware_auto_control_msgs/msg/AckermannControlCommand",
  },
  {
    topic: AUTOWARE_MSG.GEAR_CMD,
    schemaName: "autoware_auto_vehicle_msgs/msg/GearCommand",
  },
];
