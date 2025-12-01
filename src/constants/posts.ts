export enum PostSection {
  OCCASIONS = 'مناسبت ها',
  ANNOUNCEMENTS = 'اطلاعیه ها',
  NEWS = 'اخبار ها',
  ACHIEVEMENTS = 'افتخارات',
  SLIDER = 'اسلایدر',
  HR = 'منابع انسانی',
}

export const POST_SECTIONS = [
  { value: PostSection.OCCASIONS, label: 'مناسبت ها' },
  { value: PostSection.ANNOUNCEMENTS, label: 'اطلاعیه ها' },
  { value: PostSection.NEWS, label: 'اخبار ها' },
  { value: PostSection.ACHIEVEMENTS, label: 'افتخارات' },
  { value: PostSection.SLIDER, label: 'اسلایدر' },
] as const;
