// pages/admin/workers.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

import Layout from "../../components/Layout";
import Card from "../../components/Card";
import Button from "../../components/Button";

import { storage } from "../../utils/storage";
import type { User, Payment, Currency } from "../../utils/types";

import { CheckCircle, X, Ban, DollarSign } from "lucide-react";

/* ===========================
   Currency helpers
=========================== */
const INR_RATE = 89; // same style as worker/admin dashboards

function formatMoney(amountUsd: number, currency: Currency): string {
  const converted = currency === "INR" ? amountUsd * INR_RATE : amountUsd;
  const symbol = currency === "INR" ? "₹" : "$";
  return `${symbol}${converted.toFixed(2)}`;
}

export default function Workers() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [workers, setWorkers] = useState<User[]>([]);
  const [pendingWithdrawals, setPendingWithdrawals] = useState<Payment[]>([]);
  const [filter, setFilter] =
    useState<"all" | "active" | "pending" | "suspended">("all");

  // currency state (per admin)
  const [currency, setCurrency] = useState<Currency>("USD");
  const [updatingCurrency, setUpdatingCurrency] = useState(false);

  /* -----------------------------------------
   * AUTH + LOAD WORKERS & WITHDRAWALS
   * ----------------------------------------- */
  useEffect(() => {
    const currentUser = storage.getCurrentUser();

    if (!currentUser || currentUser.role !== "admin") {
      router.push("/login");
      return;
    }

    setUser(currentUser);
    setCurrency(currentUser.preferredCurrency || "USD");

    loadWorkers();
    loadWithdrawalRequests();
  }, [router]);

  /* -----------------------------------------
   * CURRENCY PREFERENCE (persist to user)
   * ----------------------------------------- */
  const handleCurrencyChange = async (value: Currency) => {
    if (!user) return;
    if (value === currency) return;

    setCurrency(value);
    setUpdatingCurrency(true);

    try {
      const updatedUser: User = {
        ...user,
        preferredCurrency: value,
      };

      await storage.updateUser(user.id, { preferredCurrency: value });
      storage.setCurrentUser(updatedUser);
      setUser(updatedUser);
    } catch (err) {
      console.error("Failed to update currency preference:", err);
      alert("Failed to update currency preference.");
    } finally {
      setUpdatingCurrency(false);
    }
  };

  /* -----------------------------------------
   * LOAD WORKERS
   * ----------------------------------------- */
  const loadWorkers = async () => {
    const allUsers = await storage.getUsers();
    setWorkers(allUsers.filter((u) => u.role === "worker"));
  };

  /* -----------------------------------------
   * LOAD ALL PENDING WITHDRAWALS
   * ----------------------------------------- */
  const loadWithdrawalRequests = async () => {
    const payments = await storage.getPayments(); // all payments
    const pending = payments.filter(
      (p) => p.type === "withdrawal" && p.status === "pending"
    );
    setPendingWithdrawals(pending);
  };

  /* -----------------------------------------
   * APPROVE WITHDRAWAL
   * ----------------------------------------- */
  const approveWithdrawal = async (payment: Payment) => {
    if (!confirm("Approve this withdrawal request?")) return;

    try {
      // 1) Load worker
      const worker = await storage.getUserById(payment.userId);
      if (!worker) {
        alert("Worker not found.");
        return;
      }

      if (worker.balance < payment.amount) {
        alert("Worker balance is lower than withdrawal amount.");
        return;
      }

      const newBalance = worker.balance - payment.amount;

      // 2) Update worker balance
      await storage.updateUser(worker.id, {
        balance: newBalance,
      });

      // 3) Mark payment as completed
      await storage.updatePayment(payment.id!, {
        status: "completed",
        completedAt: new Date().toISOString(),
      });

      await loadWithdrawalRequests();
      await loadWorkers(); // keep balances in list in sync
      alert("Withdrawal approved and balance updated!");
    } catch (err) {
      console.error("approveWithdrawal error:", err);
      alert("Failed to approve withdrawal.");
    }
  };

  /* -----------------------------------------
   * REJECT WITHDRAWAL
   * ----------------------------------------- */
  const rejectWithdrawal = async (payment: Payment) => {
    if (!confirm("Reject this withdrawal request?")) return;

    try {
      // Just mark payment as failed – no refund,
      // because balance was NOT deducted yet.
      await storage.updatePayment(payment.id!, {
        status: "failed",
      });

      await loadWithdrawalRequests();
      alert("Withdrawal rejected.");
    } catch (err) {
      console.error("rejectWithdrawal error:", err);
      alert("Failed to reject withdrawal.");
    }
  };

  /* -----------------------------------------
   * APPROVE WORKER
   * ----------------------------------------- */
  const handleApprove = async (workerId: string) => {
    await storage.updateUser(workerId, { accountStatus: "active" });
    await loadWorkers();
    alert("Worker approved!");
  };

  /* -----------------------------------------
   * SUSPEND WORKER
   * ----------------------------------------- */
  const handleSuspend = async (workerId: string) => {
    if (!confirm("Suspend this worker?")) return;

    await storage.updateUser(workerId, { accountStatus: "suspended" });
    await loadWorkers();
    alert("Worker suspended!");
  };

  /* -----------------------------------------
   * TERMINATE WORKER
   * ----------------------------------------- */
  const handleTerminate = async (workerId: string) => {
    if (!confirm("Terminate this worker permanently?")) return;

    await storage.updateUser(workerId, { accountStatus: "terminated" });
    await loadWorkers();
    alert("Worker terminated!");
  };

  /* -----------------------------------------
   * FILTER WORKERS
   * ----------------------------------------- */
  const filteredWorkers =
    filter === "all"
      ? workers
      : workers.filter((w) => w.accountStatus === filter);

  if (!user) return null;

  return (
    <Layout>
      <Head>
        <title>Manage Workers - Cehpoint</title>
      </Head>

      <div className="space-y-10">
        {/* -----------------------------------------
            PENDING WITHDRAWAL REQUESTS BLOCK
        ------------------------------------------- */}
        <Card>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              Pending Withdrawal Requests
            </h2>

            {/* Currency selector for this page */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Display currency:</span>
              <select
                value={currency}
                onChange={(e) =>
                  handleCurrencyChange(e.target.value as Currency)
                }
                disabled={updatingCurrency}
                className="px-3 py-1.5 border rounded-lg text-sm"
              >
                <option value="USD">USD ($)</option>
                <option value="INR">INR (₹)</option>
              </select>
            </div>
          </div>

          {pendingWithdrawals.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No pending withdrawal requests
            </p>
          ) : (
            <div className="space-y-4">
              {pendingWithdrawals.map((p) => {
                const w = workers.find((u) => u.id === p.userId);
                const pa = w?.payoutAccount;
                const availableBalanceNum =
                  typeof w?.balance === "number" ? w.balance : 0;

                return (
                  <div
                    key={p.id}
                    className="p-4 border rounded-lg flex justify-between items-center bg-white"
                  >
                    <div>
                      <p className="font-semibold">
                        {w?.fullName ?? "Unknown worker"}
                      </p>
                      <p className="text-sm text-gray-600">{w?.email}</p>

                      <p className="mt-1">
                        <span className="font-semibold text-green-600">
                          {formatMoney(p.amount, currency)}
                        </span>{" "}
                        requested on{" "}
                        {new Date(p.createdAt).toLocaleDateString()}
                      </p>

                      <p className="text-xs text-gray-500 mt-1">
                        Available Balance:{" "}
                        {formatMoney(availableBalanceNum, currency)}
                      </p>

                      {/* Payout details */}
                      {p.payoutMethod === "upi" && (
                        <div className="mt-2 text-xs text-gray-500 space-y-0.5">
                          <p>
                            <span className="font-semibold">
                              Payout Method:
                            </span>{" "}
                            UPI
                          </p>
                          <p>
                            <span className="font-semibold">UPI ID:</span>{" "}
                            {pa?.upiId ?? p.payoutMethodDetails ?? "Not set"}
                          </p>
                          <p>
                            <span className="font-semibold">Status:</span>{" "}
                            {pa?.verified ? "Verified" : "Not Verified"}
                          </p>
                        </div>
                      )}

                      {p.payoutMethod === "bank" && (
                        <div className="mt-2 text-xs text-gray-500 space-y-0.5">
                          <p>
                            <span className="font-semibold">
                              Payout Method:
                            </span>{" "}
                            Bank
                          </p>
                          <p>
                            <span className="font-semibold">
                              Account Holder:
                            </span>{" "}
                            {pa?.accountHolderName ?? "—"}
                          </p>
                          <p>
                            <span className="font-semibold">Bank:</span>{" "}
                            {pa?.bankName ?? "—"}
                          </p>
                          <p>
                            <span className="font-semibold">
                              Account Number:
                            </span>{" "}
                            {pa?.bankAccountNumber ?? "—"}
                          </p>
                          <p>
                            <span className="font-semibold">IFSC:</span>{" "}
                            {pa?.bankIfsc ?? "—"}
                          </p>
                          <p>
                            <span className="font-semibold">Status:</span>{" "}
                            {pa?.verified ? "Verified" : "Not Verified"}
                          </p>
                        </div>
                      )}

                      {/* Fallback if method missing */}
                      {!p.payoutMethod && (
                        <p className="text-xs text-gray-500 mt-2">
                          Payout Method:{" "}
                          {p.payoutMethodDetails ?? "Not specified"}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => approveWithdrawal(p)}
                        className="bg-green-600 text-white"
                      >
                        Approve
                      </Button>
                      <Button
                        onClick={() => rejectWithdrawal(p)}
                        variant="danger"
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* -----------------------------------------
            WORKERS LIST
        ------------------------------------------- */}
        <div className="space-y-6">
          {/* Filters + heading */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <h1 className="text-3xl font-bold text-gray-900">
              Manage Workers
            </h1>

            <div className="flex flex-wrap gap-2">
              {["all", "active", "pending", "suspended"].map((type) => (
                <button
                  key={type}
                  onClick={() =>
                    setFilter(type as "all" | "active" | "pending" | "suspended")
                  }
                  className={`px-4 py-2 rounded-lg ${
                    filter === type
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)} (
                  {type === "all"
                    ? workers.length
                    : workers.filter(
                        (w) => w.accountStatus === type
                      ).length}
                  )
                </button>
              ))}
            </div>
          </div>

          {/* Workers List */}
          {filteredWorkers.length === 0 ? (
            <Card>
              <p className="text-center text-gray-500 py-12">
                No workers found
              </p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredWorkers.map((worker) => (
                <Card key={worker.id}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-xl font-semibold">
                          {worker.fullName}
                        </h3>

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            worker.accountStatus === "active"
                              ? "bg-green-100 text-green-700"
                              : worker.accountStatus === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : worker.accountStatus === "suspended"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {worker.accountStatus}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                        <div>
                          <span className="text-gray-500">Email:</span>{" "}
                          {worker.email}
                        </div>
                        <div>
                          <span className="text-gray-500">Phone:</span>{" "}
                          {worker.phone}
                        </div>
                        <div>
                          <span className="text-gray-500">Experience:</span>{" "}
                          {worker.experience}
                        </div>
                        <div>
                          <span className="text-gray-500">Timezone:</span>{" "}
                          {worker.timezone}
                        </div>
                        <div>
                          <span className="text-gray-500">Knowledge:</span>{" "}
                          {worker.knowledgeScore}%
                        </div>
                        <div>
                          <span className="text-gray-500">Balance:</span>{" "}
                          {formatMoney(worker.balance, currency)}
                        </div>
                      </div>

                      <div className="mt-3">
                        <span className="text-sm text-gray-500">Skills:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {worker.skills.map((s) => (
                            <span
                              key={s}
                              className="px-2 py-1 bg-indigo-100 text-indigo-600 text-xs rounded"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2">
                      {worker.accountStatus === "pending" && (
                        <Button
                          onClick={() => handleApprove(worker.id)}
                          variant="secondary"
                        >
                          <CheckCircle size={16} />
                          <span>Approve</span>
                        </Button>
                      )}

                      {worker.accountStatus === "active" && (
                        <Button
                          onClick={() => handleSuspend(worker.id)}
                          variant="danger"
                        >
                          <Ban size={16} />
                          <span>Suspend</span>
                        </Button>
                      )}

                      {worker.accountStatus !== "terminated" && (
                        <Button
                          onClick={() => handleTerminate(worker.id)}
                          variant="danger"
                        >
                          <X size={16} />
                          <span>Terminate</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
