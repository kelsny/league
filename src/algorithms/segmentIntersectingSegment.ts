import { Vector2 } from "../linalg";

export function segmentIntersectingSegment(
    [a1, a2]: [Vector2, Vector2],
    [b1, b2]: [Vector2, Vector2]
) {
    const d = (b2.y - b1.y) * (a2.x - a1.x) - (b2.x - b1.x) * (a2.y - a1.y);

    const a = (b2.x - b1.x) * (a1.y - b1.y) - (b2.y - b1.y) * (a1.x - b1.x);
    const b = (a2.x - a1.x) * (a1.y - b1.y) - (a2.y - a1.y) * (a1.x - b1.x);

    const u = new Vector2(a / d, b / d);

    if (u.x >= 0 && u.x <= 1 && u.y >= 0 && u.y <= 1)
        return new Vector2(a1.x + u.x * (a2.x - a1.x), a1.y + u.x * (a2.y - a1.y));

    return undefined;
}
