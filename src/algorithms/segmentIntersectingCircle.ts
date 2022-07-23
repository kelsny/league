import { Vector2 } from "../linalg";

export const segmentIntersectingCircle = (start: Vector2, end: Vector2, center: Vector2, radius: number) => {
    start = start.clone();
    end = end.clone();
    center = center.clone();

    // start first makes it easier later on
    if (end.x < start.x) [start, end] = [end, start];

    const d = end.clone().subtract(start);

    const f = start.clone().subtract(center);

    const a = d.dot(d);

    const b = 2 * f.dot(d);

    const c = f.dot(f) - radius * radius;

    const discriminant = b * b - 4 * a * c;

    if (discriminant >= 0) {
        const sqrt = Math.sqrt(discriminant);

        const t1 = (-b - sqrt) / (2 * a);
        const t2 = (-b + sqrt) / (2 * a);

        if ((t1 >= 0 && t1 <= 1) || (t2 >= 0 && t2 <= 1)) {
            const s = start.clone().subtract(center);
            const e = end.clone().subtract(center);

            const slope = e.x - s.x ? (e.y - s.y) / (e.x - s.x) : Number.MAX_SAFE_INTEGER;

            const intercept = s.y - s.x * slope;

            const a = -slope;

            const b = 1;

            const c = -intercept;

            const x0 = (-a * c) / (a * a + b * b);
            const y0 = (-b * c) / (a * a + b * b);

            if (c * c > radius * radius * (a * a + b * b) + Number.EPSILON) {
            } else if (Math.abs(c * c - radius * radius * (a * a + b * b)) < Number.EPSILON) {
            } else {
                const d = radius * radius - (c * c) / (a * a + b * b);

                const mult = Math.sqrt(d / (a * a + b * b));

                const ax = x0 + b * mult;
                const bx = x0 - b * mult;

                const ay = y0 - a * mult;
                const by = y0 + a * mult;

                const i = center.clone().add(new Vector2(ax, ay));
                const j = center.clone().add(new Vector2(bx, by));

                const min = new Vector2(Math.min(start.x, end.x), Math.min(start.y, end.y));
                const max = new Vector2(Math.max(start.x, end.x), Math.max(start.y, end.y));

                const out = [
                    i.x >= min.x && i.x <= max.x && i.y >= min.y && i.y <= max.y ? i : undefined,
                    j.x >= min.x && j.x <= max.x && j.y >= min.y && j.y <= max.y ? j : undefined,
                ] as [undefined, Vector2] | [Vector2, undefined] | [Vector2, Vector2];

                return out;
            }
        }
    }

    return undefined;
};
