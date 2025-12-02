// pages/demo-setup.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

import Layout from "../components/Layout";
import Card from "../components/Card";
import Button from "../components/Button";

import { storage } from "../utils/storage";
import type { User } from "../utils/types";

type Expertise =
  | "Developer"
  | "Video Editor"
  | "Designer"
  | "Marketing"
  | "Writing"
  | "General";

export default function DemoSetup() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [selectedExpertise, setSelectedExpertise] = useState<Expertise>("Developer");
  const [extraSkills, setExtraSkills] = useState("");

  // AUTH & INITIALIZE
  useEffect(() => {
    const current = storage.getCurrentUser();

    if (!current || current.role !== "worker") {
      router.push("/login");
      return;
    }

    if (current.demoTaskCompleted) {
      router.push("/dashboard");
      return;
    }

    setUser(current);
  }, [router]);

  const handleSubmit = async () => {
    if (!user) return;

    const skills: string[] = [selectedExpertise];

    if (extraSkills.trim()) {
      skills.push(
        ...extraSkills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      );
    }

    await storage.updateUser(user.id, { skills });

    const updatedUser: User = { ...user, skills };
    storage.setCurrentUser(updatedUser);

    router.push("/demo-task");
  };

  if (!user) return null;

  const OPTIONS: Expertise[] = [
    "Developer",
    "Video Editor",
    "Designer",
    "Marketing",
    "Writing",
    "General",
  ];

  return (
    <Layout>
      <Head>
        <title>Select Expertise - Cehpoint</title>
      </Head>

      <div className="max-w-2xl mx-auto">
        <Card>
          <h1 className="text-3xl font-bold mb-4">Choose Your Expertise</h1>
          <p className="text-gray-600 mb-6">
            Select your primary work role. We will generate a demo task tailored to your expertise.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            {OPTIONS.map((role) => (
              <button
                key={role}
                onClick={() => setSelectedExpertise(role)}
                className={`border rounded-lg px-4 py-3 text-sm font-medium ${
                  selectedExpertise === role
                    ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          <label className="block text-sm font-medium mb-2">Other skills (optional)</label>
          <input
            type="text"
            value={extraSkills}
            onChange={(e) => setExtraSkills(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
            placeholder="e.g. React, Copywriting, SEO, UI Design..."
          />

          <Button onClick={handleSubmit} fullWidth className="mt-6">
            Continue to Demo Task
          </Button>
        </Card>
      </div>
    </Layout>
  );
}
