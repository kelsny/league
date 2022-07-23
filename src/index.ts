import { pointInPolygon } from "./algorithms/pointInPolygon";
import { segmentIntersectingCircle } from "./algorithms/segmentIntersectingCircle";
import { Vector2 } from "./linalg/index";

const terrain = [
    [
        new Vector2(165, 64),
        new Vector2(80, 120),
        new Vector2(102, 231),
        new Vector2(234, 195),
        new Vector2(262, 124),
    ],
    [
        new Vector2(413, 69),
        new Vector2(407, 154),
        new Vector2(474, 255),
        new Vector2(622, 311),
        new Vector2(710, 242),
        new Vector2(636, 111),
        new Vector2(549, 102),
        new Vector2(487, 60),
    ],
    [
        new Vector2(136, 326),
        new Vector2(76, 410),
        new Vector2(122, 491),
        new Vector2(200, 541),
        new Vector2(328, 568),
        new Vector2(497, 488),
        new Vector2(434, 391),
        new Vector2(308, 419),
        new Vector2(226, 355),
    ],
    [
        new Vector2(645, 399),
        new Vector2(809, 378),
        new Vector2(893, 485),
        new Vector2(835, 598),
        new Vector2(601, 618),
        new Vector2(599, 501),
    ],
    [
        new Vector2(230, 662),
        new Vector2(120, 684),
        new Vector2(82, 800),
        new Vector2(140, 886),
        new Vector2(244, 869),
        new Vector2(355, 772),
        new Vector2(498, 740),
        new Vector2(446, 661),
        new Vector2(340, 634),
    ],
    [
        new Vector2(633, 725),
        new Vector2(581, 823),
        new Vector2(482, 858),
        new Vector2(570, 936),
        new Vector2(719, 909),
        new Vector2(859, 793),
        new Vector2(851, 701),
        new Vector2(730, 702),
    ],
    [
        new Vector2(787, 82),
        new Vector2(819, 191),
        new Vector2(882, 251),
        new Vector2(988, 303),
        new Vector2(986, 191),
        new Vector2(954, 102),
        new Vector2(877, 56),
    ],
];

function drawCircle(center: Vector2, radius: number, color: string) {
    ctx.beginPath();

    ctx.arc(center.x, center.y, radius, 0, Math.PI * 2, false);

    ctx.closePath();

    ctx.fillStyle = color;

    ctx.fill();
}

function strokeCircle(center: Vector2, radius: number, color: string, width: number) {
    ctx.beginPath();

    ctx.arc(center.x, center.y, radius, 0, Math.PI * 2, false);

    ctx.closePath();

    ctx.lineWidth = width;

    ctx.strokeStyle = color;

    ctx.stroke();
}

function drawLine(from: Vector2, to: Vector2, color: string, width: number) {
    ctx.beginPath();

    ctx.moveTo(from.x, from.y);

    ctx.lineTo(to.x, to.y);

    ctx.closePath();

    ctx.lineWidth = width;

    ctx.strokeStyle = color;

    ctx.stroke();
}

const ward = {
    pos: new Vector2(345, 276),
    radius: 8,
    range: 250,
};

const canvas = document.querySelector("canvas")!;
const ctx = canvas.getContext("2d")!;

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (
        Math.hypot(mouse.pos.x - ward.pos.x, mouse.pos.y - ward.pos.y) <= ward.radius &&
        mouse.down &&
        !mouse.movedAfterDown
    ) {
        mouse.target = ward.pos; // needs to be a reference to the vector
        mouse.targetOffset = mouse.pos.clone().subtract(ward.pos);
    }

    if (mouse.target)
        mouse.target.set(mouse.pos.x - mouse.targetOffset.x, mouse.pos.y - mouse.targetOffset.y);

    // draw terrain

    for (const t of terrain) {
        ctx.beginPath();

        ctx.moveTo(t[0].x, t[0].y);

        for (const p of t.slice(1)) {
            ctx.lineTo(p.x, p.y);
        }

        ctx.closePath();

        ctx.fillStyle = "black";

        ctx.fill();

        for (const p of t)
            drawCircle(
                p,
                4,
                `rgb(${new Array(3).fill((t.indexOf(p) * 255) / t.length).join(", ")})`
            );
    }

    const invalidPlacement = terrain.some((t) => pointInPolygon(ward.pos, t));

    // draw ward range

    strokeCircle(ward.pos, ward.range, "aqua", 2.5);

    if (!invalidPlacement) {
        // draw ward effective area

        const pointsInRange = terrain
            .map((t) => {
                const inRange = t.filter(
                    ({ x, y }) => Math.hypot(ward.pos.x - x, ward.pos.y - y) <= ward.range
                );

                if (!inRange.length) return [];

                if (inRange.length === t.length)
                    return inRange.map((point) => ({
                        point,
                        isEdge: false,
                    }));

                // rotate inRange if the list is broken up
                if (inRange.includes(t[0]) && inRange.includes(t[t.length - 1])) {
                    const rotateCount = t.findIndex((p, i) => p !== inRange[i]);

                    t.push(...t.splice(0, rotateCount));
                }

                const indexOfInRange = t.indexOf(inRange[0]);

                return [
                    {
                        point: t[indexOfInRange - 1] ?? t[t.length - 1],
                        isEdge: true,
                    },
                    ...inRange.map((point) => ({
                        point,
                        isEdge: false,
                    })),
                    {
                        point: t[indexOfInRange + inRange.length] ?? t[0],
                        isEdge: true,
                    },
                ];
            })
            .filter((t) => t.length);

        const hull = [] as Vector2[];

        for (const t of pointsInRange) {
            for (const { point, isEdge } of t) {
                hull.push(point);

                drawCircle(point, 4, isEdge ? "magenta" : "blue");

                if (!isEdge) {
                    const v = new Vector2(point.x - ward.pos.x, point.y - ward.pos.y).normalize();

                    v.multiply(ward.range - Math.hypot(point.x - ward.pos.x, point.y - ward.pos.y));

                    drawLine(point, v.clone().add(point), "orange", 1);

                    drawCircle(v.clone().add(point), 4, "brown");

                    // before adding to hull, check if this segment intersects its own terrain
                    hull.push(v.clone().add(point));
                }
            }

            for (let i = 1; i < t.length; i++) {
                const intersection = segmentIntersectingCircle(
                    t[i - 1].point,
                    t[i].point,
                    ward.pos,
                    ward.range
                );

                if (intersection) {
                    drawLine(t[i - 1].point, t[i].point, "red", 2);

                    intersection.filter(Boolean).map((p) => drawCircle(p!, 4, "green"));

                    if (intersection[0]) hull.push(intersection[0]);
                    if (intersection[1]) hull.push(intersection[1]);
                }
            }
        }

        hull.sort(
            (a, b) =>
                Math.atan2(a.x - ward.pos.x, a.y - ward.pos.y) -
                Math.atan2(b.x - ward.pos.x, b.y - ward.pos.y)
        );

        // later on will add arcs later so this will never be empty
        if (hull.length) {
            ctx.beginPath();

            ctx.moveTo(hull[0].x, hull[0].y);

            for (const p of hull.slice(1)) {
                ctx.lineTo(p.x, p.y);
            }

            ctx.closePath();

            ctx.fillStyle = "yellow";

            ctx.globalAlpha = 0.125;

            ctx.fill();

            ctx.globalAlpha = 1;
        }
    }

    // draw ward

    drawCircle(ward.pos, ward.radius, invalidPlacement ? "red" : "green");

    animationFrameId = requestAnimationFrame(render);
}

let animationFrameId = requestAnimationFrame(render);

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resize();

window.addEventListener("resize", resize);

const mouse = {
    pos: new Vector2(0, 0),
    down: false,
    movedAfterDown: false,
    target: undefined,
    targetOffset: undefined,
} as {
    pos: Vector2;
    down: boolean;
    movedAfterDown: boolean;
} & (
    | {
          target: undefined;
          targetOffset: undefined;
      }
    | {
          target: Vector2;
          targetOffset: Vector2;
      }
);

window.addEventListener("mousemove", (e) => {
    mouse.pos.x = e.clientX;
    mouse.pos.y = e.clientY;

    mouse.movedAfterDown = true;
});

window.addEventListener("mousedown", (e) => {
    mouse.down = true;

    mouse.pos.x = e.clientX;
    mouse.pos.y = e.clientY;

    mouse.movedAfterDown = false;
});

window.addEventListener("mouseup", (e) => {
    mouse.down = false;

    mouse.target = undefined;

    mouse.targetOffset = undefined;

    mouse.movedAfterDown = false;
});

// canvas.requestPointerLock();
