# 3D (three.js): rarely the right call

## When to use it

- A product that is physical or spatial, a data world, or one signature reveal (a title or object) that 2D can't do.
- Not for showing software UI. Putting app screens on 3D slabs, bevelled 3D buttons and tilted pages read as cheap; flat UI with a screen-recorder zoom reads as premium.

## If you use it

- One persistent world; the camera is cinematography: keyed shots with real holds, one named move per shot, no continuous drift.
- Screens: `MeshBasicMaterial` with `toneMapped: false` (ACES tone mapping greys UI), rounded alpha map, anisotropy at max.
- Distances with a 35° vertical FOV and a 16×9 unit screen: about 20 units for a wide that leaves room for type, 13 for a medium, 6 for a close-up.
- Update the camera at the start of the frame; DOM labels, chips and the cursor project from it, otherwise they lag one seeked frame.
- Post-processing last; depth of field only on non-UI objects. `preserveDrawingBuffer: true` for screenshots; headless Edge with `--use-angle=d3d11 --ignore-gpu-blocklist`.
- Keep text in the DOM above the canvas, over dark areas, never over the white UI.
- The finale crane that shows the whole world only works if every earlier object is still in the scene.
