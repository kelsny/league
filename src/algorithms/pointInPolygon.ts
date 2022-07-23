import { Vector2 } from "../linalg";

export const pointInPolygon = (point: Vector2, vertices: Vector2[]) => {
    point = point.clone();
    vertices = [...vertices.map((v) => v.clone())];

    const { x, y } = point;

    let inside = false;

    for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
        const { x: xi, y: yi } = vertices[i];

        const { x: xj, y: yj } = vertices[j];

        const intersecting = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

        if (intersecting) inside = !inside;
    }

    return inside;
};
