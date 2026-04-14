export async function fetchStravaActivities(accessToken: string) {
  const res = await fetch(
    "https://www.strava.com/api/v3/athlete/activities",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch Strava data");
  }

  return res.json();
}