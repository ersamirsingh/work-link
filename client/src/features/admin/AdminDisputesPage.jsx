import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { deleteDisputeRequest, getAdminDisputesRequest } from "../../models/admin.model.js";
import { useAppController } from "../../controllers/AppController.jsx";
import MotionPage from "../../views/components/MotionPage.jsx";
import PageHeader from "../../views/components/PageHeader.jsx";
import SectionPanel from "../../views/components/SectionPanel.jsx";
import EmptyState from "../../views/components/EmptyState.jsx";
import LoaderState from "../../views/components/LoaderState.jsx";

export default function AdminDisputesPage() {
  const { user } = useAppController();
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const load = async () => {
    try {
      const response = await getAdminDisputesRequest();
      setDisputes(response.data.disputes || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not load disputes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return <LoaderState label="Loading disputes..." />;
  }

  return (
    <MotionPage className="space-y-8">
      <PageHeader
        eyebrow="Admin disputes"
        title="Resolve repair quality conflicts"
        description="Review open disputes, assign mediators, and close the loop before the marketplace trust layer degrades."
      />
      <SectionPanel>
        {disputes.length ? (
          <div className="table-shell">
            <table className="table">
              <thead>
                <tr>
                  <th>Issue</th>
                  <th>Status</th>
                  <th>Raised by</th>
                  <th>Against</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {disputes.map((dispute) => (
                  <tr key={dispute._id}>
                    <td>
                      <Link className="link-accent" to={`/app/admin/disputes/${dispute._id}`}>
                        {dispute.issue}
                      </Link>
                    </td>
                    <td>{dispute.status}</td>
                    <td>{dispute.raisedBy?.Name || "Unknown"}</td>
                    <td>{dispute.againstWorker?.Name || "Unknown"}</td>
                    <td>
                      {user?.role === "system_admin" && (
                        <button
                          disabled={deletingId === dispute._id}
                          className="px-2.5 py-1 rounded-xl text-xs font-semibold border border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition disabled:opacity-50"
                          onClick={async () => {
                            setDeletingId(dispute._id);
                            try {
                              await deleteDisputeRequest(dispute._id);
                              toast.success("Dispute deleted");
                              await load();
                            } catch (error) {
                              toast.error(error.response?.data?.message || "Delete failed");
                            } finally {
                              setDeletingId(null);
                            }
                          }}
                        >
                          {deletingId === dispute._id ? (
                            <span className="flex items-center gap-1">
                              <span className="loading loading-spinner loading-xs" />
                              Deleting...
                            </span>
                          ) : (
                            "Delete"
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No disputes found"
            description="All service engagements are running smoothly with no active conflicts."
          />
        )}
      </SectionPanel>
    </MotionPage>
  );
}
