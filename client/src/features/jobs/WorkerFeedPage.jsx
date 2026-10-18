import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { getWorkerFeedRequest, expressInterestRequest } from "../../models/worker.model.js";
import MotionPage from "../../views/components/MotionPage.jsx";
import PageHeader from "../../views/components/PageHeader.jsx";
import SectionPanel from "../../views/components/SectionPanel.jsx";
import EmptyState from "../../views/components/EmptyState.jsx";
import JobCard from "../../views/components/JobCard.jsx";
import LoaderState from "../../views/components/LoaderState.jsx";
import { useAppController } from "../../controllers/AppController.jsx";
import { TextAreaField, InputField } from "../../views/components/FormField.jsx";
import VoiceComposerField from "../../views/components/VoiceComposerField.jsx";
import BrowserLocationField from "../../views/components/BrowserLocationField.jsx";
import { MapPin } from "lucide-react";

const DOMAINS = ["All", "Electrical", "Plumbing", "Appliance", "Cleaning", "Carpentry", "Painting", "General", "Other"];

export default function WorkerFeedPage() {
  const { user, updateLocation } = useAppController();
  const [drafts, setDrafts] = useState({});
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncingLocation, setSyncingLocation] = useState(false);
  const [selectedRadius, setSelectedRadius] = useState(
    user?.workerProfile?.serviceRadiusKm || 5
  );
  const [selectedDomain, setSelectedDomain] = useState("All");

  const isLocationRequired =
    !user?.location?.coordinates ||
    user.location.coordinates.length === 0 ||
    (user.location.coordinates[0] === 0 && user.location.coordinates[1] === 0);

  const handleLocationChange = async (coordinates) => {
    setSyncingLocation(true);
    try {
      const updatedUser = await updateLocation({ coordinates });
      toast.success("Location synced! Fetching jobs...");
      await load(selectedRadius, updatedUser);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to sync location");
    } finally {
      setSyncingLocation(false);
    }
  };

  const load = async (radius = selectedRadius, overrideUser = null) => {
    const activeUser = overrideUser || user;
    const locRequired =
      !activeUser?.location?.coordinates ||
      activeUser.location.coordinates.length === 0 ||
      (activeUser.location.coordinates[0] === 0 && activeUser.location.coordinates[1] === 0);

    if (locRequired) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const feedResponse = await getWorkerFeedRequest(radius);
      setJobs(feedResponse.data?.jobs || feedResponse.jobs || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not load worker feed");
    } finally {
      setLoading(false);
    }
  };

  const lng = user?.location?.coordinates?.[0];
  const lat = user?.location?.coordinates?.[1];

  const filteredJobs = jobs.filter((job) => {
    if (selectedDomain === "All") return true;
    return job.category?.toLowerCase() === selectedDomain.toLowerCase();
  });

  useEffect(() => {
    load(selectedRadius);
  }, [user?._id, selectedRadius, lng, lat]);

  const submitInterest = async (jobId) => {
    try {
      const draft = drafts[jobId] || {};
      await expressInterestRequest(jobId, {
        message: draft.message || "",
        quoteAmount: draft.quoteAmount || "",
        quoteText: draft.quoteText || "",
        boostProfile: Boolean(draft.boostProfile),
        voiceInput: {
          transcript: draft.voiceTranscript || "",
          language: draft.language || user?.preferredLanguage || "Hindi",
          speakerRole: "worker",
        },
      });
      toast.success("Interest sent");
      setDrafts((current) => ({ ...current, [jobId]: {} }));
      await load();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not send interest");
    }
  };


  return (
    <MotionPage className="space-y-8">
      <PageHeader
        eyebrow="Explore Jobs"
        title="Search nearby jobs ready for your quote"
        description="Tap interested for free, boost your profile when the lead is worth it, and use Verified Pro to unlock a 10-second head start."
        actions={
          <div className="flex flex-wrap gap-3">
            <button
              onClick={async () => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    async (position) => {
                      const { longitude, latitude } = position.coords;
                      await handleLocationChange([longitude, latitude]);
                    },
                    (err) => {
                      toast.error("Location access denied or timed out");
                    }
                  );
                } else {
                  toast.error("Geolocation not supported by your browser");
                }
              }}
              disabled={syncingLocation}
              className="k-btn flex items-center gap-2"
            >
              {syncingLocation ? (
                <>
                  <span className="loading loading-spinner loading-xs" />
                  <span>Syncing location...</span>
                </>
              ) : (
                <>
                  <MapPin className="h-4 w-4" />
                  <span>Update Location</span>
                </>
              )}
            </button>
            <Link className="k-btn-ghost" to="/app/worker/profile">
              Edit worker profile
            </Link>
          </div>
        }
      />

      {loading ? (
        <LoaderState label="Finding nearby opportunities..." />
      ) : isLocationRequired ? (
        <SectionPanel warm className="max-w-2xl mx-auto text-center space-y-6 py-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-warning/15 text-warning mx-auto">
            <MapPin className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-base-100">Location Sync Compulsory</h2>
            <p className="text-sm text-base-content/70">
              We need your live coordinates to explore and search for job opportunities within your radius. Please grant GPS permission and click below to detect your current location.
            </p>
          </div>
          <div className="text-left max-w-sm mx-auto">
            <BrowserLocationField
              label="Capture My Location"
              value={null}
              onChange={handleLocationChange}
            />
          </div>
        </SectionPanel>
      ) : (
        <>
          {/* Worker stats panel */}
          <SectionPanel warm>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="section-label">Wallet state</p>
            <p className="mt-2 text-3xl text-base-100">{user?.wallet?.balance ?? 0}</p>
            <p className="mt-2 text-sm text-base-content/60">
              Credit limit: {user?.wallet?.creditLimit ?? -200}
            </p>
          </div>
          <div>
            <p className="section-label">Verified Pro</p>
            <p className="mt-2 text-3xl text-base-100">
              {user?.subscription?.status === "active" ? "Active" : "Inactive"}
            </p>
            <p className="mt-2 text-sm text-base-content/60">
              Early access: {user?.subscription?.earlyAccessSeconds ?? 0}s
            </p>
          </div>
          <div>
            <p className="section-label">Availability</p>
            <p className="mt-2 text-3xl text-base-100">
              {user?.workerProfile?.isAvailable ? "Live" : "Paused"}
            </p>
            <p className="mt-2 text-sm text-base-content/60">
              Radius: {user?.workerProfile?.serviceRadiusKm ?? 0} km
            </p>
          </div>
        </div>
      </SectionPanel>

      {/* Distance filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-[1.75rem] border border-white/6 bg-white/3 p-6">
        <div>
          <h3 className="text-xl font-semibold text-base-100">Job Radius Filter</h3>
          <p className="mt-1 text-sm text-base-content/60">
            Show available jobs within a selected distance from your location (capped at 10km max).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-base-content/70">Distance:</span>
          <select
            className="k-select w-40"
            value={selectedRadius}
            onChange={(e) => setSelectedRadius(Number(e.target.value))}
          >
            <option value={1}>1 km</option>
            <option value={2}>2 km</option>
            <option value={5}>5 km</option>
            <option value={10}>10 km</option>
          </select>
        </div>
      </div>

      {/* Category domain filter */}
      <div className="flex flex-col gap-4 rounded-[1.75rem] border border-white/6 bg-white/3 p-6">
        <div>
          <h3 className="text-xl font-semibold text-base-100">Category / Domain Filter</h3>
          <p className="mt-1 text-sm text-base-content/60">
            Filter available jobs in your radius by specific domains like Carpenter, Electrical, Plumbing etc.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {DOMAINS.map((domain) => (
            <button
              key={domain}
              onClick={() => setSelectedDomain(domain)}
              className={`px-4 py-2 rounded-full text-xs font-semibold border transition ${
                selectedDomain === domain
                  ? "border-warning bg-warning text-black shadow-lg"
                  : "border-white/10 bg-white/3 text-base-content/75 hover:bg-white/6 hover:text-base-100"
              }`}
            >
              {domain}
            </button>
          ))}
        </div>
      </div>

      {/* Job list */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <span className="loading loading-ring loading-lg text-warning" />
        </div>
      ) : filteredJobs.length ? (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredJobs.map((job) => (
            <JobCard 
              key={job._id} 
              job={job} 
              href={`/app/worker/jobs/${job._id}`} 
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title={jobs.length > 0 ? "No jobs in this category" : "No nearby jobs right now"}
          copy={
            jobs.length > 0
              ? "There are nearby jobs available, but none match the selected category. Try selecting another domain or 'All'."
              : "Make sure your live location and worker availability are on. New jobs in your radius will appear here."
          }
        />
      )}
      </>
      )}
    </MotionPage>
  );
}
