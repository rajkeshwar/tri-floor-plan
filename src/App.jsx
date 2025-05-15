import { useState } from "react";
import {
  TriDropablePlugin,
  TriFloorPlan,
  TriPinPlugin,
  TriHighlightPlugin,
  TriZoomPlugin,
  TriSelectablePlugin,
  TriFloorPlanAPI,
  setTriAppConfig
} from "@tririga/tririga-react-components";
import { floorPlanSvg } from "./floor-plan-svg";
import { spaceCenterPoints } from "./space-center-points";
import "./App.css";

// Intercept fetch
const originalFetch = window.fetch;

// Monkey patch fetch to intercept request to /p/floorplans/spaceCenterPoints
// Since we dont have a backend, we need to intercept this request and return a custom response
window.fetch = async (...args) => {
  const [input, init] = args;
  const url = typeof input === "string" ? input : input.url;

  if (url.includes("/p/floorplans/spaceCenterPoints")) {
    console.log("Intercepted:", url);

    // Return custom 200 response
    const centerPointsResponse = new Response(
      JSON.stringify(spaceCenterPoints),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("centerPointsResponse:", centerPointsResponse);
    return centerPointsResponse;
  }

  // Let all other requests through
  return originalFetch(...args);
};

setTriAppConfig({
  instanceId: "-1",
  tririgaUrl: location.origin,
  contextPath: "/",
  modelAndView: null,
  appPath: "/",
  appExposedName: "floorplan",
  sso: false,
});

// Monkey patch TriFloorPlanAPI.getFloorplan to return a custom floorplan
// Since we dont have a backend, we need to intercept this request and return a custom response
TriFloorPlanAPI.getFloorplan = function () {
  return floorPlanSvg;
};

function App() {
  const oneSpace = {
    [TriSelectablePlugin.SPACE_ID]: "GSB.CB.2079",
  };

  const [selected, setSelected] = useState(oneSpace);
  const spacesList = spaceCenterPoints.map((space) => ({
    spaceId: String(space.recordId),
    type: "location",
  }));

  const plugins = [
    { id: 111, type: TriDropablePlugin },
    { id: 222, type: TriZoomPlugin.type },
    { id: 333, type: TriHighlightPlugin.type },
    {
      id: "pinsPlugin",
      type: TriPinPlugin.type,
      preservePinSizeRatio: false,
      pinSize: 32,
      selected,
      onSelectedChange: console.log,
    },
    {
      type: TriSelectablePlugin.type,
      id: "singleSelectPlugin",
      multi: false,
      selected,
      selectable: spacesList,
      onSelectedChange: (value) => setSelected(value),
    },
  ];

  return (
    <div className="container">
      <h3>TriFloorPlan Demo</h3>
      <TriFloorPlan floorPlanId={1158} plugins={plugins} />
    </div>
  );
}

export default App;
