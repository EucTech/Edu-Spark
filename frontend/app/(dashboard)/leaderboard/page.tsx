"use client";

import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Trophy, Crown, Star, Medal } from "lucide-react";
import Navbar from "@/components/Navbar";

interface LeaderboardUser {
  student_id: string;
  name: string;
  total_points: string | number;
  profile_image_url?: string;
  rank?: number;
}

interface BgCircle {
  width: number;
  height: number;
  top: string;
  left: string;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [bgCircles, setBgCircles] = useState<BgCircle[]>([]);

  // Fetch leaderboard data
  const fetchLeaderboard = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/points/leaderboard`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.ok) {
        const data = await res.json();
        const sorted = [...data].sort(
          (a, b) => Number(b.total_points) - Number(a.total_points)
        );
        setLeaderboard(sorted);
      }
    } catch (err) {
      console.error("Leaderboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();

    // Generate floating background circles
    const circles = Array.from({ length: 6 }).map(() => ({
      width: Math.random() * 80 + 40,
      height: Math.random() * 80 + 40,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
    }));
    setBgCircles(circles);
  }, []);

  // Add ranking
  const rankedUsers = useMemo(() => {
    return leaderboard.map((user, index) => ({
      ...user,
      rank: index + 1,
    }));
  }, [leaderboard]);

  // Filter by search
  const displayUsers = useMemo(() => {
    if (!search) return rankedUsers;
    return rankedUsers.filter((user) =>
      user.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [rankedUsers, search]);

  const getOrdinal = (n: number) => {
    if (n % 100 >= 11 && n % 100 <= 13) return `${n}th`;
    switch (n % 10) {
      case 1:
        return `${n}st`;
      case 2:
        return `${n}nd`;
      case 3:
        return `${n}rd`;
      default:
        return `${n}th`;
    }
  };

  const topThree = !search ? rankedUsers.slice(0, 3) : [];
  const restOfUsers = !search ? rankedUsers.slice(3) : displayUsers;

  const podiumOrder = useMemo(() => {
    if (topThree.length === 0) return [];
    return [topThree[1], topThree[0], topThree[2]].filter(Boolean);
  }, [topThree]);

  return (
    <div className="min-h-screen bg-[#f5f7ff] pb-24 font-sans overflow-hidden">
      {/* HERO SECTION */}
      <div className="relative pt-24 pb-44 bg-gradient-to-br from-[#1b2561] via-[#3749a9] to-[#5b2d8a] overflow-hidden rounded-b-[3rem] shadow-xl">
        <div className="absolute top-0 left-0 w-full z-20 backdrop-blur-md bg-white/5 border-b border-white/10">
          <Navbar />
        </div>

        {/* Floating circles */}
        {bgCircles.map((circle, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/10"
            style={{
              width: circle.width,
              height: circle.height,
              top: circle.top,
              left: circle.left,
            }}
            animate={{ y: [0, 20, 0], x: [0, -20, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}

        <div className="relative z-10 flex flex-col items-center justify-center text-white text-center px-6">
          <motion.div
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", bounce: 0.6, duration: 1 }}
            className="w-24 h-24 rounded-3xl bg-white/20 flex items-center justify-center backdrop-blur-lg border-4 border-white/30 shadow-2xl mb-6"
          >
            <Trophy size={48} className="text-white" />
          </motion.div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight">
            EduSpark <span className="text-[#c7ceef]">Champions</span>
          </h1>

          <p className="mt-4 text-white/90 text-lg sm:text-xl font-medium max-w-xl">
            Rise to the top, earn points, and become the ultimate learning champion!
          </p>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="relative -mt-10 flex justify-center px-6 z-20">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full max-w-2xl bg-white rounded-full shadow-lg p-3 border border-[#e4e6f0] flex items-center"
        >
          <div className="bg-[#eef1ff] p-3 rounded-full ml-1">
            <Search className="text-[#3749a9] w-6 h-6" />
          </div>
          <input
            type="text"
            placeholder="Search for a champion..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent px-4 py-2 text-lg text-gray-700 placeholder-gray-400 focus:outline-none font-semibold"
          />
        </motion.div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-8 border-[#eef1ff] border-t-[#3749a9] rounded-full animate-spin"></div>
            <p className="mt-6 text-[#3749a9] font-bold text-xl animate-pulse">
              Loading Champions...
            </p>
          </div>
        ) : displayUsers.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-lg p-16 text-center border border-[#e4e6f0]">
            <Search className="w-12 h-12 text-[#3749a9] mx-auto mb-4" />
            <h3 className="text-3xl font-bold text-[#5b2d8a]">No champion found!</h3>
            <p className="text-[#3749a9] mt-2 font-medium">
              Try searching for a different name.
            </p>
          </div>
        ) : (
          <>
            {/* PODIUM */}
            {!search && podiumOrder.length > 0 && (
              <div className="flex items-end justify-center gap-4 sm:gap-6 mb-20 pt-16">
                {podiumOrder.map((user, idx) => {
                  if (!user) return null;

                  const isFirst = user.rank === 1;
                  const isSecond = user.rank === 2;
                  const isThird = user.rank === 3;

                  const styles = isFirst
                    ? {
                        height: "h-60",
                        bg: "bg-gradient-to-t from-[#3749a9] to-[#5b2d8a]",
                        icon: (
                          <Crown className="w-12 h-12 mb-2 text-white drop-shadow-lg" />
                        ),
                        badge: "bg-[#1b2561]",
                      }
                    : isSecond
                    ? {
                        height: "h-48",
                        bg: "bg-gradient-to-t from-[#8b95d6] to-[#c7ceef]",
                        icon: (
                          <Medal className="w-10 h-10 mb-2 text-[#3749a9] drop-shadow" />
                        ),
                        badge: "bg-[#3749a9]",
                      }
                    : {
                        height: "h-40",
                        bg: "bg-gradient-to-t from-[#c7ceef] to-[#eef1ff]",
                        icon: (
                          <Medal className="w-10 h-10 mb-2 text-[#5b2d8a] drop-shadow" />
                        ),
                        badge: "bg-[#5b2d8a]",
                      };

                  return (
                    <motion.div
                      key={user.student_id}
                      initial={{ y: 100, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: idx * 0.15, type: "spring", bounce: 0.5 }}
                      className="relative flex flex-col items-center flex-1 max-w-[160px]"
                    >
                      {/* Champion Icon */}
                      <div className="absolute -top-20 flex flex-col items-center z-10">
                        {styles.icon}

                        {/* Avatar */}
                        <div className="relative">
                          {user.profile_image_url ? (
                            <img
                              src={user.profile_image_url}
                              alt={user.name}
                              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-xl"
                            />
                          ) : (
                            <div className="w-24 h-24 rounded-full bg-white text-[#3749a9] flex items-center justify-center font-black text-4xl border-4 shadow-xl">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                          )}

                          {/* Rank Badge */}
                          <div
                            className={`absolute -bottom-4 left-1/2 -translate-x-1/2 ${styles.badge} text-white w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-lg border-4 border-white`}
                          >
                            {user.rank}
                          </div>
                        </div>
                      </div>

                      {/* Podium Block */}
                      <div
                        className={`w-full ${styles.height} ${styles.bg} rounded-t-3xl rounded-b-xl flex flex-col items-center justify-end pb-6 text-center shadow-lg`}
                      >
                        <p className="font-bold text-white text-lg">
                          {user.name.split(" ")[0]}
                        </p>
                        <div className="flex items-center gap-1 mt-2 bg-white/20 px-4 py-1.5 rounded-full">
                          <Star className="w-4 h-4 text-white fill-white" />
                          <span className="font-bold text-white text-base">
                            {Number(user.total_points)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* LIST */}
            <div className="space-y-4">
              <AnimatePresence>
                {restOfUsers.map((user, index) => (
                  <motion.div
                    key={user.student_id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-2xl p-4 sm:p-5 flex items-center justify-between border border-[#e4e6f0] hover:border-[#3749a9] hover:shadow-lg transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#eef1ff] flex items-center justify-center font-bold text-[#3749a9]">
                        {getOrdinal(user.rank as number)}
                      </div>

                      {user.profile_image_url ? (
                        <img
                          src={user.profile_image_url}
                          alt={user.name}
                          className="w-12 h-12 rounded-full object-cover border border-[#e4e6f0]"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#3749a9] to-[#5b2d8a] text-white flex items-center justify-center font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}

                      <p className="font-semibold text-[#5b2d8a] text-lg">
                        {user.name}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 bg-[#f7f9ff] px-4 py-2 rounded-xl border border-[#e4e6f0]">
                      <Star className="w-5 h-5 text-[#3749a9]" />
                      <span className="font-bold text-[#3749a9] text-lg">
                        {Number(user.total_points)}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </div>
  );
}