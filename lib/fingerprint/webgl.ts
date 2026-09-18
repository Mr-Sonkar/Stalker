export interface WebGLFingerprint {
  supported: boolean;
  vendor: string | null;
  renderer: string | null;
}

export function getWebGLFingerprint(): WebGLFingerprint {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) {
      return { supported: false, vendor: null, renderer: null };
    }

    const debugInfo = (gl as WebGLRenderingContext).getExtension("WEBGL_debug_renderer_info");
    if (debugInfo) {
      const vendor = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
      const renderer = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      return { supported: true, vendor, renderer };
    }

    return { supported: false, vendor: null, renderer: null };
  } catch (error) {
    return { supported: false, vendor: null, renderer: null };
  }
}
