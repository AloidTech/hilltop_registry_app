import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface OrganisationSummary {
  id: string;
  name: string;
  role: string;
  registry_sheet?: {
    // Make it optional as it might not always be there fully populated
    name?: string;
    url: string;
    form_url: string;
  };
  // Add other properties if needed
}

interface OrgState {
  selectedOrg: OrganisationSummary | null;
  setSelectedOrg: (org: OrganisationSummary | null) => void;
  clearSelectedOrg: () => void;
}

export const useOrgStore = create<OrgState>()(
  persist(
    (set) => ({
      selectedOrg: null,
      setSelectedOrg: (org) => set({ selectedOrg: org }),
      clearSelectedOrg: () => set({ selectedOrg: null }),
    }),
    {
      name: "org-storage", // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    },
  ),
);
