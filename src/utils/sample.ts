import type { VisualizationConfig } from "./visualisation-store"

export const sampleData: VisualizationConfig = {
  rootLayerId: "water-cycle",
  layers: {
    "water-cycle": {
      id: "water-cycle",
      name: "Water Cycle",
      backgroundColor: "#0f3460",
      parentNodeId: undefined,
      nodes: [
        {
          id: "evaporation",
          name: "Evaporation",
          x: 0.25,
          y: 0.5,
          radius: 0.1,
          color: "#e94560",
          childLayerId: "evaporation-details",
        },
        {
          id: "condensation",
          name: "Condensation",
          x: 0.5,
          y: 0.5,
          radius: 0.1,
          color: "#16c784",
          childLayerId: "condensation-details",
        },
        {
          id: "precipitation",
          name: "Precipitation",
          x: 0.75,
          y: 0.5,
          radius: 0.1,
          color: "#0084ff",
          childLayerId: "precipitation-details",
        },
      ],
    },
    "evaporation-details": {
      id: "evaporation-details",
      name: "Evaporation Details",
      backgroundColor: "#e94560",
      parentNodeId: "evaporation",
      nodes: [
        { id: "solar-heat", name: "Solar Heat", x: 0.25, y: 0.5, radius: 0.1, color: "#ffa500" },
        { id: "water-surface", name: "Water Surface", x: 0.5, y: 0.5, radius: 0.1, color: "#00bfff" },
        { id: "vapor-formation", name: "Vapor Formation", x: 0.75, y: 0.5, radius: 0.1, color: "#87ceeb" },
      ],
    },
    "condensation-details": {
      id: "condensation-details",
      name: "Condensation Details",
      backgroundColor: "#16c784",
      parentNodeId: "condensation",
      nodes: [
        { id: "cooling", name: "Cooling", x: 0.25, y: 0.5, radius: 0.1, color: "#4169e1" },
        { id: "nucleation", name: "Nucleation", x: 0.5, y: 0.5, radius: 0.1, color: "#6495ed" },
        { id: "cloud-formation", name: "Cloud Formation", x: 0.75, y: 0.5, radius: 0.1, color: "#add8e6" },
      ],
    },
    "precipitation-details": {
      id: "precipitation-details",
      name: "Precipitation Details",
      backgroundColor: "#0084ff",
      parentNodeId: "precipitation",
      nodes: [
        { id: "rain", name: "Rain", x: 0.25, y: 0.5, radius: 0.1, color: "#1e90ff" },
        { id: "snow", name: "Snow", x: 0.5, y: 0.5, radius: 0.1, color: "#f0f8ff" },
        { id: "collection", name: "Collection", x: 0.75, y: 0.5, radius: 0.1, color: "#00008b" },
      ],
    },
  },
}