// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/
//
// This file incorporates work covered by the following copyright and
// permission notice:
//
//   Copyright 2019-2021 Cruise LLC
//
//   This source code is licensed under the Apache License, Version 2.0,
//   found at http://www.apache.org/licenses/LICENSE-2.0
//   You may not use this file except in compliance with the License.

import { Button } from "@mui/material";

import { PanelExtensionContext } from "@foxglove/studio";
import PanelToolbar from "@foxglove/studio-base/components/PanelToolbar";
import Stack from "@foxglove/studio-base/components/Stack";

import helpContent from "./index.help.md";

type AutowarePanelProps = {
  context: PanelExtensionContext;
};

function AutowarePanel(props: AutowarePanelProps): JSX.Element {
  const { context } = props;

  return (
    <Stack fullHeight>
      <PanelToolbar helpContent={helpContent} />
      <Stack
        flex="auto"
        alignItems="center"
        justifyContent="center"
        fullHeight
        gap={2}
        paddingY={2}
        paddingX={3}
      >
        <Button
          onClick={() => {
            console.log("click done...");
          }}
          variant="outlined"
        >
          Autoware development.
        </Button>
      </Stack>
    </Stack>
  );
}

export default AutowarePanel;
