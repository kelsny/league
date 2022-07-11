import { Vector2 } from "./linalg/index";

const terrain = [
    [
        { x: 165, y: 64 },
        { x: 80, y: 120 },
        { x: 102, y: 231 },
        { x: 234, y: 195 },
        { x: 262, y: 124 },
    ],
    [
        { x: 413, y: 69 },
        { x: 407, y: 154 },
        { x: 474, y: 255 },
        { x: 622, y: 311 },
        { x: 710, y: 242 },
        { x: 636, y: 111 },
        { x: 549, y: 102 },
        { x: 487, y: 60 },
    ],
    [
        { x: 136, y: 326 },
        { x: 76, y: 410 },
        { x: 122, y: 491 },
        { x: 200, y: 541 },
        { x: 328, y: 568 },
        { x: 497, y: 488 },
        { x: 434, y: 391 },
        { x: 308, y: 419 },
        { x: 226, y: 355 },
    ],
    [
        { x: 645, y: 399 },
        { x: 809, y: 378 },
        { x: 893, y: 485 },
        { x: 835, y: 598 },
        { x: 601, y: 618 },
        { x: 599, y: 501 },
    ],
    [
        { x: 230, y: 662 },
        { x: 120, y: 684 },
        { x: 82, y: 800 },
        { x: 140, y: 886 },
        { x: 244, y: 869 },
        { x: 355, y: 772 },
        { x: 498, y: 740 },
        { x: 446, y: 661 },
        { x: 340, y: 634 },
    ],
    [
        { x: 633, y: 725 },
        { x: 581, y: 823 },
        { x: 482, y: 858 },
        { x: 570, y: 936 },
        { x: 719, y: 909 },
        { x: 859, y: 793 },
        { x: 851, y: 701 },
        { x: 730, y: 702 },
    ],
    [
        { x: 787, y: 82 },
        { x: 819, y: 191 },
        { x: 882, y: 251 },
        { x: 988, y: 303 },
        { x: 986, y: 191 },
        { x: 954, y: 102 },
        { x: 877, y: 56 },
    ],
];

function drawCircle(x: number, y: number, radius: number, color: string) {
    ctx.beginPath();

    ctx.arc(x, y, radius, 0, Math.PI * 2, false);

    ctx.closePath();

    ctx.fillStyle = color;

    ctx.fill();
}

function strokeCircle(x: number, y: number, radius: number, color: string, width: number) {
    ctx.beginPath();

    ctx.arc(x, y, radius, 0, Math.PI * 2, false);

    ctx.closePath();

    ctx.lineWidth = width;

    ctx.strokeStyle = color;

    ctx.stroke();
}

function drawLine(fromX: number, fromY: number, toX: number, toY: number, color: string, width: number) {
    ctx.beginPath();

    ctx.moveTo(fromX, fromY);

    ctx.lineTo(toX, toY);

    ctx.closePath();

    ctx.lineWidth = width;

    ctx.strokeStyle = color;

    ctx.stroke();
}

const ward = {
    x: 345,
    y: 276,
    radius: 10,
    range: 250,
};

const canvas = document.querySelector("canvas")!;
const ctx = canvas.getContext("2d")!;

let animationFrameId = 0;

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (Math.hypot(mouse.x - ward.x, mouse.y - ward.y) <= ward.radius && mouse.down && !mouse.movedAfterDown) {
        mouse.target = ward;
        mouse.targetOffset = { x: mouse.x - ward.x, y: mouse.y - ward.y };
    }

    if (mouse.target) {
        mouse.target.x = mouse.x - mouse.targetOffset.x;
        mouse.target.y = mouse.y - mouse.targetOffset.y;
    }

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
    }

    // draw ward

    drawCircle(ward.x, ward.y, ward.radius, "green");

    // draw ward range

    strokeCircle(ward.x, ward.y, ward.range, "red", 2.5);

    // draw ward effective area

    const allPoints = terrain.flat();

    const pointsInRange = allPoints.filter(({ x, y }) => Math.hypot(ward.x - x, ward.y - y) <= ward.range);

    for (const p of pointsInRange) {
        drawCircle(p.x, p.y, 5, "blue");

        const v = new Vector2(p.x - ward.x, p.y - ward.y).normalize();

        v.multiply(ward.range - Math.hypot(p.x - ward.x, p.y - ward.y));

        drawLine(p.x, p.y, p.x + v.x, p.y + v.y, "orange", 1);
    }

    animationFrameId = requestAnimationFrame(render);
}

requestAnimationFrame(render);

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resize();

window.addEventListener("resize", resize);

const mouse = {
    x: 0,
    y: 0,
    down: false,
    movedAfterDown: false,
    target: undefined as { x: number; y: number } | undefined,
    targetOffset: undefined as { x: number; y: number } | undefined,
} as {
    x: number;
    y: number;
    down: boolean;
    movedAfterDown: boolean;
} & (
    | {
          target: undefined;
          targetOffset: undefined;
      }
    | {
          target: { x: number; y: number };
          targetOffset: { x: number; y: number };
      }
);

window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;

    mouse.movedAfterDown = true;
});

window.addEventListener("mousedown", (e) => {
    mouse.down = true;

    mouse.x = e.clientX;
    mouse.y = e.clientY;

    mouse.movedAfterDown = false;
});

window.addEventListener("mouseup", (e) => {
    mouse.down = false;

    mouse.target = undefined;

    mouse.targetOffset = undefined;

    mouse.movedAfterDown = false;
});

// canvas.requestPointerLock();
