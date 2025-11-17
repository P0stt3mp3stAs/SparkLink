
import { ThreeElements } from '@react-three/fiber';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      group: ThreeElements['group'];
      mesh: ThreeElements['mesh'];
      boxGeometry: ThreeElements['boxGeometry'];
      ambientLight: ThreeElements['ambientLight'];
      directionalLight: ThreeElements['directionalLight'];
    }
  }
}