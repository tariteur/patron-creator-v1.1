export function createCurveThroughPoints(Ax, Ay, Bx, By, Cx, Cy, Dx, Dy) {
    // Fonction d'interpolation de spline cubique Catmull-Rom
    function interpolateCatmullRom(x0, y0, x1, y1, x2, y2, x3, y3, t) {
      var t2 = t * t;
      var t3 = t2 * t;

      var c0 = -0.5 * t3 + t2 - 0.5 * t;
      var c1 = 1.5 * t3 - 2.5 * t2 + 1.0;
      var c2 = -1.5 * t3 + 2.0 * t2 + 0.5 * t;
      var c3 = 0.5 * t3 - 0.5 * t2;

      var x = c0 * x0 + c1 * x1 + c2 * x2 + c3 * x3;
      var y = c0 * y0 + c1 * y1 + c2 * y2 + c3 * y3;

      return [x, y];
    }

    // Points de contrôle
    var points = [
      [Ax, Ay],
      [Bx, By],
      [Cx, Cy],
      [Dx, Dy],
    ];

    var curvePath = "";
    // Ajout du point de départ
    curvePath += "M" + Ax + " " + Ay;

    // Interpolation entre les points
    for (var i = 0; i < points.length - 1; i++) {
      var p0 = points[i];
      var p1 = points[i + 1];

      for (var t = 0; t <= 1; t += 0.01) {
        // Ajustement de l'incrémentation pour une courbe plus lisse
        var interpolated = interpolateCatmullRom(
          points[Math.max(i - 1, 0)][0],
          points[Math.max(i - 1, 0)][1],
          p0[0],
          p0[1],
          p1[0],
          p1[1],
          points[Math.min(i + 2, points.length - 1)][0],
          points[Math.min(i + 2, points.length - 1)][1],
          t,
        );
        curvePath += " L" + interpolated[0] + " " + interpolated[1];
      }
    }

    return curvePath;
  }