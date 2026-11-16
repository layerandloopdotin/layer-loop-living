import * as THREE from "three";

/** Join exact outer/inner edge samples; solid parts receive a sealed floor. */
export function shellClosure(outer: THREE.BufferGeometry, inner: THREE.BufferGeometry, segments: number, rings: number, closedBottom: boolean, closedTop = false) {
  const a = outer.getAttribute("position"), b = inner.getAttribute("position");
  const vertices: number[] = [];
  const triangle = (p: number[], q: number[], r: number[]) => vertices.push(...p, ...q, ...r);
  const point = (attribute: THREE.BufferAttribute | THREE.InterleavedBufferAttribute, i: number) => [attribute.getX(i), attribute.getY(i), attribute.getZ(i)];
  for (const edge of [0, rings]) {
    const row = edge * (segments + 1);
    const closed = edge === 0 ? closedBottom : closedTop;
    for (let i = 0; i < segments; i++) {
      const p = point(a, row + i), q = point(a, row + i + 1);
      if (closed) triangle(p, q, [0, p[1] ?? 0, 0]);
      else {
        const r = point(b, row + i), s = point(b, row + i + 1);
        triangle(p, q, r); triangle(q, s, r);
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geometry.computeVertexNormals();
  return geometry;
}