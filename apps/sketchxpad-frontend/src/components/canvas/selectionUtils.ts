import type { DrawingElement, Point } from './types';

export const findElementAtPoint = (point: Point, elements: DrawingElement[]): DrawingElement | null => {
    // Check elements in reverse order (top to bottom)
    for (let i = elements.length - 1; i >= 0; i--) {
        const element = elements[i];

        switch (element.type) {
            case "text":
                if (element.text && element.points.length > 0) {
                    // Simple bounding box check for text
                    const fontSize = Math.max(16, element.strokeWidth * 8);
                    const textWidth = element.text.length * fontSize * 0.6; // Rough estimation
                    const textHeight = fontSize;
                    const textPoint = element.points[0];

                    if (
                        point.x >= textPoint.x &&
                        point.x <= textPoint.x + textWidth &&
                        point.y >= textPoint.y &&
                        point.y <= textPoint.y + textHeight
                    ) {
                        return element;
                    }
                }
                break;

            case "rectangle":
                if (element.points.length >= 2) {
                    const start = element.points[0];
                    const end = element.points[1];
                    const left = Math.min(start.x, end.x);
                    const right = Math.max(start.x, end.x);
                    const top = Math.min(start.y, end.y);
                    const bottom = Math.max(start.y, end.y);

                    if (
                        point.x >= left &&
                        point.x <= right &&
                        point.y >= top &&
                        point.y <= bottom
                    ) {
                        return element;
                    }
                }
                break;

            case "ellipse":
                if (element.points.length >= 2) {
                    const start = element.points[0];
                    const end = element.points[1];
                    const centerX = (start.x + end.x) / 2;
                    const centerY = (start.y + end.y) / 2;
                    const radiusX = Math.abs(end.x - start.x) / 2;
                    const radiusY = Math.abs(end.y - start.y) / 2;

                    // Check if point is inside ellipse using the ellipse equation
                    const dx = point.x - centerX;
                    const dy = point.y - centerY;
                    const ellipseValue =
                        (dx * dx) / (radiusX * radiusX) +
                        (dy * dy) / (radiusY * radiusY);

                    if (ellipseValue <= 1) {
                        return element;
                    }
                }
                break;

            case "line":
            case "arrow":
                if (element.points.length >= 2) {
                    const start = element.points[0];
                    const end = element.points[1];
                    // Check if point is near the line (within stroke width)
                    const lineLength = Math.sqrt(
                        Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
                    );
                    if (lineLength > 0) {
                        const dotProduct =
                            ((point.x - start.x) * (end.x - start.x) +
                                (point.y - start.y) * (end.y - start.y)) /
                            (lineLength * lineLength);

                        if (dotProduct >= 0 && dotProduct <= 1) {
                            const closestX = start.x + dotProduct * (end.x - start.x);
                            const closestY = start.y + dotProduct * (end.y - start.y);
                            const distance = Math.sqrt(
                                Math.pow(point.x - closestX, 2) +
                                Math.pow(point.y - closestY, 2)
                            );

                            if (distance <= element.strokeWidth + 5) {
                                return element;
                            }
                        }
                    }
                }
                break;

            case "pen":
            case "eraser":
                // Check if point is near any point of the path
                for (let j = 0; j < element.points.length; j++) {
                    const pathPoint = element.points[j];
                    const distance = Math.sqrt(
                        Math.pow(point.x - pathPoint.x, 2) +
                        Math.pow(point.y - pathPoint.y, 2)
                    );

                    if (distance <= element.strokeWidth + 5) {
                        return element;
                    }
                }
                break;
        }
    }
    return null;
};

export const drawSelectionOutline = (
    ctx: CanvasRenderingContext2D,
    element: DrawingElement
) => {
    ctx.save();
    ctx.strokeStyle = "#007ACC";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);

    // Draw appropriate selection outline based on element type
    if (element.type === "ellipse" && element.points.length >= 2) {
        // For ellipses, draw an elliptical selection outline
        const start = element.points[0];
        const end = element.points[1];
        const centerX = (start.x + end.x) / 2;
        const centerY = (start.y + end.y) / 2;
        const radiusX = Math.abs(end.x - start.x) / 2;
        const radiusY = Math.abs(end.y - start.y) / 2;

        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
        ctx.stroke();

        // Draw resize handles for ellipse
        const handleSize = 8;
        ctx.fillStyle = "#007ACC";
        ctx.setLineDash([]);

        // 8 handles around the ellipse
        const handlePositions = [
            { x: centerX + radiusX, y: centerY }, // Right
            { x: centerX - radiusX, y: centerY }, // Left
            { x: centerX, y: centerY + radiusY }, // Bottom
            { x: centerX, y: centerY - radiusY }, // Top
            {
                x: centerX + radiusX * Math.cos(Math.PI / 4),
                y: centerY + radiusY * Math.sin(Math.PI / 4),
            }, // Bottom-right
            {
                x: centerX - radiusX * Math.cos(Math.PI / 4),
                y: centerY + radiusY * Math.sin(Math.PI / 4),
            }, // Bottom-left
            {
                x: centerX + radiusX * Math.cos(Math.PI / 4),
                y: centerY - radiusY * Math.sin(Math.PI / 4),
            }, // Top-right
            {
                x: centerX - radiusX * Math.cos(Math.PI / 4),
                y: centerY - radiusY * Math.sin(Math.PI / 4),
            }, // Top-left
        ];

        handlePositions.forEach((handle) => {
            ctx.fillRect(
                handle.x - handleSize / 2,
                handle.y - handleSize / 2,
                handleSize,
                handleSize
            );
        });
    } else {
        // For other shapes, draw rectangular bounding box
        let minX = Infinity,
            minY = Infinity,
            maxX = -Infinity,
            maxY = -Infinity;

        if (element.type === "text" && element.text) {
            const fontSize = Math.max(16, element.strokeWidth * 8);
            const textWidth = element.text.length * fontSize * 0.6;
            const textHeight = fontSize;
            const textPoint = element.points[0];

            minX = textPoint.x;
            minY = textPoint.y;
            maxX = textPoint.x + textWidth;
            maxY = textPoint.y + textHeight;
        } else {
            element.points.forEach((point) => {
                minX = Math.min(minX, point.x);
                minY = Math.min(minY, point.y);
                maxX = Math.max(maxX, point.x);
                maxY = Math.max(maxY, point.y);
            });

            // Add some padding
            const padding = element.strokeWidth + 5;
            minX -= padding;
            minY -= padding;
            maxX += padding;
            maxY += padding;
        }

        ctx.beginPath();
        ctx.rect(minX, minY, maxX - minX, maxY - minY);
        ctx.stroke();

        // Draw resize handles
        const handleSize = 8;
        ctx.fillStyle = "#007ACC";
        ctx.setLineDash([]);

        // Corner handles
        const corners = [
            { x: minX, y: minY }, // Top-left
            { x: maxX, y: minY }, // Top-right
            { x: minX, y: maxY }, // Bottom-left
            { x: maxX, y: maxY }, // Bottom-right
        ];

        corners.forEach((corner) => {
            ctx.fillRect(
                corner.x - handleSize / 2,
                corner.y - handleSize / 2,
                handleSize,
                handleSize
            );
        });

        // Side handles (middle of edges)
        const sideHandles = [
            { x: (minX + maxX) / 2, y: minY }, // Top
            { x: (minX + maxX) / 2, y: maxY }, // Bottom
            { x: minX, y: (minY + maxY) / 2 }, // Left
            { x: maxX, y: (minY + maxY) / 2 }, // Right
        ];

        sideHandles.forEach((handle) => {
            ctx.fillRect(
                handle.x - handleSize / 2,
                handle.y - handleSize / 2,
                handleSize,
                handleSize
            );
        });
    }

    ctx.restore();
};
