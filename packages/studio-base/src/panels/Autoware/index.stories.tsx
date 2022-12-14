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

// import { action } from "@storybook/addon-actions";
import { Story, StoryContext } from "@storybook/react";

// import { PlayerCapabilities } from "@foxglove/studio-base/players/types";
import PanelSetup from "@foxglove/studio-base/stories/PanelSetup";

import AutowarePanel from "./index";

// const fixture = {
//   topics: [],
//   datatypes: new Map(
//     Object.entries({
//       Foo: { definitions: [] },
//     }),
//   ),
//   frame: {},
//   capabilities: [],
//   globalVariables: { globalVariable: 3.5 },
// };

export default {
  title: "panels/Autoware",
  component: AutowarePanel,
  decorators: [
    (StoryComponent: Story, { parameters }: StoryContext): JSX.Element => {
      return (
        <PanelSetup fixture={parameters.panelSetup?.fixture}>
          <StoryComponent />
        </PanelSetup>
      );
    },
  ],
};

export const Unconfigured = (): JSX.Element => {
  return <AutowarePanel />;
};

export const WithSettings = (): JSX.Element => {
  return <AutowarePanel overrideConfig={{ topic: "/abc" }} />;
};

WithSettings.parameters = {
  colorScheme: "light",
  includeSettings: false,
};

export const WithTopic = (): JSX.Element => {
  return <AutowarePanel overrideConfig={{ topic: "/abc" }} />;
};
