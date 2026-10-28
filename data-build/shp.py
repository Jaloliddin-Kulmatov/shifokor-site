"""Minimal shapefile (polygon) + dbf reader, no dependencies."""
import struct


def read_dbf(path, encoding="utf-8"):
    with open(path, "rb") as f:
        data = f.read()
    n = struct.unpack("<I", data[4:8])[0]
    hlen, rlen = struct.unpack("<HH", data[8:12])
    fields, pos = [], 32
    while data[pos] != 0x0D:
        name = data[pos:pos + 11].split(b"\x00")[0].decode("ascii")
        ftype = chr(data[pos + 11])
        flen = data[pos + 16]
        fields.append((name, ftype, flen))
        pos += 32
    rows, off = [], hlen
    for _ in range(n):
        rec = data[off:off + rlen]
        off += rlen
        if rec[:1] == b"*":
            continue
        p, row = 1, {}
        for name, ftype, flen in fields:
            raw = rec[p:p + flen]
            p += flen
            row[name] = raw.decode(encoding, errors="replace").strip()
        rows.append(row)
    return rows


def read_polygons(path):
    """Return list of shapes; each shape is a list of rings [(x, y), ...]."""
    with open(path, "rb") as f:
        data = f.read()
    pos, shapes = 100, []
    while pos < len(data):
        _, clen = struct.unpack(">II", data[pos:pos + 8])
        pos += 8
        content = data[pos:pos + clen * 2]
        pos += clen * 2
        stype = struct.unpack("<i", content[:4])[0]
        if stype == 0:
            shapes.append([])
            continue
        nparts, npoints = struct.unpack("<ii", content[36:44])
        parts = list(struct.unpack("<%di" % nparts, content[44:44 + 4 * nparts]))
        pstart = 44 + 4 * nparts
        pts = [struct.unpack("<dd", content[pstart + 16 * i:pstart + 16 * i + 16]) for i in range(npoints)]
        rings = []
        for i, s in enumerate(parts):
            e = parts[i + 1] if i + 1 < nparts else npoints
            rings.append(pts[s:e])
        shapes.append(rings)
    return shapes


def bbox(rings):
    xs = [x for r in rings for x, _ in r]
    ys = [y for r in rings for _, y in r]
    return min(xs), min(ys), max(xs), max(ys)


def contains(rings, x, y):
    """Even-odd rule across all rings handles holes and multipart polygons."""
    inside = False
    for ring in rings:
        n = len(ring)
        j = n - 1
        for i in range(n):
            xi, yi = ring[i]
            xj, yj = ring[j]
            if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / (yj - yi) + xi:
                inside = not inside
            j = i
    return inside
