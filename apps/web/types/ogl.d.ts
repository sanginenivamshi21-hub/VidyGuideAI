declare module 'ogl' {
  export class Renderer {
    constructor(options?: any);
    gl: WebGLRenderingContext & { canvas: HTMLCanvasElement };
    setSize(width: number, height: number): void;
    render(options: any): void;
  }
  export class Program {
    constructor(gl: any, options?: any);
    uniforms: any;
  }
  export class Mesh {
    constructor(gl: any, options?: any);
  }
  export class Triangle {
    constructor(gl: any, options?: any);
  }
}
