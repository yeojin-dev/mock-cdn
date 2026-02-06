export type EtagMode = 'consistent' | 'random';

export type ImageName = string & { readonly __brand: unique symbol };

export function createImageName(name: string): ImageName {
  return name as ImageName;
}

export interface ImageSpec {
  readonly name: ImageName;
  readonly color: { readonly r: number; readonly g: number; readonly b: number };
}

export const DEFAULT_IMAGE_SPECS: readonly ImageSpec[] = [
  { name: createImageName('test-image-1.jpg'), color: { r: 255, g: 0, b: 0 } },
  { name: createImageName('test-image-2.jpg'), color: { r: 0, g: 255, b: 0 } },
  { name: createImageName('test-image-3.jpg'), color: { r: 0, g: 0, b: 255 } },
  { name: createImageName('test-image-4.jpg'), color: { r: 255, g: 255, b: 0 } },
  { name: createImageName('test-image-5.jpg'), color: { r: 0, g: 255, b: 255 } },
  { name: createImageName('test-image-6.jpg'), color: { r: 255, g: 0, b: 255 } },
];
