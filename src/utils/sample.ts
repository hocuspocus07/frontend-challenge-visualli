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
        { id: "solar-heat", name: "Solar Heat", x: 0.25, y: 0.5, radius: 0.1, color: "#ffa500", childLayerId: "solar-heat-details" },
        { id: "water-surface", name: "Water Surface", x: 0.5, y: 0.5, radius: 0.1, color: "#00bfff" },
        { id: "vapor-formation", name: "Vapor Formation", x: 0.75, y: 0.5, radius: 0.1, color: "#87ceeb" },
      ],
    },
    "solar-heat-details": {
      id: "solar-heat-details",
      name: "Solar Heat Details",
      backgroundColor: "#ffa500",
      parentNodeId: "solar-heat",
      nodes: [
        { id: "infrared-radiation", name: "Infrared Radiation", x: 0.25, y: 0.5, radius: 0.08, color: "#ff8c00" ,childLayerId:"infrared-radiation-details"},
        { id: "molecular-excitation", name: "Molecular Excitation", x: 0.5, y: 0.5, radius: 0.08, color: "#ffd700" },
        { id: "evaporation-micros", name: "Micro Evaporation", x: 0.75, y: 0.5, radius: 0.08, color: "#ffb347" },
      ],
    },
    "infrared-radiation-details": {
      id:" infrared-radiation-details",
      name: "Infrared Radiation Details",
      backgroundColor: "#ff8c00",
      parentNodeId: "infrared-radiation",
      nodes:[
        { id: "wavelengths", name: "Wavelengths", x: 0.33, y: 0.5, radius: 0.06, color: "#ffa07a" },
        { id: "atmospheric-absorption", name: "Atmospheric Absorption", x: 0.66, y: 0.5, radius: 0.06, color: "#ff4500" },
      ]
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