import { WebGLDeepFingerprint } from "./types";

function fastHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function getWebGLFingerprint(): WebGLDeepFingerprint {
  const fallback: WebGLDeepFingerprint = {
    supported: false,
    vendor: null,
    renderer: null,
    version: null,
    shadingLanguageVersion: null,
    extensions: [],
    maxTextureSize: 0,
    maxRenderBufferSize: 0,
    maxViewportDims: [0, 0],
    vertexShaderPrecision: 0,
    fragmentShaderPrecision: 0,
    antialias: false,
    renderHash: "unsupported",
  };

  try {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;

    const gl =
      (canvas.getContext("webgl2") as WebGL2RenderingContext) ||
      (canvas.getContext("webgl") as WebGLRenderingContext) ||
      (canvas.getContext("experimental-webgl") as WebGLRenderingContext);

    if (!gl) return fallback;

    // 1. Unmasked Vendor & Renderer
    let vendor: string | null = null;
    let renderer: string | null = null;
    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    if (debugInfo) {
      vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
      renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    }

    const version = gl.getParameter(gl.VERSION) || null;
    const shadingLanguageVersion = gl.getParameter(gl.SHADING_LANGUAGE_VERSION) || null;

    // 2. Hardware limits
    const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE) || 0;
    const maxRenderBufferSize = gl.getParameter(gl.MAX_RENDERBUFFER_SIZE) || 0;
    const maxViewportDims = gl.getParameter(gl.MAX_VIEWPORT_DIMS) || [0, 0];

    // 3. Supported Extensions
    const rawExtensions = gl.getSupportedExtensions() || [];
    const extensions = [...rawExtensions].sort();

    // 4. Context attributes
    const attrs = gl.getContextAttributes();
    const antialias = attrs ? Boolean(attrs.antialias) : false;

    // 5. Shader Precision
    let vertexShaderPrecision = 0;
    let fragmentShaderPrecision = 0;
    try {
      const vPrec = gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.HIGH_FLOAT);
      const fPrec = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
      vertexShaderPrecision = vPrec ? vPrec.precision : 0;
      fragmentShaderPrecision = fPrec ? fPrec.precision : 0;
    } catch {
      // ignore
    }

    // 6. 3D Geometry Rendering Hash
    let renderHash = "unknown";
    try {
      // Draw a tiny color triangle
      const vertexShaderSource = `
        attribute vec2 position;
        attribute vec3 color;
        varying vec3 vColor;
        void main() {
          vColor = color;
          gl_Position = vec4(position, 0.0, 1.0);
        }
      `;
      const fragmentShaderSource = `
        precision mediump float;
        varying vec3 vColor;
        void main() {
          gl_FragColor = vec4(vColor, 1.0);
        }
      `;

      const vs = gl.createShader(gl.VERTEX_SHADER)!;
      gl.shaderSource(vs, vertexShaderSource);
      gl.compileShader(vs);

      const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
      gl.shaderSource(fs, fragmentShaderSource);
      gl.compileShader(fs);

      const program = gl.createProgram()!;
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      gl.useProgram(program);

      const vertices = new Float32Array([
        -0.8, -0.8, 1, 0, 0,
         0.8, -0.8, 0, 1, 0,
         0.0,  0.8, 0, 0, 1,
      ]);

      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

      const posAttrib = gl.getAttribLocation(program, "position");
      const colAttrib = gl.getAttribLocation(program, "color");

      gl.enableVertexAttribArray(posAttrib);
      gl.vertexAttribPointer(posAttrib, 2, gl.FLOAT, false, 20, 0);

      gl.enableVertexAttribArray(colAttrib);
      gl.vertexAttribPointer(colAttrib, 3, gl.FLOAT, false, 20, 8);

      gl.clearColor(0.1, 0.2, 0.3, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      const pixels = new Uint8Array(64 * 64 * 4);
      gl.readPixels(0, 0, 64, 64, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
      renderHash = fastHash(pixels.slice(0, 500).join(","));
    } catch {
      renderHash = "render_err";
    }

    return {
      supported: true,
      vendor: vendor || "Unknown Vendor",
      renderer: renderer || "Unknown Renderer",
      version,
      shadingLanguageVersion,
      extensions,
      maxTextureSize,
      maxRenderBufferSize,
      maxViewportDims: [maxViewportDims[0] || 0, maxViewportDims[1] || 0],
      vertexShaderPrecision,
      fragmentShaderPrecision,
      antialias,
      renderHash,
    };
  } catch {
    return fallback;
  }
}
