import { User } from "firebase/auth";

export async function fetchUserOrgs(user: User, type = "all") {
  if (!user) return;
  try {
    // Fetch organizations associated with the user
    const res = await fetch(
      `/api/organisation?user_id=${user.uid}&type=${type}`,
    );

    if (res.ok) {
      const data = await res.json();
      const userOrgs = data.organisations;
      console.log("Orgs: ", userOrgs);
      return userOrgs;
    } else {
      const error = await res.json();
      throw new Error(error.error);
    }
  } catch (error) {
    console.error("Error fetching organizations:", error);
  }
}
