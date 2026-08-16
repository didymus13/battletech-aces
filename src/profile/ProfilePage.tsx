import { useProfile } from "./api";

const ProfilePage = () => {
  const { data: profile, isLoading, error } = useProfile();
  console.log('Profile data:', profile);

  return (
    <div>
      <h1>Profile Page</h1>
      <p>This is the profile page content.</p>

        {isLoading && <p>Loading profile...</p>}
        {error && <p>Error loading profile.</p>}
        {profile && (
          <div>
            <h2>{profile.name}</h2>
            <p>{profile.email}</p>
          </div>
        )}
    </div>
  );
}

export default ProfilePage;