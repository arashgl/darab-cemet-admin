import { useLogin, useLogout } from '@/api/auth';
import {
  authTokenState,
  authUserState,
  isAuthenticatedState,
} from '@/state/atoms';
import { useRecoilState, useRecoilValue } from 'recoil';

export function useAuth() {
  console.log('use Auth initialized');

  const [token, setToken] = useRecoilState(authTokenState);
  console.log('this.token', token);

  const [user, setUser] = useRecoilState(authUserState);
  const isAuthenticated = useRecoilValue(isAuthenticatedState);

  const loginMutation = useLogin();
  const logoutMutation = useLogout();

  const login = async (email: string, password: string) => {
    const response = await loginMutation.mutateAsync({ email, password });
    setToken(response.access_token);
    setUser(response.user);
    return response;
  };

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } finally {
      // Always clear local state regardless of server response
      setToken(null);
      setUser(null);
    }
  };

  return {
    token,
    user,
    isAuthenticated,
    login,
    logout,
    isLoading: loginMutation.isPending || logoutMutation.isPending,
    error: loginMutation.error || logoutMutation.error,
  };
}
