import { useQuery } from '@tanstack/react-query'
import type { Profile } from './Profile';

const API_BASE_URL = 'http://localhost:3000';

const profileData = {
  data: { name: 'John Doe', email: 'john.doe@example.com' },
  isLoading: false,
  error: null,
};

export const useProfile = () => {
  return useQuery<Profile>({
    queryKey: ['profile'],
    // queryFn: () => fetch(`${API_BASE_URL}/me`).then((res) => res.json()),
    queryFn: () => Promise.resolve(profileData.data),
  });
};