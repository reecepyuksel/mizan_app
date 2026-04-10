declare module "quran-meta/hafs" {
  export function getPageMeta(page: number): {
    first: [number, number];
    firstAyahId: number;
    last: [number, number];
    lastAyahId: number;
    pageNum: number;
  };
}
