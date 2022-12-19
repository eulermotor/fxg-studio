// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { action } from "@storybook/addon-actions";
import { Story, StoryContext } from "@storybook/react";

import { PlayerCapabilities } from "@foxglove/studio-base/players/types";
import PanelSetup from "@foxglove/studio-base/stories/PanelSetup";

import AutowarePanel from "./index";

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

export const Unconfigured = (): JSX.Element => {
  return <AutowarePanel />;
};

export const WithSettings = (): JSX.Element => {
  return <AutowarePanel overrideConfig={{ topic: "/abc" }} />;
};

WithSettings.parameters = {
  colorScheme: "dark",
  includeSettings: true,
};

export const WithTopic = (): JSX.Element => {
  return <AutowarePanel overrideConfig={{ topic: "/abc" }} />;
};
