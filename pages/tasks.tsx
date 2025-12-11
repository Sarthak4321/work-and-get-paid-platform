import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

import Layout from "../components/Layout";
import Card from "../components/Card";
import Button from "../components/Button";

import { storage } from "../utils/storage";
import { User, Task } from "../utils/types";
import { format } from "date-fns";

export default function Tasks() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<
    "all" | "in-progress" | "submitted" | "completed"
  >("all");
  const [loading, setLoading] = useState(true);

  // AUTH CHECK
  useEffect(() => {
    const current = storage.getCurrentUser();

    if (!current || current.role !== "worker") {
      router.replace("/login");
      return;
    }

    setUser(current);
    loadTasks(current.id);
  }, []);

  // Load tasks
  const loadTasks = async (userId: string) => {
    const all = await storage.getTasks();
    const assigned = all.filter((t) => t.assignedTo === userId);
    setTasks(assigned);
    setLoading(false);
  };

  // Submit task (FIXED)
  const handleSubmitTask = async (taskId: string) => {
    const submission = prompt("Enter your submission URL or description:");
    if (!submission) return;

    try {
      await storage.updateTask(taskId, {
        status: "submitted",
        submittedAt: new Date().toISOString(),
        submissionUrl: submission,
      });

      alert("Task submitted successfully. Awaiting review.");

      if (user) loadTasks(user.id);
    } catch (err) {
      console.error("submit error:", err);
      alert("Failed to submit task.");
    }
  };

  const filteredTasks =
    filter === "all" ? tasks : tasks.filter((t) => t.status === filter);

  if (loading || !user) return null;

  return (
    <Layout>
      <Head>
        <title>My Tasks - Cehpoint</title>
      </Head>

      <div className="space-y-6">
        {/* HEADER + FILTERS (RESPONSIVE) */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            My Tasks
          </h1>

          <div className="flex flex-wrap gap-2">
            {["all", "in-progress", "submitted", "completed"].map((status) => (
              <button
                key={status}
                onClick={() =>
                  setFilter(
                    status as "all" | "in-progress" | "submitted" | "completed"
                  )
                }
                className={`px-3 py-2 rounded-lg text-sm md:text-base ${
                  filter === status
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* TASK LIST */}
        {filteredTasks.length === 0 ? (
          <Card>
            <p className="text-center text-gray-500 py-10 md:py-12">
              No tasks found
            </p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredTasks.map((task) => (
              <Card key={task.id} hover>
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 md:gap-6">
                  {/* LEFT: TASK DETAILS */}
                  <div className="flex-1 min-w-0">
                    {/* Title + Status */}
                    <div className="flex flex-wrap items-center gap-2 md:gap-3">
                      <h3 className="text-lg md:text-xl font-semibold break-words">
                        {task.title}
                      </h3>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          task.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : task.status === "submitted"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {task.status}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 mt-2 text-sm md:text-base break-words">
                      {task.description}
                    </p>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {task.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-1 bg-indigo-100 text-indigo-600 text-xs rounded"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    {/* Metadata */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mt-4 text-sm">
                      <div>
                        <span className="text-gray-500">Category:</span>{" "}
                        <span className="font-medium">{task.category}</span>
                      </div>

                      <div>
                        <span className="text-gray-500">Payout:</span>{" "}
                        <span className="font-medium text-green-600">
                          ${task.weeklyPayout}
                        </span>
                      </div>

                      <div>
                        <span className="text-gray-500">Deadline:</span>{" "}
                        <span className="font-medium">
                          {format(new Date(task.deadline), "MMM dd, yyyy")}
                        </span>
                      </div>

                      {task.submittedAt && (
                        <div>
                          <span className="text-gray-500">Submitted:</span>{" "}
                          <span className="font-medium">
                            {format(
                              new Date(task.submittedAt),
                              "MMM dd, yyyy"
                            )}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Feedback */}
                    {task.feedback && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700">
                          Feedback:
                        </p>
                        <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap break-words">
                          {task.feedback}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* RIGHT: SUBMIT BUTTON (STACKED ON MOBILE) */}
                  <div className="flex md:block justify-start md:justify-end">
                    {task.status === "in-progress" && (
                      <Button
                        onClick={() => handleSubmitTask(task.id)}
                        className="w-full md:w-auto"
                      >
                        Submit Task
                      </Button>
                    )}

                    {task.status === "submitted" && (
                      <Button disabled variant="outline" className="w-full md:w-auto">
                        Submitted ✓
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
