import { User } from '@/types/dashboard';
import { atom, selector } from 'recoil';

// Auth state
export const authTokenState = atom<string | null>({
  key: 'authTokenState',
  default: null,
  effects: [
    ({ setSelf, trigger }) => {
      if (trigger === 'get') {
        setSelf(localStorage.getItem('token'));
      }
    },
    ({ onSet }) => {
      onSet((newValue) => {
        if (newValue) {
          localStorage.setItem('token', newValue);
        } else {
          localStorage.removeItem('token');
        }
      });
    },
  ],
});

export const authUserState = atom<User | null>({
  key: 'authUserState',
  default: null,
  effects: [
    ({ setSelf, trigger }) => {
      if (trigger === 'get') {
        const userStr = localStorage.getItem('user');
        setSelf(userStr ? JSON.parse(userStr) : null);
      }
    },
    ({ onSet }) => {
      onSet((newValue) => {
        if (newValue) {
          localStorage.setItem('user', JSON.stringify(newValue));
        } else {
          localStorage.removeItem('user');
        }
      });
    },
  ],
});

export const isAuthenticatedState = selector({
  key: 'isAuthenticatedState',
  get: ({ get }) => {
    const token = get(authTokenState);
    const user = get(authUserState);
    return !!(token && user);
  },
});

// UI state
export const sidebarOpenState = atom<boolean>({
  key: 'sidebarOpenState',
  default: false,
});

export const currentPageState = atom<
  'posts' | 'products' | 'categories' | 'personnel' | 'media' | 'tickets' | 'landing-settings'
>({
  key: 'currentPageState',
  default: 'posts',
});

// Theme state
export const themeState = atom<'light' | 'dark'>({
  key: 'themeState',
  default: 'light',
});
