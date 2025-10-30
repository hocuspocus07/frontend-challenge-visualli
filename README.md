# Multi-Layer Interactive Visualization

An interactive web application for visualizing hierarchical data through smooth, zoomable layer transitions. Built with Next.js, TypeScript, canvas, and Zustand.

##  Demo

https://youtu.be/yze3qflgKGQ

##  Overview

This application provides an intuitive way to explore complex hierarchical data structures. Users can navigate through multiple layers using smooth animations, with each layer containing nodes arranged in a circular pattern. The implementation features continuous zoom functionality and multiple navigation methods.

**Problem Solved**: Traditional hierarchical data visualization tools lack smooth, intuitive navigation. This solution provides a Google Maps-like zoom experience for exploring multi-layered data structures with fluid animations and responsive design.

**Key Features:**

- Smooth layer transitions with custom animation engine
- Click-to-zoom into parent circles with automatic layer transitions
- Multiple navigation methods (click, scroll, keyboard, breadcrumbs)
- Dynamic background color transitions
- Responsive design for desktop and mobile
- Performance-optimized native Canvas rendering
- Touch support with pinch-zoom and pan gestures

##  Design

### Architectural Approach

**Layered Architecture**:
- **Presentation Layer**: React components for UI controls and canvas rendering
- **State Management Layer**: Zustand store managing navigation, transforms, and animations
- **Rendering Layer**: Native HTML5 Canvas for high-performance graphics
- **Animation Layer**: Custom requestAnimationFrame-based animation system with easing functions

**Data Structure**:
```
VisualizationConfig
├── canvasStyle (dimensions, background)
├── rootLayerId (entry point)
└── layers (hierarchical structure)
    ├── Layer 1
    │   ├── nodes (circles with metadata)
    │   ├── backgroundColor
    │   └── parentNodeId (reference to parent)
    └── Layer 2
        ├── nodes
        └── backgroundColor
```

### UI/UX Approach

1. **Zoom-to-Circle Navigation**: Click any circle to smoothly zoom and pan into it, centering the circle on screen
2. **Breadcrumb Navigation**: Visual hierarchy showing current position with quick-jump capability
3. **Responsive Controls**: Desktop sidebar with layer bubbles + mobile floating action buttons
4. **Keyboard Shortcuts**: H (home), Escape/Up Arrow (zoom out)
5. **Touch Support**: Pinch-zoom and single-finger pan on mobile devices
6. **Background Transitions**: Smooth 500ms color transitions when entering new layers
7. **Visual Feedback**: Hover effects on nodes, disabled states during animations

### Component Structure

```
app/page.tsx (Main layout & state initialization)
├── VisualizationCanvas (Canvas rendering & interactions)
│   ├── Canvas element with transform matrix
│   ├── Node rendering with hover detection
│   └── Mouse/touch event handlers
├── NavigationControls (Desktop sidebar)
│   ├── Home button
│   └── Layer navigation bubbles
├── BreadcrumbNavigation (Layer hierarchy)
│   ├── Current layer indicator
│   └── Quick-jump buttons
└── KeyboardShortcuts (Keyboard event handling)
```

### How It Works

**Zoom-to-Circle Animation**:
1. User clicks a node
2. Calculate scale to fit circle on screen with padding
3. Calculate pan to center the circle
4. Animate zoom over 600ms with ease-out-cubic easing
5. Animate pan over 600ms in parallel
6. Switch to child layer mid-animation
7. Render child layer nodes

**Background Color Transition**:
- Smooth CSS transition (500ms) when layer changes
- Color flows naturally between parent and child layers
- Creates visual continuity during navigation

**Layer Transform Persistence**:
- Each layer remembers its zoom/pan state
- When returning to a layer, restore previous transform
- Provides intuitive "back" behavior

##  Tech Choices

### Core Technologies

| Technology | Version | Justification |
|-----------|---------|---------------|
| **Next.js** | 16.0.0 | Server-side rendering, API routes, optimal performance, built-in optimizations |
| **React** | 19.2.0 | Component-based UI, hooks for state management, excellent ecosystem |
| **TypeScript** | 5.x | Type safety, better IDE support, fewer runtime errors, self-documenting code |
| **Zustand** | 5.0.8 | Lightweight state management, minimal boilerplate, no provider hell |
| **Tailwind CSS** | 4.x | Utility-first styling, responsive design, excellent performance |
| **HTML5 Canvas** | Native | High-performance rendering, smooth animations, direct control |

### Animation System

Custom `requestAnimationFrame`-based animation engine with:
- **Easing Functions**: ease-out-cubic (smooth deceleration), ease-in-out-quad
- **Concurrent Animations**: Multiple animations can run simultaneously
- **Smooth 60fps**: Optimized for 60 frames per second
- **Automatic Cleanup**: Animations are properly cancelled and cleaned up
- **Animation Locking**: Prevents animation conflicts with `isAnimating` flag

##  Tests

### Running Tests

```bash
# Install dependencies
npm install
# or
pnpm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

##  Working Code (Runnable Locally)

### Quick Start

1. **Clone and Install**
```bash
git clone https://github.com/hocuspocus07/frontend-challenge-visualli.git
cd frontend-challenge-visualli
npm install
```

2. **Run Development Server**
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

3. **Customize Data**
Edit `/utils/sample.ts` to add your own hierarchical data:

```typescript
export const sampleData: VisualizationConfig = {
  canvasStyle: {
    width: 1200,
    height: 800,
    backgroundColor: "#1a1a2e",
  },
  rootLayerId: "root",
  layers: {
    "root": {
      id: "root",
      name: "Root Layer",
      backgroundColor: "#0f3460",
      nodes: [
        {
          id: "node-1",
          name: "Node 1",
          x: 300,
          y: 200,
          radius: 60,
          color: "#e94560",
          childLayerId: "layer-1",
        },
        {
          id: "node-2",
          name: "Node 2",
          x: 600,
          y: 200,
          radius: 60,
          color: "#16c784",
          childLayerId: "layer-2",
        },
      ],
    },
    "layer-1": {
      id: "layer-1",
      name: "Layer 1",
      backgroundColor: "#e94560",
      parentNodeId: "node-1",
      nodes: [
        {
          id: "child-1",
          name: "Child 1",
          x: 300,
          y: 200,
          radius: 50,
          color: "#ffa500",
        },
        // More child nodes...
      ],
    },
  },
}
```

### Project Structure

```
src/
├── app/
│   ├── page.tsx              # Main page with layout
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles & design tokens
├── components/
│   ├── visualisation-canvas.tsx    # Canvas rendering & interactions
│   ├── navigation-control.tsx     # Desktop sidebar controls
│   ├── breadcrumb.tsx   # Breadcrumb UI
│   └── keyboard-short.tsx      # Keyboard event handling
├── utils/
│   ├── visualisation-store.ts      # Zustand store (state management)
│   ├── animation.ts    # Animation engine with easing
│   ├── canvas-renderer.ts    # Canvas utilities
│   └── sample.ts        # Example hierarchical data
└── public/
    └── (static assets)
```

### Key Features Explained

**Smooth Zoom Animations**
- 600ms ease-out-cubic transitions
- Zoom centered on clicked node
- Automatic layer switching at zoom thresholds

**Dynamic Background Colors**
- Smooth 500ms transitions between layer colors
- Creates visual continuity during navigation
- Each layer has its own background color

**Mobile Responsive**
- Touch support with pinch-zoom and pan
- Floating action buttons on mobile
- Adaptive breadcrumb navigation
- Responsive canvas sizing

**Keyboard Shortcuts**
- H: Return to home (root layer)
- Escape/Up Arrow: Zoom out to parent layer
- Easy navigation without mouse

**Breadcrumb Navigation**
- Shows current position in hierarchy
- Click any breadcrumb to jump to that layer
- Visual indicator of current layer
- Expandable on mobile with "..." button

**High Performance**
- Native Canvas API (no external rendering library)
- Optimized animation engine
- 60fps smooth animations
- Efficient state management with Zustand

### Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

### Troubleshooting

**Animations feel choppy**
- Check browser performance (DevTools > Performance tab)
- Reduce canvas size in sample.ts
- Close other browser tabs consuming resources
- Ensure hardware acceleration is enabled

**Touch interactions not working**
- Ensure device has touch support
- Check browser console for errors
- Test on actual device (not just browser emulation)
- Verify touch event listeners are attached

**Background color not transitioning**
- Verify layer has backgroundColor property
- Check CSS for conflicting styles
- Ensure animation duration is sufficient (500ms)
- Check browser DevTools for CSS errors

**Zoom not centering on node**
- Verify node has correct x, y coordinates
- Check canvas dimensions match actual canvas size
- Ensure canvasWidth and canvasHeight are set in store
- Verify node radius is reasonable (50-100px)

## Customization Guide

### Adding New Layers

1. Add a new layer object to the `layers` object in `sample.ts`
2. Set `parentNodeId` to reference the parent node
3. Add nodes with positions and colors
4. Reference the layer ID in a parent node's `childLayerId`

### Changing Colors

- **Background**: Edit `backgroundColor` in layer definition
- **Nodes**: Edit `color` property in node definition
- **Canvas**: Edit `canvasStyle.backgroundColor` in config

### Adjusting Animation Speed

Edit animation durations in `utils/visualization-store.ts`:
- `zoomIn()`: Change 600 to desired milliseconds
- `animatePan()`: Change 300 to desired milliseconds
- `animateZoom()`: Change duration parameter

### Modifying Node Positions

Edit `x` and `y` coordinates in node definitions. Canvas uses standard coordinate system (0,0 at top-left).

##  Data Configuration Reference

```typescript
interface CanvasNode {
  id: string              // Unique identifier
  name: string            // Display name
  x: number              // X coordinate on canvas
  y: number              // Y coordinate on canvas
  radius: number         // Circle radius in pixels
  color: string          // Hex color code
  childLayerId?: string  // Reference to child layer (optional)
}

interface CanvasLayer {
  id: string                    // Unique identifier
  name: string                  // Display name
  backgroundColor: string       // Hex color code
  nodes: CanvasNode[]          // Array of nodes
  parentNodeId?: string        // Reference to parent node (optional)
}

interface VisualizationConfig {
  canvasStyle: {
    width: number              // Canvas width in pixels
    height: number             // Canvas height in pixels
    backgroundColor: string    // Default background color
  }
  layers: Record<string, CanvasLayer>  // All layers
  rootLayerId: string                  // Starting layer ID
}
```

##  Low level info

### State Management with Zustand

The store manages:
- **currentLayerId**: Which layer you're viewing
- **navigationHistory**: Breadcrumb trail of visited layers
- **canvasTransform**: Current zoom and pan state
- **layerTransforms**: Saved transforms for each layer
- **isAnimating**: Flag to prevent animation conflicts

### Canvas Rendering

1. Get current layer from store
2. Clear canvas
3. Apply transform matrix (zoom + pan)
4. Render each node as a circle
5. Add text labels
6. Handle hover effects

### Animation Pipeline

1. User triggers action (click, scroll, keyboard)
2. Calculate target transform (zoom, pan)
3. Start animation with requestAnimationFrame
4. Update store on each frame
5. Canvas re-renders with new transform
6. Animation completes, unlock interactions
