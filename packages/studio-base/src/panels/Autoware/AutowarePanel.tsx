// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { Button, FormControl, MenuItem, Select, Typography } from "@mui/material";
import { useLayoutEffect, useState } from "react";

import Log from "@foxglove/log";
import { PanelExtensionContext, Topic } from "@foxglove/studio";
import EmptyState from "@foxglove/studio-base/components/EmptyState";
import Stack from "@foxglove/studio-base/components/Stack";
import ThemeProvider from "@foxglove/studio-base/theme/ThemeProvider";

import { autowareAdvertisableTopicsList, AUTOWARE_MSG } from "./messages";

type AutowarePanelProps = {
  context: PanelExtensionContext;
};

const AUTOWARE_OPERATION_MODES = [
  { value: 0, title: "Autonomous" },
  { value: 1, title: "External" },
] as const;

const log = Log.getLogger(__filename);

function AutowarePanel(props: AutowarePanelProps): JSX.Element {
  const { context } = props;
  // const { saveState } = context;
  // const [topics, setTopics] = useState<readonly Topic[]>([]);

  const [renderDone, setRenderDone] = useState<() => void>(() => () => {});
  const [colorScheme, setColorScheme] = useState<"dark" | "light">("light");
  const [operationMode, setOperationMode] = useState<number>(0);

  useLayoutEffect(() => {
    context.watch("topics");
    context.watch("colorScheme");
    context.onRender = (renderState, done) => {
      // setTopics(renderState.topics ?? []);
      setRenderDone(() => done);
      if (renderState.colorScheme) {
        setColorScheme(renderState.colorScheme);
      }
    };
  }, [context]);

  const publishAutowareEngageMode = ({ engage }: { engage: boolean }) => {
    context.publish?.(AUTOWARE_MSG.ENGAGE, { engage });
    log.info(`[PUBLISH] - ${AUTOWARE_MSG.ENGAGE}`);
  };

  const publishOperationMode = (mode: number) => {
    context.publish?.(AUTOWARE_MSG.CONTROL_STATE, { data: mode });
    log.info(`[PUBLISH] - ${AUTOWARE_MSG.CONTROL_STATE} : ${mode}`);
  };

  useLayoutEffect(() => {
    autowareAdvertisableTopicsList.forEach(({ topic, schemaName, options }) => {
      context.advertise?.(topic, schemaName, options);
    });

    return () => {
      autowareAdvertisableTopicsList.map(({ topic }) => context.unadvertise?.(topic));
    };
  }, [context]);

  useLayoutEffect(() => {
    renderDone();
  }, [renderDone]);

  if (!context.publish) {
    return (
      <ThemeProvider isDark={colorScheme === "dark"}>
        <EmptyState>
          <Stack style={{ padding: "min(5%, 8px)", textAlign: "center" }}>
            Please connect to a data source that supports publishing in order to use this panel
          </Stack>
        </EmptyState>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider isDark={colorScheme === "dark"}>
      <Stack
        fullHeight
        justifyContent="center"
        alignItems="center"
        style={{ padding: "min(5%, 8px)", textAlign: "center" }}
      >
        {operationMode === 0 && (
          <>
            <Stack direction="row" gap={2}>
              <Button
                onClick={() => publishAutowareEngageMode({ engage: true })}
                variant="outlined"
              >
                Engage
              </Button>
              <Button
                onClick={() => publishAutowareEngageMode({ engage: false })}
                variant="outlined"
              >
                Disengage
              </Button>
            </Stack>
            <br />
          </>
        )}

        {operationMode === 1 && (
          <Typography variant="body1" style={{ marginBottom: 10 }}>
            Please connect the logitech G29 Steering and paddle to control the control the vehicle.
          </Typography>
        )}

        <FormControl>
          <Select
            value={operationMode}
            label="Control mode"
            onChange={(val) => {
              const mode = parseInt(val.target.value as string);
              setOperationMode(mode);
              publishOperationMode(mode);
            }}
          >
            {AUTOWARE_OPERATION_MODES.map(({ title, value }) => (
              <MenuItem key={title} value={value}>
                {title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
    </ThemeProvider>
  );
}

export default AutowarePanel;
