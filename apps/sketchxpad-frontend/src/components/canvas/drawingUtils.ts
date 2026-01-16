import type { DrawingElement, Point } from './types';

export const drawElement = (ctx: CanvasRenderingContext2D, element: DrawingElement) => {
    ctx.save();
    ctx.globalAlpha = element.opacity;
    ctx.strokeStyle = element.color;
    ctx.fillStyle = element.color;
    ctx.lineWidth = element.strokeWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    switch (element.type) {
        case "pen":
            if (element.points.length > 1) {
                ctx.beginPath();
                ctx.moveTo(element.points[0].x, element.points[0].y);
                for (let i = 1; i < element.points.length; i++) {
                    ctx.lineTo(element.points[i].x, element.points[i].y);
                }
                ctx.stroke();
            } else if (element.points.length === 1) {
                // Draw a single point
                ctx.beginPath();
                ctx.arc(
                    element.points[0].x,
                    element.points[0].y,
                    element.strokeWidth / 2,
                    0,
                    2 * Math.PI
                );
                ctx.fill();
            }
            break;

        case "rectangle":
            if (element.points.length >= 2) {
                const start = element.points[0];
                const end = element.points[element.points.length - 1];
                const width = end.x - start.x;
                const height = end.y - start.y;
                ctx.beginPath();
                ctx.rect(start.x, start.y, width, height);
                ctx.stroke();
            }
            break;

        case "ellipse":
            if (element.points.length >= 2) {
                const start = element.points[0];
                const end = element.points[element.points.length - 1];
                const centerX = (start.x + end.x) / 2;
                const centerY = (start.y + end.y) / 2;
                const radiusX = Math.abs(end.x - start.x) / 2;
                const radiusY = Math.abs(end.y - start.y) / 2;

                ctx.beginPath();
                ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
                ctx.stroke();
            }
            break;

        case "line":
            if (element.points.length >= 2) {
                const start = element.points[0];
                const end = element.points[element.points.length - 1];
                ctx.beginPath();
                ctx.moveTo(start.x, start.y);
                ctx.lineTo(end.x, end.y);
                ctx.stroke();
            }
            break;

        case "eraser":
            if (element.points.length > 1) {
                ctx.save();
                ctx.globalCompositeOperation = "destination-out";
                ctx.lineWidth = element.strokeWidth;
                ctx.lineCap = "round";
                ctx.lineJoin = "round";
                ctx.beginPath();
                ctx.moveTo(element.points[0].x, element.points[0].y);
                for (let i = 1; i < element.points.length; i++) {
                    ctx.lineTo(element.points[i].x, element.points[i].y);
                }
                ctx.stroke();
                ctx.restore();
            }
            break;

        case "arrow":
            if (element.points.length >= 2) {
                const start = element.points[0];
                const end = element.points[element.points.length - 1];

                // Draw the line
                ctx.beginPath();
                ctx.moveTo(start.x, start.y);
                ctx.lineTo(end.x, end.y);
                ctx.stroke();

                // Draw arrowhead
                const headLength = Math.max(10, element.strokeWidth * 2);
                const angle = Math.atan2(end.y - start.y, end.x - start.x);

                ctx.beginPath();
                ctx.moveTo(end.x, end.y);
                ctx.lineTo(
                    end.x - headLength * Math.cos(angle - Math.PI / 6),
                    end.y - headLength * Math.sin(angle - Math.PI / 6)
                );
                ctx.moveTo(end.x, end.y);
                ctx.lineTo(
                    end.x - headLength * Math.cos(angle + Math.PI / 6),
                    end.y - headLength * Math.sin(angle + Math.PI / 6)
                );
                ctx.stroke();
            }
            break;

        case "text":
            if (element.text && element.points.length > 0) {
                ctx.save();
                ctx.fillStyle = element.color;
                ctx.globalAlpha = element.opacity;
                // Better font sizing based on stroke width
                const fontSize = Math.max(16, element.strokeWidth * 8);
                ctx.font = `${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
                ctx.textBaseline = "top";
                ctx.fillText(
                    element.text,
                    element.points[0].x,
                    element.points[0].y
                );
                ctx.restore();
            }
            break;
    }

    ctx.restore();
};

export const getMousePos = (canvas: HTMLCanvasElement, e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
    };
};
