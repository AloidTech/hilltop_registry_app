import React from "react";
import {
  FaFileAlt,
  FaLink,
  FaInfoCircle,
  FaCopy,
  FaCheck,
} from "react-icons/fa";

interface FormData {
  name: string;
  registrySheetName: string;
  registryFormUrl: string;
  registrySheetUrl: string;
}

const OrganisationSlides = ({
  formData,
  handleChange,
  step,
}: {
  formData: FormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  step: number;
}) => {
  return (
    <div>
      {step === 1 && (
        <div>
          <Slide1 formData={formData} handleChange={handleChange} />
        </div>
      )}

      {/* SLIDE 2: Integration */}
      {step === 2 && (
        <div>
          <Slide2 formData={formData} handleChange={handleChange} />
        </div>
      )}
    </div>
  );
};

const Slide1 = ({
  formData,
  handleChange,
}: {
  formData: FormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-white">
          Organization Details
        </h2>
        <p className="text-neutral-400 text-sm">
          Let&apos;s start with the basics. What is your organization called?
        </p>
      </div>

      {/* Organization Name */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-neutral-300">
          Organization Name
        </label>
        <input
          type="text"
          name="name"
          required
          autoFocus
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g. Hilltop Youth Ministry"
          className="w-full bg-neutral-900 border border-neutral-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
        />
      </div>

      {/* Registry Sheet Name (Internal Reference) */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-neutral-300 flex items-center gap-2">
          <FaFileAlt className="text-blue-400" /> Registry Sheet Name *
        </label>
        <input
          type="text"
          name="registrySheetName"
          
          value={formData.registrySheetName}
          onChange={handleChange}
          placeholder="e.g. Master Registry 2024"
          className="w-full bg-neutral-900 border border-neutral-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
        />
        <p className="text-xs text-neutral-500">
          A nickname for your sheet in this app.
        </p>
      </div>
    </div>
  );
};

const Slide2 = ({
  formData,
  handleChange,
}: {
  formData: FormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  const [copied, setCopied] = React.useState(false);
  // TODO: Replace with your actual service account email or fetch from an API if needed
  const SERVICE_EMAIL = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_EMAIL;
  console.log("email: ", SERVICE_EMAIL);
  const handleCopy = () => {
    if (SERVICE_EMAIL) {
      navigator.clipboard.writeText(SERVICE_EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      throw new Error("Failed to copy");
    }
  };

  const showFormInstructions = !formData.registryFormUrl;
  const showSheetInstructions =
    formData.registryFormUrl && !formData.registrySheetUrl;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-white">
          Connect Google Drive
        </h2>
        <p className="text-neutral-400 text-sm">
          Link your Google Form and Sheet to store member data.
        </p>
      </div>

      {/* 1. Form URL Input (First) */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-300 flex items-center gap-2">
          <FaLink className="text-purple-400" /> Paste Form URL
        </label>
        <input
          type="url"
          name="registryFormUrl"
          required
          value={formData.registryFormUrl}
          onChange={handleChange}
          placeholder="https://docs.google.com/forms/d/..."
          className="w-full bg-neutral-900 border border-neutral-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 outline-none"
        />
      </div>

      {/* Instruction Set 1: Create Form */}
      {showFormInstructions && (
        <div className="relative bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 flex gap-3 animate-in fade-in zoom-in-95 duration-300">
          <FaInfoCircle className="text-purple-400 w-5 h-5 absolute right-5 flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="text-sm text-purple-200 font-medium">
              Step 1: Get your Form Link
            </p>
            <div className="text-xs text-purple-200/70 leading-relaxed space-y-1">
              <p>
                1. Go to{" "}
                <a
                  href="https://forms.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-300 underline hover:text-purple-200"
                >
                  Google Forms
                </a>{" "}
                and create a new form.
              </p>
              <p>
                2. At the top <strong> Copy the URL.</strong>
              </p>
              <p>4. Paste it above.</p>
            </div>
          </div>
        </div>
      )}

      {/* Instruction Set 2: Link Sheet & Share */}
      {showSheetInstructions && (
        <div className="bg-blue-500/10 border relative border-blue-500/20 rounded-xl p-4 animate-in fade-in zoom-in-95 duration-300">
          <FaInfoCircle className="text-blue-400 w-5 h-5 absolute right-5 flex-shrink-0 mt-0.5" />
          <div className="space-y-3 w-full">
            <p className="text-sm text-blue-200 font-medium">
              Step 2: Connect Sheet & Share
            </p>
            <div className="text-xs text-blue-200/70 leading-relaxed space-y-2">
              <p>
                1. In your Form, go to the <strong>Responses</strong> tab.
              </p>
              <p>
                2. Click <strong>Link to Sheets</strong> and create a new
                spreadsheet.
              </p>
              <p>
                3. Open that sheet and click <strong>Share</strong> (top right).
              </p>
              <p>4. Share with this service email (Editor access):</p>

              {/* Service Email Copy Box */}
              <div className="flex items-center gap-2 bg-neutral-800/50 p-2 rounded border border-neutral-700/50 group">
                <code className="flex-1 font-mono text-blue-300 truncate max-w-xl md:max-w-md select-all">
                  {SERVICE_EMAIL}
                </code>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-1.5 hover:bg-neutral-700 rounded transition-colors text-neutral-400 hover:text-white"
                  title="Copy email"
                >
                  {copied ? <FaCheck className="text-green-400" /> : <FaCopy />}
                </button>
              </div>

              <p>
                5. Copy the <strong>Sheet URL</strong> and paste it below.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. Sheet URL Input (Second) */}
      <div
        className={`space-y-2 transition-opacity duration-300 ${
          !formData.registryFormUrl
            ? "opacity-50 pointer-events-none"
            : "opacity-100"
        }`}
      >
        <label className="text-sm font-medium text-neutral-300 flex items-center gap-2">
          <FaLink className="text-green-400" /> Paste Sheet URL
        </label>
        <input
          type="url"
          name="registrySheetUrl"
          required
          value={formData.registrySheetUrl}
          onChange={handleChange}
          placeholder="https://docs.google.com/spreadsheets/d/..."
          className="w-full bg-neutral-900 border border-neutral-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-green-500 outline-none"
        />
      </div>
    </div>
  );
};

export default OrganisationSlides;
