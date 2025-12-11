// pages/admin/tasks.tsx
import { useEffect, useState, ChangeEvent } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

import Layout from "../../components/Layout";
import Card from "../../components/Card";
import Button from "../../components/Button";

import { storage } from "../../utils/storage";
import type { User, Task, Payment, Currency } from "../../utils/types";

import { Plus } from "lucide-react";

type NewTaskForm = {
  title: string;
  description: string;
  category: string;
  skills: string[];
  weeklyPayout: number; // stored in base USD
  deadline: string;
};

const INR_RATE = 89; // 🔹 simple fixed rate

function formatMoney(amountUsd: number, currency: Currency): string {
  const symbol = currency === "INR" ? "₹" : "$";
  const converted = currency === "INR" ? amountUsd * INR_RATE : amountUsd;
  return `${symbol}${converted.toFixed(2)}`;
}

function toBase(enteredAmount: number, currency: Currency): number {
  return currency === "INR" ? enteredAmount / INR_RATE : enteredAmount;
}

export default function AdminTasks() {
  const router = useRouter();

  const [currentAdmin, setCurrentAdmin] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [workers, setWorkers] = useState<User[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  // 🔹 Currency state (shared admin preference)
  const [currency, setCurrency] = useState<Currency>("USD");
  const [updatingCurrency, setUpdatingCurrency] = useState(false);

  const [newTask, setNewTask] = useState<NewTaskForm>({
    title: "",
    description: "",
    category: "",
    skills: [],
    weeklyPayout: 0, // stored as USD
    deadline: "",
  });

  // 🔹 Separate string state for the Weekly Payout input
  const [weeklyPayoutInput, setWeeklyPayoutInput] = useState<string>("");

  const skillOptions = [
    "React",
    "Node.js",
    "Python",
    "Java",
    "PHP",
    "Angular",
    "Vue.js",
    "Video Editing",
    "Adobe Premiere",
    "After Effects",
    "UI/UX Design",
    "Graphic Design",
    "Content Writing",
    "Digital Marketing",
    "SEO",
  ];

  /* -------------------------------------------------------
   * AUTH + INITIAL LOAD
   * ----------------------------------------------------- */
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const currentUser = storage.getCurrentUser();
      if (!currentUser || currentUser.role !== "admin") {
        router.replace("/login");
        return;
      }

      if (!mounted) return;
      setCurrentAdmin(currentUser);
      setCurrency(currentUser.preferredCurrency || "USD");

      try {
        setPageLoading(true);
        const [users, list] = await Promise.all([
          storage.getUsers(),
          storage.getTasks(),
        ]);

        if (!mounted) return;

        setWorkers(users.filter((u) => u.role === "worker"));
        setTasks(
          list.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() -
              new Date(a.createdAt).getTime()
          )
        );
      } catch (err) {
        console.error("Failed to load admin data:", err);
        alert("Failed to load admin data. Please check console.");
      } finally {
        if (mounted) setPageLoading(false);
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, [router]);

  const reloadTasks = async () => {
    const list = await storage.getTasks();
    setTasks(
      list.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    );
  };

  /* -------------------------------------------------------
   * HANDLE CURRENCY CHANGE
   * ----------------------------------------------------- */
  const handleCurrencyChange = async (value: Currency) => {
    if (!currentAdmin) return;
    if (value === currency) return;

    setCurrency(value);
    setUpdatingCurrency(true);

    try {
      const updated: User = {
        ...currentAdmin,
        preferredCurrency: value,
      };

      await storage.updateUser(currentAdmin.id, { preferredCurrency: value });
      storage.setCurrentUser(updated);
      setCurrentAdmin(updated);
    } catch (err) {
      console.error("Failed to update currency preference:", err);
      alert("Failed to update currency preference.");
    } finally {
      setUpdatingCurrency(false);
    }
  };

  /* -------------------------------------------------------
   * WEEKLY PAYOUT INPUT HANDLER (FIXED)
   * ----------------------------------------------------- */
  const handleWeeklyPayoutChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;

    // Allow the field to be completely empty while typing
    setWeeklyPayoutInput(raw);

    if (raw === "") {
      setNewTask((prev) => ({ ...prev, weeklyPayout: 0 }));
      return;
    }

    const val = parseFloat(raw);
    if (isNaN(val)) {
      return;
    }

    const baseUsd = toBase(val, currency);
    setNewTask((prev) => ({ ...prev, weeklyPayout: baseUsd }));
  };

  /* -------------------------------------------------------
   * CREATE TASK
   * ----------------------------------------------------- */
  const handleCreateTask = async () => {
    if (
      !newTask.title.trim() ||
      !newTask.description.trim() ||
      !newTask.category.trim() ||
      newTask.skills.length === 0 ||
      !newTask.deadline
    ) {
      alert("Please fill all fields.");
      return;
    }

    if (!currentAdmin) {
      alert("Admin session missing.");
      return;
    }

    const payload: Omit<Task, "id"> = {
      title: newTask.title.trim(),
      description: newTask.description.trim(),
      category: newTask.category.trim(),
      skills: newTask.skills,
      weeklyPayout: Number(newTask.weeklyPayout) || 0, // stored as USD
      deadline: newTask.deadline,
      status: "available",
      assignedTo: null,
      submissionUrl: "",
      createdAt: new Date().toISOString(),
      createdBy: currentAdmin.id,
    };

    try {
      setBusy(true);
      await storage.createTask(payload);

      setNewTask({
        title: "",
        description: "",
        category: "",
        skills: [],
        weeklyPayout: 0,
        deadline: "",
      });
      setWeeklyPayoutInput("");
      setShowCreate(false);

      await reloadTasks();
      alert("Task created successfully.");
    } catch (err) {
      console.error("createTask error:", err);
      alert("Failed to create task.");
    } finally {
      setBusy(false);
    }
  };

  /* -------------------------------------------------------
   * ASSIGN TASK
   * ----------------------------------------------------- */
  const handleAssignTask = async (taskId: string, workerId: string) => {
    if (!workerId) {
      alert("Select a worker to assign.");
      return;
    }

    if (!confirm("Assign this task to the selected worker?")) return;

    try {
      setBusy(true);
      await storage.updateTask(taskId, {
        assignedTo: workerId,
        status: "in-progress",
        assignedAt: new Date().toISOString(),
      });
      await reloadTasks();
      alert("Task assigned.");
    } catch (err) {
      console.error("assignTask error:", err);
      alert("Failed to assign task.");
    } finally {
      setBusy(false);
    }
  };

  /* -------------------------------------------------------
   * APPROVE TASK (mark completed + payment)
   * ----------------------------------------------------- */
  const handleApproveTask = async (taskId: string) => {
    const job = tasks.find((t) => t.id === taskId);
    if (!job) {
      alert("Task not found.");
      return;
    }
    if (!job.assignedTo) {
      alert("Task is not assigned to any worker.");
      return;
    }

    if (!confirm("Approve this task and release payment?")) return;

    try {
      setBusy(true);

      await storage.updateTask(taskId, {
        status: "completed",
        completedAt: new Date().toISOString(),
      });

      const payment: Omit<Payment, "id"> = {
        userId: job.assignedTo,
        amount: job.weeklyPayout, // base USD
        type: "task-payment",
        status: "completed",
        taskId: job.id,
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      };

      await storage.createPayment(payment);

      try {
        const worker = await storage.getUserById(job.assignedTo);
        if (worker) {
          const newBalance = (worker.balance || 0) + job.weeklyPayout;
          await storage.updateUser(worker.id, { balance: newBalance });
        }
      } catch (err) {
        console.warn("Failed to update worker balance:", err);
      }

      await reloadTasks();
      alert("Task approved and payment processed.");
    } catch (err) {
      console.error("approveTask error:", err);
      alert("Failed to approve task.");
    } finally {
      setBusy(false);
    }
  };

  /* -------------------------------------------------------
   * REJECT TASK
   * ----------------------------------------------------- */
  const handleRejectTask = async (taskId: string) => {
    const feedback = prompt("Enter rejection reason (optional):") || "";
    if (!feedback && !confirm("No feedback entered. Reject anyway?")) return;

    try {
      setBusy(true);
      await storage.updateTask(taskId, {
        status: "rejected",
        feedback: feedback || undefined,
      });
      await reloadTasks();
      alert("Task rejected.");
    } catch (err) {
      console.error("rejectTask error:", err);
      alert("Failed to reject task.");
    } finally {
      setBusy(false);
    }
  };

  /* -------------------------------------------------------
   * DELETE TASK
   * ----------------------------------------------------- */
  const handleDeleteTask = async (taskId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this task? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setBusy(true);
      // @ts-ignore allow dynamic method
      if (typeof (storage as any).deleteTask === "function") {
        // @ts-ignore
        await (storage as any).deleteTask(taskId);
      } else {
        console.warn("storage.deleteTask is not implemented.");
        alert("Delete is not supported by storage.");
      }

      await reloadTasks();
      alert("Task deleted.");
    } catch (err) {
      console.error("deleteTask error:", err);
      alert("Failed to delete task.");
    } finally {
      setBusy(false);
    }
  };

  /* -------------------------------------------------------
   * SKILL TOGGLE (CREATE FORM)
   * ----------------------------------------------------- */
  const handleSkillToggle = (skill: string) => {
    setNewTask((prev) => {
      if (prev.skills.includes(skill)) {
        return { ...prev, skills: prev.skills.filter((s) => s !== skill) };
      }
      return { ...prev, skills: [...prev.skills, skill] };
    });
  };

  if (pageLoading) return null;
  if (!currentAdmin) return null;

  return (
    <Layout>
      <Head>
        <title>Manage Tasks - Cehpoint</title>
      </Head>

      <div className="space-y-6">
        {/* Header + currency selector */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Manage Tasks</h1>

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

          <Button onClick={() => setShowCreate((s) => !s)}>
            <Plus size={18} />
            <span>{showCreate ? "Close" : "Create Task"}</span>
          </Button>
        </div>

        {/* CREATE TASK FORM */}
        {showCreate && (
          <Card>
            <h3 className="text-xl font-semibold mb-4">Create New Task</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Task title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask({ ...newTask, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                  rows={3}
                  placeholder="Task description"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Category
                  </label>
                  <select
                    value={newTask.category}
                    onChange={(e) =>
                      setNewTask({ ...newTask, category: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="">Select category</option>
                    <option value="Development">Development</option>
                    <option value="Design">Design</option>
                    <option value="Video Editing">Video Editing</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Writing">Writing</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Weekly Payout ({currency === "INR" ? "INR" : "USD"})
                  </label>
                  <input
                    type="number"
                    value={weeklyPayoutInput}
                    onChange={handleWeeklyPayoutChange}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder={`Amount in ${currency}`}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Stored internally in USD. Current base value:{" "}
                    {formatMoney(newTask.weeklyPayout, "USD")} (displayed as{" "}
                    {formatMoney(newTask.weeklyPayout, currency)}).
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Deadline
                </label>
                <input
                  type="date"
                  value={newTask.deadline}
                  onChange={(e) =>
                    setNewTask({ ...newTask, deadline: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Required Skills
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {skillOptions.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => handleSkillToggle(skill)}
                      className={`px-3 py-2 rounded-lg border text-sm transition ${
                        newTask.skills.includes(skill)
                          ? "border-indigo-600 bg-indigo-100 text-indigo-700"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3">
                <Button onClick={handleCreateTask} disabled={busy}>
                  Create Task
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCreate(false)}
                  disabled={busy}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* TASK LIST */}
        <div className="grid gap-4">
          {tasks.length === 0 && (
            <Card>
              <p className="text-center text-gray-500 py-8">No tasks yet</p>
            </Card>
          )}

          {tasks.map((task) => {
            const assignedWorker =
              workers.find((w) => w.id === task.assignedTo) || null;

            return (
              <Card key={task.id}>
                <div className="flex justify-between items-start">
                  {/* LEFT: TASK DETAILS */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-semibold">{task.title}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          task.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : task.status === "in-progress"
                            ? "bg-orange-100 text-orange-700"
                            : task.status === "submitted"
                            ? "bg-blue-100 text-blue-700"
                            : task.status === "rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {task.status}
                      </span>
                    </div>

                    <p className="text-gray-600 mt-2">{task.description}</p>

                    <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                      <div>
                        <span className="text-gray-500">Category:</span>{" "}
                        {task.category}
                      </div>
                      <div>
                        <span className="text-gray-500">Payout:</span>{" "}
                        {formatMoney(task.weeklyPayout, currency)}
                      </div>
                      <div>
                        <span className="text-gray-500">Deadline:</span>{" "}
                        {task.deadline
                          ? new Date(task.deadline).toLocaleDateString()
                          : "-"}
                      </div>
                    </div>

                    <div className="mt-3 text-sm">
                      <span className="text-gray-500">Required skills: </span>
                      <div className="inline-flex gap-2 flex-wrap ml-1">
                        {task.skills?.map((s) => (
                          <span
                            key={s}
                            className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-3 text-sm">
                      <span className="text-gray-500">Assigned to: </span>
                      {assignedWorker ? (
                        <span className="font-medium ml-2">
                          {assignedWorker.fullName} ({assignedWorker.email})
                        </span>
                      ) : (
                        <span className="italic ml-2 text-gray-500">
                          Not assigned
                        </span>
                      )}
                    </div>

                    {/* TASK SUBMISSION (FROM WORKER) */}
                    {task.submissionUrl && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-800">
                          Task Submission
                        </p>
                        <a
                          href={task.submissionUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-indigo-700 break-all underline mt-1 inline-block"
                        >
                          {task.submissionUrl}
                        </a>
                        {task.submittedAt && (
                          <p className="text-xs text-gray-500 mt-1">
                            Submitted on{" "}
                            {new Date(task.submittedAt).toLocaleString()}
                          </p>
                        )}
                        {task.feedback && (
                          <p className="text-xs text-gray-600 mt-2">
                            Feedback: {task.feedback}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* RIGHT: ACTIONS */}
                  <div className="flex flex-col space-y-2 min-w-[190px] ml-4">
                    {task.status === "available" && (
                      <select
                        value={task.assignedTo || ""}
                        onChange={(e) =>
                          handleAssignTask(task.id, e.target.value)
                        }
                        className="px-3 py-2 border rounded-lg"
                        disabled={busy}
                      >
                        <option value="">Select worker to assign</option>
                        {workers.map((w) => (
                          <option key={w.id} value={w.id}>
                            {w.fullName} — {w.email}
                          </option>
                        ))}
                      </select>
                    )}

                    {task.status === "submitted" && (
                      <>
                        <Button
                          onClick={() => handleApproveTask(task.id)}
                          disabled={busy}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => handleRejectTask(task.id)}
                          disabled={busy}
                        >
                          Reject
                        </Button>
                      </>
                    )}

                    {task.status === "in-progress" && (
                      <>
                        <Button
                          onClick={() => handleApproveTask(task.id)}
                          disabled={busy}
                        >
                          Mark Complete &amp; Pay
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => handleRejectTask(task.id)}
                          disabled={busy}
                        >
                          Reject
                        </Button>
                      </>
                    )}

                    <Button
                      variant="outline"
                      onClick={() => handleDeleteTask(task.id)}
                      disabled={busy}
                    >
                      Delete Task
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
