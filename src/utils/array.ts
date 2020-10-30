/**
 * 求多个数组交集
 */
export function arrayIntersection<T>(...arrs: T[][]): T[] {
  return arrs.reduce((acc, cur, index) => {
    return Array.from(new Set(index > 0 ? cur.filter(item => new Set(acc).has(item)) : cur));
  }, []);
}


/**
 * 求多个数组并集
 */
export function arrayUnion<T>(...arrs: T[][]): T[] {
  return Array.from(new Set(arrs.reduce((acc, cur) => [...acc, ...cur], [])));
}