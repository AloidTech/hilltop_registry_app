"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/ClientAuth";
import { fetchUserOrgs } from "@/lib/organisation_utils";
import { useOrgStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { FaBuilding, FaCheck, FaExclamationTriangle } from "react-icons/fa";

export const OrgSelectionModal = ({
  isOpen,
  onClose,
  mustSelect = false,
}: {
  isOpen: boolean;
  onClose?: () => void;
  mustSelect?: boolean;
}) => {
  const { user } = useAuth();
  const { setSelectedOrg, selectedOrg } = useOrgStore();
  const [orgs, setOrgs] = useState<
    {
      id: string;
      name: string;
      user_id: string;
      registry_sheet: { name: string; url: string };
    }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && user) {
      setLoading(true);
      fetchUserOrgs(user)
        .then((data) => {
          if (data) setOrgs(data);
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, user]);

  const handleSelect = (org: {
    id: string;
    name: string;
    user_id: string;
    registry_sheet: { name: string; url: string };
  }) => {
    setSelectedOrg({
      id: org.id,
      name: org.name,
      role: user?.uid === org.user_id ? "Owner" : "Member", // Basic role logic
      registry_sheet: org.registry_sheet,
    });
    if (onClose) onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-md bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4 text-white">
                <div className="p-2 bg-green-500/20 rounded-lg text-green-500">
                  <FaBuilding className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Select Organisation</h2>
                  <p className="text-sm text-neutral-400">
                    {mustSelect
                      ? "You must select an organisation to continue"
                      : "Choose context for this action"}
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="space-y-3 py-4">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-16 bg-neutral-800 rounded-xl animate-pulse"
                    />
                  ))}
                </div>
              ) : orgs.length === 0 ? (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center">
                  <div className="bg-amber-500/20 p-3 rounded-full w-fit mx-auto mb-3">
                    <FaExclamationTriangle className="text-amber-500 w-5 h-5" />
                  </div>
                  <p className="text-white font-medium mb-1">
                    No Organisations Found
                  </p>
                  <p className="text-neutral-400 text-sm">
                    Please create an organisation first.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                  {orgs.map((org) => (
                    <button
                      key={org.id}
                      onClick={() => handleSelect(org)}
                      className={`w-full flex items-center justify-between p-4 rounded-xl transition-all border ${
                        selectedOrg?.id === org.id
                          ? "bg-green-600/20 border-green-500"
                          : "bg-neutral-800 hover:bg-neutral-750 border-neutral-700 hover:border-neutral-600"
                      }`}
                    >
                      <div className="text-left">
                        <div className="font-bold text-white">{org.name}</div>
                        <div className="text-xs text-neutral-400 font-mono mt-0.5">
                          {org.registry_sheet?.name || "Sheet Linked"}
                        </div>
                      </div>
                      {selectedOrg?.id === org.id && (
                        <FaCheck className="text-green-500" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {!mustSelect && onClose && (
              <div className="p-4 bg-neutral-800/50 border-t border-neutral-700 flex justify-end">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-neutral-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
