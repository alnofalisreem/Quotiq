export function paintDrawing(canvas, items) {
    const c = canvas.getContext('2d');
    c.clearRect(0, 0, canvas.width, canvas.height);
    for (const s of items) {
        if (!s.points?.length) continue;
        c.globalCompositeOperation = s.tool === 'eraser' ? 'destination-out' : 'source-over';
        c.strokeStyle = s.color;
        c.fillStyle = s.color;
        c.lineWidth = s.size;
        c.lineCap = 'round';
        c.lineJoin = 'round';
        if (s.points.length === 1) {
            c.beginPath();
            c.arc(s.points[0].x, s.points[0].y, s.size / 2, 0, Math.PI * 2);
            c.fill();
        } else {
            c.beginPath();
            c.moveTo(s.points[0].x, s.points[0].y);
            for (const p of s.points.slice(1)) c.lineTo(p.x, p.y);
            c.stroke();
        }
    }
    c.globalCompositeOperation = 'source-over';
}
