"use client";

import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { CheckCircle } from "lucide-react";

import { googleAuth, githubAuth } from "../utils/authProviders";
import { firebaseSignup } from "../utils/authEmailPassword";

// Firestore / Firebase
import { db } from "../utils/firebase";
import { doc, setDoc } from "firebase/firestore";

// Local storage session
import { storage } from "../utils/storage";

// UI
import Button from "../components/Button";
import { User } from "../utils/types";

/* ============================================================
 * QUIZ QUESTION TYPES + BANK
 * ========================================================== */
type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswer: number; // index in options[]
};

const QUESTION_SETS: Record<string, QuizQuestion[]> = {
  dev: [
    {
      question: "In React, which hook is used to manage component state?",
      options: ["useEffect", "useState", "useMemo", "useRef"],
      correctAnswer: 1,
    },
    {
      question: "In Node.js, which object is used to handle HTTP requests?",
      options: ["http.Server", "http.Request", "http.Client", "http.Handler"],
      correctAnswer: 0,
    },
    {
      question: "Which HTTP status code means 'Not Found'?",
      options: ["200", "301", "404", "500"],
      correctAnswer: 2,
    },
  ],
  design: [
    {
      question: "Which principle means 'space around elements'?",
      options: ["Hierarchy", "Contrast", "White space", "Alignment"],
      correctAnswer: 2,
    },
    {
      question: "Which tool is best suited for UI design?",
      options: ["Figma", "Excel", "VS Code", "Slack"],
      correctAnswer: 0,
    },
    {
      question: "In video editing, what does FPS stand for?",
      options: [
        "Frames Per Second",
        "First Primary Shot",
        "Fast Play Speed",
        "Frame Processing System",
      ],
      correctAnswer: 0,
    },
  ],
  content: [
    {
      question: "What is the main goal of a blog article?",
      options: [
        "Entertain only",
        "Provide value to the reader",
        "Use as many keywords as possible",
        "Write as long as possible",
      ],
      correctAnswer: 1,
    },
    {
      question: "Which is MOST important for good web copy?",
      options: ["Fancy words", "Short paragraphs", "Slang", "All caps text"],
      correctAnswer: 1,
    },
  ],
  marketing: [
    {
      question: "What does SEO stand for?",
      options: [
        "Search Engine Optimization",
        "Social Engagement Outreach",
        "Simple Email Operations",
        "Sales Engagement Objective",
      ],
      correctAnswer: 0,
    },
    {
      question: "Which metric tells you how many people clicked your ad?",
      options: ["CTR", "CPC", "ROI", "ARPU"],
      correctAnswer: 0,
    },
  ],
  general: [
    {
      question: "Which of these is MOST important when working remotely?",
      options: ["Fast typing", "Clear communication", "Fancy laptop", "Dark mode"],
      correctAnswer: 1,
    },
    {
      question: "If you are stuck on a task, what should you do?",
      options: [
        "Ignore it",
        "Guess and submit",
        "Ask for clarification from the manager",
        "Wait for someone to notice",
      ],
      correctAnswer: 2,
    },
  ],
};

// Decide which question set to use based on selected skills
function getQuestionsForSkills(skills: string[]): QuizQuestion[] {
  const devSkills = ["React", "Node.js", "Python", "Java", "PHP", "Angular", "Vue.js"];
  const designSkills = [
    "UI/UX Design",
    "Graphic Design",
    "Adobe Premiere",
    "After Effects",
    "Video Editing",
  ];
  const contentSkills = ["Content Writing"];
  const marketingSkills = ["Digital Marketing", "SEO"];

  const hasDev = skills.some((s) => devSkills.includes(s));
  const hasDesign = skills.some((s) => designSkills.includes(s));
  const hasContent = skills.some((s) => contentSkills.includes(s));
  const hasMarketing = skills.some((s) => marketingSkills.includes(s));

  if (hasDev) return QUESTION_SETS.dev;
  if (hasDesign) return QUESTION_SETS.design;
  if (hasContent) return QUESTION_SETS.content;
  if (hasMarketing) return QUESTION_SETS.marketing;
  return QUESTION_SETS.general;
}

// Timezone + currency options
const TIMEZONE_OPTIONS = [
  { label: "India (IST, UTC+5:30)", value: "Asia/Kolkata" },
  { label: "UTC (Universal Time)", value: "UTC" },
  { label: "US Pacific (PT)", value: "America/Los_Angeles" },
  { label: "US Eastern (ET)", value: "America/New_York" },
  { label: "Europe (CET)", value: "Europe/Berlin" },
];

const CURRENCY_OPTIONS: Array<"INR" | "USD"> = ["INR", "USD"];

export default function Signup() {
  const router = useRouter();

  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    phone: "",
    skills: [] as string[],
    experience: "",
    timezone: "",
    preferredWeeklyPayout: 500,
    payoutCurrency: "INR" as "INR" | "USD", // default currency
  });

  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [knowledgeQuestions, setKnowledgeQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);

  // track how user authenticated
  const [authMethod, setAuthMethod] = useState<
    "email" | "google" | "github" | null
  >(null);
  const [authUid, setAuthUid] = useState<string | null>(null);
  const [authEmailVerified, setAuthEmailVerified] = useState<boolean>(false);

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

  const handleSkillToggle = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  /* ------------------------------------------------------------------
   * FINAL USER CREATION (Firestore + local session for OAuth)
   * ------------------------------------------------------------------ */
  const createFirestoreUser = async (
    uid: string,
    emailVerified: boolean,
    finalScore: number
  ) => {
    const now = new Date().toISOString();

    const newUser: User = {
      id: uid,
      uid: uid,
      email: formData.email,
      password: authMethod === "email" ? formData.password : "",
      fullName: formData.fullName,
      phone: formData.phone,
      skills: selectedSkills,
      experience: formData.experience,
      timezone: formData.timezone,
      preferredWeeklyPayout: formData.preferredWeeklyPayout,
      preferredCurrency: formData.payoutCurrency,

      emailVerified,

      role: "worker",
      accountStatus: "pending",
      knowledgeScore: finalScore,
      demoTaskCompleted: false,
      createdAt: now,
      balance: 0,
    };

    await setDoc(doc(db, "users", uid), newUser);

    if (authMethod === "google" || authMethod === "github") {
      storage.setCurrentUser(newUser);
      router.push("/dashboard");
    } else {
      alert("Account created. Please verify your email, then log in.");
      router.push("/login");
    }
  };

  /* ============================================================
   * GOOGLE SIGNUP
   * ========================================================== */
  const handleGoogleSignup = async () => {
    try {
      const result = await googleAuth();
      const user = result.user;

      setAuthMethod("google");
      setAuthUid(user.uid);
      setAuthEmailVerified(user.emailVerified ?? false);

      setFormData((prev) => ({
        ...prev,
        email: user.email || prev.email,
        fullName: prev.fullName || user.displayName || "",
      }));

      setStep(2);
    } catch (err) {
      console.error(err);
      alert("Google signup failed.");
    }
  };

  /* ============================================================
   * GITHUB SIGNUP
   * ========================================================== */
  const handleGithubSignup = async () => {
    try {
      const result = await githubAuth();
      const user = result.user;

      setAuthMethod("github");
      setAuthUid(user.uid);
      setAuthEmailVerified(user.emailVerified ?? false);

      const fallbackName =
        user.displayName ||
        (user as any)?.reloadUserInfo?.screenName ||
        user.email?.split("@")[0] ||
        "New User";

      setFormData((prev) => ({
        ...prev,
        email: user.email || prev.email,
        fullName: prev.fullName || fallbackName,
      }));

      setStep(2);
    } catch (err) {
      console.error(err);
      alert("GitHub signup failed.");
    }
  };

  /* ============================================================
   * EMAIL + PASSWORD SIGNUP (created at final step)
   * ========================================================== */
  const completeEmailSignup = async (finalScore: number) => {
    try {
      const result = await firebaseSignup(formData.email, formData.password);
      const user = result.user;

      alert("Verification email sent! Please check your inbox.");

      await createFirestoreUser(user.uid, false, finalScore);
    } catch (err) {
      console.error(err);
      alert("Email signup failed.");
    }
  };

  /* ============================================================
   * STEP HANDLING
   * ========================================================== */
  const handleNext = async () => {
    // STEP 1 -> STEP 2
    if (step === 1) {
      if (!authMethod) {
        // email/password flow
        if (
          !formData.email ||
          !formData.password ||
          !formData.fullName ||
          !formData.phone
        ) {
          alert("Please fill all fields");
          return;
        }
        setAuthMethod("email");
      } else {
        // OAuth flow – still need name + phone
        if (!formData.fullName || !formData.phone) {
          alert("Please fill your name & phone");
          return;
        }
      }

      setStep(2);
      return;
    }

    // STEP 2 -> STEP 3
    if (step === 2) {
      if (
        selectedSkills.length === 0 ||
        !formData.experience ||
        !formData.timezone ||
        !formData.preferredWeeklyPayout
      ) {
        alert("Please complete all fields in this step");
        return;
      }

      setFormData({ ...formData, skills: selectedSkills });

      setLoading(true);
      try {
        const qs = getQuestionsForSkills(selectedSkills);
        setKnowledgeQuestions(qs);
        setAnswers(new Array(qs.length).fill(-1));
        setStep(3);
      } finally {
        setLoading(false);
      }
      return;
    }

    // STEP 3 -> FINAL SIGNUP
    if (step === 3) {
      if (!knowledgeQuestions.length) {
        alert("No questions loaded.");
        return;
      }

      if (answers.some((ans) => ans === -1)) {
        alert("Please answer all questions.");
        return;
      }

      const correct = answers.filter(
        (ans, i) => ans === knowledgeQuestions[i].correctAnswer
      ).length;

      const finalScore = (correct / knowledgeQuestions.length) * 100;
      setScore(finalScore);

      if (finalScore < 60) {
        alert("Score too low! You need at least 60% to qualify.");
        return;
      }

      if (authMethod === "email" || authMethod === null) {
        await completeEmailSignup(finalScore);
      } else {
        if (!authUid) {
          alert("Something went wrong with OAuth session.");
          return;
        }
        await createFirestoreUser(authUid, authEmailVerified, finalScore);
      }
    }
  };

  /* ============================================================
   * UI
   * ========================================================== */
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 py-12">
      <Head>
        <title>Sign Up - Cehpoint</title>
      </Head>

      <div className="max-w-2xl mx-auto px-4 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/">
            <span className="text-4xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent cursor-pointer">
              Cehpoint
            </span>
          </Link>

          <h1 className="text-4xl font-black mt-6">Join Our Platform</h1>
          <p className="text-gray-600 mt-3 text-lg">
            Start your project-based work journey
          </p>
        </div>

        {/* FORM CARD */}
        <div className="glass-card rounded-3xl premium-shadow p-10">
          {/* Step Indicators */}
          <div className="flex justify-between mb-10">
            {["Basic Info", "Skills", "Verification"].map((label, i) => (
              <div
                key={i}
                className={`flex-1 text-center ${
                  step >= i + 1 ? "text-indigo-600" : "text-gray-400"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-full ${
                    step >= i + 1
                      ? "bg-gradient-to-br from-indigo-600 to-purple-600"
                      : "bg-gray-300"
                  } text-white flex items-center justify-center mx-auto mb-2 font-bold shadow-lg`}
                >
                  {step > i + 1 ? <CheckCircle size={22} /> : i + 1}
                </div>
                <p className="text-sm font-bold">{label}</p>
              </div>
            ))}
          </div>

          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-6">
              {/* OAuth */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleGoogleSignup}
                  className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 px-5 py-3 rounded-xl"
                >
                  <img src="/google.png" className="w-5 h-5" />
                  Sign up with Google
                </button>

                <button
                  type="button"
                  onClick={handleGithubSignup}
                  className="w-full flex items-center justify-center gap-2 bg-black text-white px-5 py-3 rounded-xl"
                >
                  <img src="/github.png" className="w-5 h-5 invert" />
                  Sign up with GitHub
                </button>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-300" />
                <span className="text-sm text-gray-500">or</span>
                <div className="flex-1 h-px bg-gray-300" />
              </div>

              {/* BASIC FIELDS */}
              <div>
                <label className="block font-bold mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  className="w-full px-5 py-4 premium-input rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-5 py-4 premium-input rounded-xl"
                />
              </div>

              {/* Password only if not OAuth */}
              {authMethod !== "google" && authMethod !== "github" && (
                <div>
                  <label className="block font-bold mb-2">Password</label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full px-5 py-4 premium-input rounded-xl"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-5 py-4 premium-input rounded-xl"
                />
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-4">
              <label className="font-bold">Select Your Skills</label>

              <div className="grid grid-cols-2 gap-2">
                {skillOptions.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => handleSkillToggle(skill)}
                    className={`px-4 py-2 rounded-lg border-2 ${
                      selectedSkills.includes(skill)
                        ? "border-indigo-600 bg-indigo-50 text-indigo-600"
                        : "border-gray-300"
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>

              <div>
                <label className="block font-bold mb-2">Experience</label>
                <select
                  value={formData.experience}
                  onChange={(e) =>
                    setFormData({ ...formData, experience: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="">Select experience</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>

              {/* Timezone select */}
              <div>
                <label className="block font-bold mb-2">Timezone</label>
                <select
                  value={formData.timezone}
                  onChange={(e) =>
                    setFormData({ ...formData, timezone: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="">Select timezone</option>
                  {TIMEZONE_OPTIONS.map((tz) => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Weekly payout (amount + currency) */}
              <div>
                <label className="block font-bold mb-2">
                  Weekly Payout Expectation
                </label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    value={formData.preferredWeeklyPayout}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        preferredWeeklyPayout: Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="Amount"
                  />
                  <select
                    value={formData.payoutCurrency}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        payoutCurrency: e.target.value as "INR" | "USD",
                      })
                    }
                    className="px-4 py-2 border rounded-lg min-w-[90px]"
                  >
                    {CURRENCY_OPTIONS.map((cur) => (
                      <option key={cur} value={cur}>
                        {cur}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Knowledge Check</h3>

              {knowledgeQuestions.map((q, idx) => (
                <div key={idx} className="border rounded-lg p-4">
                  <p className="font-medium mb-3">{q.question}</p>

                  {q.options.map((option, optIdx) => (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => {
                        const newAns = [...answers];
                        newAns[idx] = optIdx;
                        setAnswers(newAns);
                      }}
                      className={`w-full text-left px-4 py-2 rounded-lg border-2 mb-2 ${
                        answers[idx] === optIdx
                          ? "border-indigo-600 bg-indigo-50"
                          : "border-gray-300"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              ))}

              {loading && (
                <p className="text-sm text-gray-500">Loading questions…</p>
              )}
            </div>
          )}

          {/* BUTTONS */}
          <div className="mt-6 flex justify-between">
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                Back
              </Button>
            )}

            <Button onClick={handleNext} fullWidth={step === 1}>
              {step === 3 ? "Complete Signup" : "Next"}
            </Button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="text-indigo-600 font-medium">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
