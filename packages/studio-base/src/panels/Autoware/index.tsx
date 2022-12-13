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

import ReactDOM from "react-dom";

import { PanelExtensionContext } from "@foxglove/studio";
import Panel from "@foxglove/studio-base/components/Panel";
import { StrictMode } from "react";
import { PanelExtensionAdapter } from "@foxglove/studio-base/components/PanelExtensionAdapter";
import { AutowareConfig } from "./types";

import { SaveConfig } from "@foxglove/studio-base/types/panels";

import AutowarePanel from "./AutowarePanel";
import helpContent from "./index.help.md";

export const defaultConfig: AutowareConfig = {};

function initPanel(context: PanelExtensionContext) {
  ReactDOM.render(
    <StrictMode>
      <AutowarePanel context={context} />
    </StrictMode>,
    context.panelElement,
  );

  return () => {
    ReactDOM.unmountComponentAtNode(context.panelElement);
  };
}

type Props = {
  config: unknown;
  saveConfig: SaveConfig<unknown>;
};

function AutowarePanelAdapter(props: Props) {
  return (
    <PanelExtensionAdapter
      config={props.config}
      saveConfig={props.saveConfig}
      help={helpContent}
      initPanel={initPanel}
    />
  );
}

AutowarePanelAdapter.panelType = "Autoware";
AutowarePanelAdapter.defaultConfig = defaultConfig;

export default Panel(AutowarePanelAdapter);
