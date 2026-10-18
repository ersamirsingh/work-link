import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import {
  blockUserRequest,
  getAdminUsersRequest,
  unblockUserRequest,
  unverifyUserRequest,
  verifyUserRequest,
} from "../../models/admin.model.js";
import MotionPage from "../../views/components/MotionPage.jsx";
import PageHeader from "../../views/components/PageHeader.jsx";
import SectionPanel from "../../views/components/SectionPanel.jsx";
import LoaderState from "../../views/components/LoaderState.jsx";
import EmptyState from "../../views/components/EmptyState.jsx";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mutatingId, setMutatingId] = useState(null);

  const load = async () => {
    try {
      const response = await getAdminUsersRequest();
      setUsers(response.data.users || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const mutate = async (actionKey, action, successMessage) => {
    setMutatingId(actionKey);
    try {
      await action();
      toast.success(successMessage);
      await load();
    } catch (error) {
      toast.error(error.response?.data?.message || "Action failed");
    } finally {
      setMutatingId(null);
    }
  };

  if (loading) {
    return <LoaderState label="Loading users list..." />;
  }

  return (
    <MotionPage className="space-y-8">
      <PageHeader
        eyebrow="Admin users"
        title="Moderate accounts and trust status"
        description="Review verification, blocking state, roles, wallet condition, and move into deeper detail pages when needed."
      />

      <SectionPanel>
        {users.length ? (
          <div className="table-shell">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Mode</th>
                  <th>Verified</th>
                  <th>Wallet</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((entry) => (
                  <tr key={entry._id}>
                    <td>
                      <Link className="link-accent" to={`/app/admin/users/${entry._id}`}>
                        {entry.Name}
                      </Link>
                    </td>
                    <td>{entry.activeMode}</td>
                    <td>{entry.verified ? "Yes" : "No"}</td>
                    <td>{entry.wallet?.balance ?? 0}</td>
                    <td>
                      <div className="flex flex-wrap gap-2">
                        <button
                          className={`px-2.5 py-1 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
                            entry.verified
                              ? "border-warning bg-warning/5 text-warning/80 hover:bg-warning/15"
                              : "border-white/10 bg-white/3 text-base-content/70 hover:bg-white/6"
                          }`}
                          disabled={mutatingId === `verify-${entry._id}`}
                          onClick={() =>
                            mutate(
                              `verify-${entry._id}`,
                              () =>
                                entry.verified
                                  ? unverifyUserRequest(entry._id)
                                  : verifyUserRequest(entry._id),
                              entry.verified ? "User unverified" : "User verified",
                            )
                          }
                        >
                          {mutatingId === `verify-${entry._id}` && <span className="loading loading-spinner loading-xs" />}
                          <span>{entry.verified ? "Unverify" : "Verify"}</span>
                        </button>
                        <button
                          className={`px-2.5 py-1 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
                            entry.isBlocked
                              ? "border-green-500 bg-green-500/10 text-green-400 hover:bg-green-500/20"
                              : "border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                          }`}
                          disabled={mutatingId === `block-${entry._id}`}
                          onClick={() =>
                            mutate(
                              `block-${entry._id}`,
                              () =>
                                entry.isBlocked
                                  ? unblockUserRequest(entry._id)
                                  : blockUserRequest(entry._id),
                              entry.isBlocked ? "User unblocked" : "User blocked",
                            )
                          }
                        >
                          {mutatingId === `block-${entry._id}` && <span className="loading loading-spinner loading-xs" />}
                          <span>{entry.isBlocked ? "Unblock" : "Block"}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="No users found" copy="No user accounts are registered in the system." />
        )}
      </SectionPanel>
    </MotionPage>
  );
}
