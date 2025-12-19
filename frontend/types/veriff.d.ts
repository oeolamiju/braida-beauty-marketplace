declare module "@veriff/incontext-sdk" {
  export interface VeriffFrameOptions {
    url: string;
    onEvent?: (msg: string) => void;
  }

  export interface VeriffFrame {
    mount: () => void;
  }

  export function createVeriffFrame(options: VeriffFrameOptions): VeriffFrame;
}
