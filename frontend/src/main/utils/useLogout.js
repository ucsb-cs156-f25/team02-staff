import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useNavigate } from "react-router";

export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const mutation = useMutation({
    mutationFn: async () => {
      await axios.post("/logout");
      await queryClient.resetQueries({ queryKey: ["current user"] });
      navigate("/");
    },
  });
  return mutation;
}
