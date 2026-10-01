export const POST_LOGIN_REDIRECT_KEY = 'postLoginRedirect';

export const apiFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const response = await fetch(input, init);

  if (response.status === 401) {
    const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    window.sessionStorage.setItem(POST_LOGIN_REDIRECT_KEY, currentPath);
    window.location.assign('/oauth2/authorization/spring');
    throw new Error('Authentication required');
  }

  return response;
};