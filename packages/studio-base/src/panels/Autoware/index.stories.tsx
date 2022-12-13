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

import AutowarePanel from "./index";
import PanelSetup from "@foxglove/studio-base/stories/PanelSetup";
import { Story, StoryContext } from "@storybook/react";
import { PlayerCapabilities } from "@foxglove/studio-base/players/types";
import { action } from "@storybook/addon-actions";

const fixture = {
  topics: [],
  datatypes: new Map(
    Object.entries({
      Foo: { definitions: [] },
    }),
  ),
  frame: {},
  capabilities: [],
  globalVariables: { globalVariable: 3.5 },
};

export default {
  title: "panels/Autoware",
  component: AutowarePanel,
  decorators: [
    (StoryComponent: Story, context: StoryContext): JSX.Element => {
      return (
        <PanelSetup
          fixture={{ capabilities: [PlayerCapabilities.advertise], publish: action("publish") }}
          includeSettings={context.parameters.includeSettings}
        >
          <StoryComponent />
        </PanelSetup>
      );
    },
  ],
};

export function Example(): JSX.Element {
  return (
    <PanelSetup fixture={fixture}>
      <AutowarePanel />
    </PanelSetup>
  );
}

export function NarrowLayout(): JSX.Element {
  return (
    <PanelSetup fixture={fixture}>
      <div style={{ width: 400 }}>
        <AutowarePanel />
      </div>
    </PanelSetup>
  );
}

export function WithSettings(): JSX.Element {
  return (
    <PanelSetup fixture={fixture} includeSettings>
      <AutowarePanel />
    </PanelSetup>
  );
}

WithSettings.parameters = {
  colorScheme: "light",
  includeSettings: false,
};
