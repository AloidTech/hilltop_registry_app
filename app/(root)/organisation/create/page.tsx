"use client";

import { useState, useEffect } from "react";
import { checkProfile, useAuth } from "@/lib/ClientAuth";
import { useRouter } from "next/navigation";
import OrganisationSlides from "@/components/OrganisationSlides";
import {
  FaBuilding,
  FaArrowRight,
  FaArrowLeft,
  FaSpinner,
} from "react-icons/fa";
import Link from "next/link";
import { IoArrowBackCircle } from "react-icons/io5";
import { BiArrowBack } from "react-icons/bi";

export default function CreateOrganizationPage() {
  // 1. Auth & Router Hooks
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // 2. Local State Management
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true); // For initial profile check

  const [formData, setFormData] = useState({
    name: "",
    registrySheetName: "",
    registrySheetUrl: "",
    registryFormUrl: "",
  });

  // 3. Auth Check & Profile Fetch
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/auth/login");
      } else {
        checkProfile(user).finally(() => {
          setLoading(false);
        });
      }
    }
  }, [user, authLoading, router]);

  // 4. Event Handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        user_id: user?.uid,
        registry_sheet: {
          name: formData.registrySheetName,
          url: formData.registrySheetUrl,
        },
        registry_form_url: formData.registryFormUrl,
      };

      const res = await fetch("/api/organisation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("Organisation created successfully!");
        router.push("/organisation");
      } else {
        const error = await res.json();
        console.error(
          `Error: ${error.error || "Failed to create organization"}`,
        );
        alert(`Error: ${error.error || "Failed to create organization"}`);
      }
    } catch (error: any) {
      console.error("Submission error:", error.error || error || error.message);
      alert("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => setStep(2);
  const prevStep = () => setStep(1);

  // 5. Loading View
  if (loading || authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-900 text-white">
        <FaSpinner className="animate-spin w-8 h-8 text-green-500" />
      </div>
    );
  }

  // 6. Main Render
  return (
    <div className="relative h-screen bg-neutral-900 text-white p-6 flex flex-col items-center justify-center">
      <Link
        href="/organisation"
        className="absolute top-6 left-6 md:top-10 md:left-10 p-4 rounded-full bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-400 hover:text-white transition-all shadow-xl group z-10"
      >
        <FaArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
      </Link>
      <div className=" max-w-2xl w-full bg-neutral-800 rounded-2xl shadow-2xl border border-neutral-700 overflow-hidden flex flex-col ">
        {/* Header */}
        <div className="p-8 border-b border-neutral-700 bg-neutral-800/50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <FaBuilding className="w-6 h-6 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold">Create Organization</h1>
            </div>
            <span className="text-neutral-500 text-sm font-mono">
              Step {step} of 2
            </span>
          </div>
          <div
            className={`w-full ${
              step === 2
                ? isSubmitting
                  ? "bg-green-500"
                  : "bg-green-500/55"
                : "bg-neutral-700"
            } h-1 mt-4 rounded-full overflow-hidden`}
          >
            <div
              className={`bg-green-500 h-full transition-all ${
                step ? " w-[50%]" : "w-[50%]"
              } duration-300 ease-out`}
            />
          </div>
        </div>

        {/* Content Area */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 p-8 flex flex-col justify-between"
        >
          {/* Slides Component */}
          <OrganisationSlides
            formData={formData}
            handleChange={handleChange}
            step={step}
          />

          {/* Navigation Buttons */}
          <div className="pt-6 flex gap-3 mt-auto">
            {step === 2 && (
              <button
                type="button"
                onClick={prevStep}
                disabled={isSubmitting}
                className="px-6 py-3 rounded-xl bg-neutral-700 hover:bg-neutral-600 text-white font-medium transition-colors flex items-center gap-2"
              >
                <FaArrowLeft /> Back
              </button>
            )}

            {step === 1 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={!formData.name || !formData.registrySheetName}
                className="flex-1 bg-green-600 hover:bg-green-500 disabled:bg-neutral-700 disabled:text-neutral-500 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                Next Step <FaArrowRight />
              </button>
            ) : (
              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  !formData.registrySheetUrl ||
                  !formData.registryFormUrl
                }
                className="flex-1 bg-green-600 hover:bg-green-500 disabled:bg-neutral-700 disabled:text-neutral-500 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-green-900/20 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="animate-spin w-5 h-5" />
                    Creating...
                  </>
                ) : (
                  "Create Organization"
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
