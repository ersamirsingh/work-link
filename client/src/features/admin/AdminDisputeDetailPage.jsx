import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  assignMediatorRequest,
  getAdminDisputeDetailsRequest,
  getMediatorsRequest,
  resolveDisputeRequest,
} from "../../models/admin.model.js";
import MotionPage from "../../views/components/MotionPage.jsx";
import PageHeader from "../../views/components/PageHeader.jsx";
import SectionPanel from "../../views/components/SectionPanel.jsx";
import DetailGrid from "../../views/components/DetailGrid.jsx";
import LoaderState from "../../views/components/LoaderState.jsx";
import EmptyState from "../../views/components/EmptyState.jsx";

export default function AdminDisputeDetailPage() {
  const { disputeId } = useParams();
  const [dispute, setDispute] = useState(null);
  const [mediators, setMediators] = useState([]);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [selectedMediator, setSelectedMediator] = useState("");
  const [action, setAction] = useState("refund");
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [resolving, setResolving] = useState(false);

  const load = async () => {
    try {
      const [disputeResponse, mediatorsResponse] = await Promise.all([
        getAdminDisputeDetailsRequest(disputeId),
        getMediatorsRequest(),
      ]);
      setDispute(disputeResponse.data.dispute);
      setMediators(mediatorsResponse.data.mediators || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not load dispute detail");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [disputeId]);

  if (loading) {
    return <LoaderState label="Loading dispute details..." />;
  }

  if (!dispute) {
    return (
      <MotionPage className="space-y-8">
        <PageHeader eyebrow="Dispute detail" title="Dispute not found" description="The requested dispute record was not found." />
        <SectionPanel>
          <EmptyState title="Dispute not found" description="This dispute could not be loaded or was removed." />
        </SectionPanel>
      </MotionPage>
    );
  }

  return (
    <MotionPage className="space-y-8">
      <PageHeader
        eyebrow="Dispute detail"
        title={dispute.issue}
        description="Assign a mediator or resolve the case with final notes."
      />
      <div className="grid gap-6 xl:grid-cols-2">
        <SectionPanel>
          <DetailGrid
            items={[
              { label: "Status", value: dispute.status },
              { label: "Raised by", value: dispute.raisedBy?.Name || "Unknown" },
              { label: "Against worker", value: dispute.againstWorker?.Name || "Unknown" },
              { label: "Mediator", value: dispute.mediator?.Name || "Unassigned" },
            ]}
          />
        </SectionPanel>

        <SectionPanel warm>
          <div className="space-y-5">
            <div>
              <p className="section-label">Assign mediator</p>
              <select
                className="k-select mt-4"
                value={selectedMediator}
                onChange={(event) => setSelectedMediator(event.target.value)}
              >
                <option value="">Choose mediator</option>
                {mediators.map((mediator) => (
                  <option key={mediator._id} value={mediator._id}>
                    {mediator.Name}
                  </option>
                ))}
              </select>
              <button
                className="k-btn mt-4"
                disabled={assigning || !selectedMediator}
                onClick={async () => {
                  setAssigning(true);
                  try {
                    await assignMediatorRequest(disputeId, selectedMediator);
                    toast.success("Mediator assigned");
                    await load();
                  } catch (error) {
                    toast.error(error.response?.data?.message || "Assignment failed");
                  } finally {
                    setAssigning(false);
                  }
                }}
              >
                {assigning ? (
                  <span className="flex items-center gap-2">
                    <span className="loading loading-spinner loading-xs" />
                    Assigning mediator...
                  </span>
                ) : (
                  "Assign mediator"
                )}
              </button>
            </div>
            <div className="surface-divider pt-5">
              <label className="text-xs uppercase tracking-[0.16em] text-base-content/45 block mb-2 font-medium">
                Resolution Action (Deposit Distribution)
              </label>
              <select
                className="k-select w-full mb-4"
                value={action}
                onChange={(event) => setAction(event.target.value)}
              >
                <option value="refund">Refund to Employer (Employer gets ₹24)</option>
                <option value="release">Release to Worker (Worker gets ₹24)</option>
                <option value="split">Split 50/50 (Both get ₹12 refund)</option>
              </select>
              <InputField
                label="Resolution notes"
                value={resolutionNotes}
                onChange={(event) => setResolutionNotes(event.target.value)}
              />
              <button
                className="k-btn mt-4"
                disabled={resolving}
                onClick={async () => {
                  setResolving(true);
                  try {
                    await resolveDisputeRequest(disputeId, { action, notes: resolutionNotes });
                    toast.success("Dispute resolved");
                    await load();
                  } catch (error) {
                    toast.error(error.response?.data?.message || "Resolution failed");
                  } finally {
                    setResolving(false);
                  }
                }}
              >
                {resolving ? (
                  <span className="flex items-center gap-2">
                    <span className="loading loading-spinner loading-xs" />
                    Resolving dispute...
                  </span>
                ) : (
                  "Resolve dispute"
                )}
              </button>
            </div>
          </div>
        </SectionPanel>
      </div>
    </MotionPage>
  );
}
