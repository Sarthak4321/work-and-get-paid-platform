import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

import Layout from "../components/Layout";
import Card from "../components/Card";
import Button from "../components/Button";

import { storage } from "../utils/storage";
import type { User } from "../utils/types";

export default function DemoTask() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [submission, setSubmission] = useState("");

  /* ---------------------------------------------------------
   * AUTH CHECK
   * ------------------------------------------------------- */
  useEffect(() => {
    const currentUser = storage.getCurrentUser();

    if (!currentUser || currentUser.role !== "worker") {
      router.push("/login");
      return;
    }

    if (currentUser.demoTaskCompleted) {
      router.push("/dashboard");
      return;
    }

    setUser(currentUser);
  }, []);

  /* ---------------------------------------------------------
   * SUBMIT DEMO TASK
   * ------------------------------------------------------- */
  const handleSubmit = async () => {
    if (!submission.trim()) {
      alert("Please enter your submission");
      return;
    }

    // random score between 70-100
    const score = Math.floor(Math.random() * 30) + 70;

    // Update Firestore user
    await storage.updateUser(user!.id, {
      demoTaskCompleted: true,
      demoTaskScore: score,
    });

    // Update local current user
    storage.setCurrentUser({
      ...user!,
      demoTaskCompleted: true,
      demoTaskScore: score,
    });

    alert(`Demo task submitted! Score: ${score}/100. You can now accept regular tasks.`);
    router.push("/dashboard");
  };

  if (!user) return null;

  return (
    <Layout>
      <Head>
        <title>Demo Task - Cehpoint</title>
      </Head>

      <div className="max-w-3xl mx-auto space-y-6">
        <Card>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Complete Your Demo Task</h1>
          <p className="text-gray-600 mb-6">
            This task helps us evaluate your skills and qualify you for paid projects.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-3">Task Description</h2>
            <p className="text-gray-700 mb-4">
              Based on your selected skills: <strong>{user.skills.join(', ')}</strong>
            </p>
            <div className="space-y-2 text-gray-700">
              <p><strong>Task:</strong> Create a simple project that demonstrates your core skills.</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>For developers: Build a small functional application or component</li>
                <li>For video editors: Create a 30-60 second sample video with transitions</li>
                <li>For designers: Design a landing page mockup or UI component</li>
              </ul>
              <p className="mt-4"><strong>Deliverable:</strong> Submit a link to your work (GitHub, Google Drive, Figma, etc.)</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Your Submission Link/Description</label>
              <textarea
                value={submission}
                onChange={(e) => setSubmission(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
                placeholder="Enter your submission link or detailed description of your work"
                rows={6}
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Your submission will be evaluated by our AI system. 
                Make sure to provide clear and detailed information about your work.
              </p>
            </div>

            <Button onClick={handleSubmit} fullWidth>
              Submit Demo Task
            </Button>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
