// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { Button, Typography } from "@mui/material";
import { useLayoutEffect, useRef, useState } from "react";

import { PanelExtensionContext } from "@foxglove/studio";
import Stack from "@foxglove/studio-base/components/Stack";
import ThemeProvider from "@foxglove/studio-base/theme/ThemeProvider";

type AutowarePanelProps = {
  context: PanelExtensionContext;
};

const inputStyle = { marginBottom: 5, padding: "8px 10px" };
function WebRTCStreamPanel(props: AutowarePanelProps): JSX.Element {
  const { context } = props;

  const [renderDone, setRenderDone] = useState<() => void>(() => () => {});
  const [colorScheme, setColorScheme] = useState<"dark" | "light">("light");

  const inputRef = useRef<HTMLInputElement>(ReactNull);
  const [connectionStr, setConnectionStr] = useState<string | undefined>(undefined);

  useLayoutEffect(() => {
    context.watch("topics");
    context.watch("colorScheme");
    context.onRender = (renderState, done) => {
      setRenderDone(() => done);
      if (renderState.colorScheme) {
        setColorScheme(renderState.colorScheme);
      }
    };
  }, [context]);

  const isValidConnectionURL = connectionStr != undefined && connectionStr.length > 0;

  return (
    <ThemeProvider isDark={colorScheme === "dark"}>
      <Stack
        justifyContent="center"
        fullHeight
        alignItems="center"
        style={{ padding: "min(5%, 8px)", textAlign: "center" }}
      >
        {isValidConnectionURL && (
          <iframe style={{ width: "100%", height: "100%" }} src={connectionStr}></iframe>
        )}

        {!isValidConnectionURL && (
          <>
            <Typography variant="body1" style={{ marginBottom: 10 }}>
              Please enter WebRTC server connection URL.
            </Typography>
            <input placeholder="connection string" style={inputStyle} ref={inputRef} type="text" />
            <Button onClick={() => setConnectionStr(inputRef.current?.value)} variant="outlined">
              Connect
            </Button>
          </>
        )}
      </Stack>
    </ThemeProvider>
  );
}

export default WebRTCStreamPanel;
