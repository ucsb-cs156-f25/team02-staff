import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export function useCurrentUser() {
  const queryResults = useQuery({
    queryKey: ["current user"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/currentUser");
        if (response.data == null) {
          return { loggedIn: false, root: {} };
        }
        if (!(response.data instanceof Object) || !("roles" in response.data)) {
          return { loggedIn: false, root: response.data };
        }
        let rolesList = response.data.roles.map((r) => r.authority);
        response.data = { ...response.data, rolesList: rolesList };
        return { loggedIn: true, root: response.data };
      } catch (e) {
        if (e.status === 403) {
          return { loggedIn: false, root: {} };
        } else {
          console.error("Error invoking axios.get: ", e);
          throw e;
        }
      }
    },
    initialData: { loggedIn: false, root: null, initialData: true },
  });
  return queryResults.data;
}

export function hasRole(currentUser, role) {
  if (currentUser == null) return false;

  return currentUser.root?.rolesList?.includes(role);
}
