"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LuFileCheck,
  LuStar,
  LuTarget,
  LuFlame,
  LuBookOpen,
  LuTrophy,
} from "react-icons/lu";

export default function StudentDashboardPage() {
  const router = useRouter();

  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  const [userName, setUserName] = useState("Student");
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const [progress, setProgress] = useState<any>(null);
  const [pointsTotal, setPointsTotal] = useState(0);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [leaderboardRank, setLeaderboardRank] = useState<number | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const role = user?.role;
        const studentId = user?.sub || user?.id;

        if (!token || role !== "student") {
          router.replace("/login");
          return;
        }

        setAuthorized(true);

        const name =
          user?.full_name?.split(" ")[0] ||
          user?.profile?.firstName ||
          user?.email ||
          "Student";

        setUserName(name);

        const avatar =
          user?.profile_picture ||
          user?.avatar ||
          user?.image ||
          user?.profile?.avatar ||
          user?.profile?.profile_picture ||
          null;

        setProfileImage(avatar);

        const [progressRes, pointsRes, enrollmentsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/progress`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/points/total`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/courses/student/${studentId}/enrollments`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
        ]);

        if (progressRes.ok) {
          const data = await progressRes.json();
          setProgress(data);
        }

        if (pointsRes.ok) {
          const data = await pointsRes.json();
          setPointsTotal(data?.total_points || 0);
        }

        if (enrollmentsRes.ok) {
          const data = await enrollmentsRes.json();
          setEnrollments(data || []);
        }

        setLeaderboardRank(12); 

      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // spinner loading state
  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#3749a9] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-[#7b82a8] text-sm">
          Loading your dashboard...
        </p>
      </div>
    );
  }

  if (!authorized) return null;

  const completedLessons = progress?.completed_lessons?.length || 0;
  const quizAttempts = progress?.quiz_attempts || [];

  const quizAverage =
    quizAttempts.length > 0
      ? Math.round(
          quizAttempts.reduce((sum: number, q: any) => sum + q.score, 0) /
            quizAttempts.length
        )
      : 0;

  // Leaderboard progress for the student
  const progressToNextRank = Math.min((pointsTotal % 100), 100);

  return (
    <div className="py-6 space-y-6">

      {/* The hero section */}
      <div className="relative bg-gradient-to-r from-[#3749a9] to-[#5b2d8a] rounded-3xl p-8 text-white shadow-xl overflow-hidden">

        <div className="flex items-center gap-6 relative z-10">

          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse blur-md"></div>

            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-2xl animate-float"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-yellow-400 flex items-center justify-center text-3xl font-bold shadow-2xl animate-float">
                {userName.charAt(0)}
              </div>
            )}
          </div>

          <div>
            <h1 className="text-3xl font-bold">
              Hi {userName}! 👋
            </h1>
            <p className="text-white/80 mt-2">
              Keep learning and reach the top!
            </p>
          </div>
        </div>
      </div>

      {/* stats section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard icon={<LuStar />} label="Total Points" value={pointsTotal} color="text-[#3749a9]" />
        <StatCard icon={<LuFileCheck />} label="Lessons Completed" value={completedLessons} color="text-[#1b2561]" />
        <StatCard icon={<LuTarget />} label="Quiz Average" value={`${quizAverage}%`} color="text-[#1b9e5a]" />
        <StatCard icon={<LuBookOpen />} label="Enrolled Courses" value={enrollments.length} color="text-[#5b2d8a]" />
      </div>

      {/* Leaderboard including progress bar */}
      <div className="bg-white rounded-2xl border border-[#e4e6f0] shadow-sm p-6">

        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-[15px] font-bold text-[#0f1535]">
              Leaderboard Position
            </h2>
            <p className="text-sm text-[#7b82a8] mt-1">
              Keep earning to climb higher!
            </p>
          </div>

          <div className="flex items-center gap-3 text-[#5b2d8a]">
            <LuTrophy size={22} />
            <span className="text-2xl font-bold">
              #{leaderboardRank ?? "--"}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full h-3 bg-[#f0f1f7] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#3749a9] to-[#8b5cf6] transition-all duration-1000"
              style={{ width: `${progressToNextRank}%` }}
            />
          </div>
          <p className="text-xs text-[#7b82a8] mt-2">
            {100 - progressToNextRank} points to next rank
          </p>
        </div>
      </div>

      {/* Quiz performance section */}
      <div className="bg-white rounded-2xl border border-[#e4e6f0] shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-bold text-[#0f1535]">
            Recent Quiz Attempts
          </h2>

          {quizAverage >= 85 && (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-[#1b9e5a]">
              <LuFlame size={14} />
              Great Performance!
            </span>
          )}
        </div>

        {quizAttempts.length === 0 ? (
          <p className="text-sm text-[#7b82a8]">
            You haven’t taken any quizzes yet.
          </p>
        ) : (
          <ul className="space-y-3">
            {quizAttempts
              .sort(
                (a: any, b: any) =>
                  new Date(b.attempted_at).getTime() -
                  new Date(a.attempted_at).getTime()
              )
              .slice(0, 5)
              .map((q: any) => (
                <li
                  key={q.attempt_id}
                  className="flex items-center justify-between text-sm border-b border-[#f0f1f7] pb-2"
                >
                  <span className="text-[#7b82a8]">
                    {new Date(q.attempted_at).toLocaleDateString()}
                  </span>
                  <span
                    className={`font-semibold ${
                      q.score >= 85
                        ? "text-[#1b9e5a]"
                        : q.score >= 70
                        ? "text-[#b7791f]"
                        : "text-[#c0392b]"
                    }`}
                  >
                    {q.score}%
                  </span>
                </li>
              ))}
          </ul>
        )}
      </div>

    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: any;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-[#e4e6f0] shadow-sm hover:shadow-lg transition-all duration-300">
      <div className={`flex items-center gap-2 mb-2 ${color}`}>
        {icon}
        <p className="text-[12px] text-[#7b82a8]">{label}</p>
      </div>
      <p className={`text-[28px] font-bold ${color}`}>
        {value}
      </p>
    </div>
  );
}