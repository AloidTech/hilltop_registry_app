"use client";
import React, { useEffect, useState } from "react";

function Workers_Page() {
  const [, setLoading] = useState(true); // Start with loading = true
  const [, setMembers] = useState([]);

  useEffect(() => {
    async function fetchMembers() {
      try {
        const response = await fetch("/api/members", {
          next: { revalidate: 60 },
        });
        if (response.ok) {
          const data = await response.json();
          console.log(data);
          // Updated to use data.data for server cache compatibility
          const membersData = data.data || data.members || [];
          setMembers(membersData);
        }
      } catch (error) {
        console.error("Failed to fetch members:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchMembers();
  }, []);
  return <div></div>;
}

export default Workers_Page;
