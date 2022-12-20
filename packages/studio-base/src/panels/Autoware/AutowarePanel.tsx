// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { Button } from "@mui/material";
import { useLayoutEffect, useState } from "react";

import { PanelExtensionContext, Topic } from "@foxglove/studio";
import Stack from "@foxglove/studio-base/components/Stack";
import ThemeProvider from "@foxglove/studio-base/theme/ThemeProvider";

type AutowarePanelProps = {
  context: PanelExtensionContext;
};

function AutowarePanel(props: AutowarePanelProps): JSX.Element {
  const { context } = props;
  // const { saveState } = context;

  const [topics, setTopics] = useState<readonly Topic[]>([]);

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

  const testPublish = () => {
    context.publish?.("/autoware/engage", {engage: true});
    console.log("done");
  };

  useLayoutEffect(() => {
    renderDone();
  }, [renderDone]);

  return (
    <ThemeProvider isDark={colorScheme === "dark"}>
      <Stack
        fullHeight
        justifyContent="center"
        alignItems="center"
        style={{ padding: "min(5%, 8px)", textAlign: "center" }}
      >
        <Button onClick={() => testPublish()} variant="outlined">
          Engage autoware
        </Button>
      </Stack>
    </ThemeProvider>
  );
}

export default AutowarePanel;
