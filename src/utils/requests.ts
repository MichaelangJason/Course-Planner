/* eslint-disable @typescript-eslint/no-unsafe-function-type */

import { IRawCourse } from "@/db/schema";
import { Course } from "@/types/course";

export const debounce = <T>(fn: (...args: any[]) => Promise<T>, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: any[]): Promise<T> => {
    return new Promise((resolve) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(async () => {
        const result = await fn(...args);
        resolve(result);
      }, delay);
    });
  };
};

export const throttle = (fn: Function, delay: number) => {
  let lastTime = 0;
  return function (this: unknown, ...args: unknown[]) {
    const now = new Date().getTime();
    if (now - lastTime < delay) return;
    lastTime = now;
    fn.apply(this, args);
  };
};

export const getCourse = async (courseId: string) => {
  if (!courseId) return null;
  const response = await fetch(`/api/courses/${courseId}`);
  if (!response.ok) return null;
  const data = await response.json() as IRawCourse;

  return data;
}

export const getInitCourses = async () => {      
  const response = await fetch('/api/courses')
  if (!response.ok) {
      throw new Error('Failed to fetch courses')
    }

  return (await response.json()) as Course[]
}