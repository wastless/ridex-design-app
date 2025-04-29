import type { TutorialCourse } from '~/types';
import { compositionCourse } from '~/data/lesson/composition-lesson';
import { typographyCourse } from '~/data/lesson/typography-lesson';
import { colorTheoryCourse } from '~/data/lesson/color-theory-lesson';

export const tutorialCourses: TutorialCourse[] = [
  compositionCourse,
  typographyCourse,
  colorTheoryCourse
]; 