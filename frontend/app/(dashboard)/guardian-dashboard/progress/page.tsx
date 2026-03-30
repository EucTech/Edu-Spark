"use client";

import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
} from "recharts";
import { 
  Award, 
  Clock, 
  TrendingUp, 
  Users, 
  GraduationCap, 
  ChevronDown,
  Activity,
  LineChart as LineChartIcon
} from "lucide-react";

export default function GuardianDashboardInsights() {
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const [weeklyPoints, setWeeklyPoints] = useState<any[]>([]);
  const [pointsHistory, setPointsHistory] = useState<any[]>([]);
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [totalTime, setTotalTime] = useState<number>(0);

  const [weeklyComparison, setWeeklyComparison] = useState<any[]>([]);
  const [combinedTotalPoints, setCombinedTotalPoints] = useState<number>(0);
  const [combinedTotalTime, setCombinedTotalTime] = useState<number>(0);

  const [loading, setLoading] = useState(true);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // colors
  const COLORS = ["#3749a9", "#5b2d8a", "#1b9e5a", "#f59e0b", "#ef4444"];

  const getStudentName = (student: any) =>
    student.name ||
    student.full_name ||
    student.student_name ||
    `Student-${student.student_id?.slice(0, 4)}`;

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

  // fetch students
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch(`${API_URL}/guardians/students/performance`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        setStudents(data || []);

        if (data.length > 0) {
          setSelectedStudent(data[0]);
        }
      } catch (error) {
        console.error("Error fetching students", error);
      }
    };

    fetchStudents();
  }, [API_URL, token]);

  // weekly comparison data
  useEffect(() => {
    const fetchComparisonData = async () => {
      if (!students.length) return;

      const weeklyMap: Record<string, any> = {};
      let totalPointsSum = 0;
      let totalTimeSum = 0;

      try {
        for (const student of students) {
          const [weeklyRes, timeRes] = await Promise.all([
            fetch(`${API_URL}/points/student/${student.student_id}/weekly`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`${API_URL}/sessions/child/${student.student_id}/total-time`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

          const weeklyData = await weeklyRes.json();
          const timeData = await timeRes.json();

          totalPointsSum += student.total_points || 0;
          totalTimeSum += timeData.total_seconds || 0;

          (weeklyData || []).forEach((week: any) => {
            if (!weeklyMap[week.week]) {
              weeklyMap[week.week] = { week: week.week };
            }

            weeklyMap[week.week][getStudentName(student)] = week.points;
          });
        }

        setWeeklyComparison(Object.values(weeklyMap));
        setCombinedTotalPoints(totalPointsSum);
        setCombinedTotalTime(totalTimeSum);
      } catch (error) {
        console.error("Error fetching comparison data", error);
      }
    };

    fetchComparisonData();
  }, [students, API_URL, token]);

  // fetch the data for the selected student when they change
  useEffect(() => {
    if (!selectedStudent) return;

    const fetchStudentData = async () => {
      setLoading(true);

      try {
        const [weeklyRes, historyRes, timeRes] = await Promise.all([
          fetch(`${API_URL}/points/student/${selectedStudent.student_id}/weekly`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/points/history`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/sessions/child/${selectedStudent.student_id}/total-time`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const weeklyData = await weeklyRes.json();
        const historyData = await historyRes.json();
        const timeData = await timeRes.json();

        setWeeklyPoints(weeklyData || []);

        // filter history for selected student and sort by date
        const filteredHistory = (historyData || [])
          .filter(
            (item: any) =>
              item.student_id === selectedStudent.student_id
          )
          .sort(
            (a: any, b: any) =>
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime()
          )
          .map((item: any) => ({
            ...item,
            points: Number(item.points),
            date: formatDate(item.created_at),
          }));

        setPointsHistory(filteredHistory);

        setTotalPoints(selectedStudent.total_points || 0);
        setTotalTime(timeData.total_seconds || 0);
      } catch (error) {
         console.error("Error fetching selected student data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [selectedStudent, API_URL, token]);

  // chart axis configuration
  const chartAxisProps = {
    axisLine: false,
    tickLine: false,
    tick: { fill: "#64748b", fontSize: 12 },
    dy: 10
  };

  if (loading && !selectedStudent) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#3749a9] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium animate-pulse">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* Header*/}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Guardian Dashboard</h1>
            <p className="text-slate-500 mt-1">Monitor learning progress and achievements for all students.</p>
          </div>
          <div className="flex items-center space-x-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-full shadow-sm font-medium text-sm">
            <Users className="w-4 h-4 text-[#3749a9]" />
            <span>{students.length} Student{students.length !== 1 && 's'} Monitored</span>
          </div>
        </header>

        {/* statistics */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center space-x-5 transition hover:-translate-y-1 duration-300">
            <div className="p-4 bg-indigo-50 text-[#3749a9] rounded-xl">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-slate-500 text-sm font-medium">Total Points (All)</h3>
              <p className="text-3xl font-bold text-slate-900 mt-1">
                {combinedTotalPoints.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center space-x-5 transition hover:-translate-y-1 duration-300">
            <div className="p-4 bg-emerald-50 text-[#1b9e5a] rounded-xl">
              <Clock className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-slate-500 text-sm font-medium">Total Learning Time</h3>
              <p className="text-3xl font-bold text-slate-900 mt-1">
                {formatTime(combinedTotalTime)}
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center space-x-5 transition hover:-translate-y-1 duration-300">
            <div className="p-4 bg-purple-50 text-[#5b2d8a] rounded-xl">
              <TrendingUp className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-slate-500 text-sm font-medium">Average Weekly Points</h3>
              <p className="text-3xl font-bold text-slate-900 mt-1">
                {Math.round(
                  weeklyComparison.reduce((sum, week) => {
                    const values = Object.values(week).filter(v => typeof v === 'number') as number[];
                    return sum + values.reduce((a, b) => a + (b || 0), 0);
                  }, 0) / (weeklyComparison.length || 1)
                ).toLocaleString()}
              </p>
            </div>
          </div>
        </section>

        {/* General comparisons */}
        <section className="grid lg:grid-cols-2 gap-6">

          {/* Student Total Points Comparison */}
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[#3749a9]" />
                Student Performance
              </h2>
              <p className="text-sm text-slate-500">Total points accumulated by each student</p>
            </div>
            <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={students} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey={(student: any) => getStudentName(student)} {...chartAxisProps} />
                  <YAxis {...chartAxisProps} dy={0} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="total_points" fill="#3749a9" radius={[6, 6, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weekly Grouped Histogram */}
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
             <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#5b2d8a]" />
                Weekly Leaderboard
              </h2>
              <p className="text-sm text-slate-500">Points distribution over the active weeks</p>
            </div>
            <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyComparison} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="week" {...chartAxisProps} />
                  <YAxis {...chartAxisProps} dy={0} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '13px' }} />
                  {students.map((student, index) => (
                    <Bar
                      key={student.student_id}
                      dataKey={getStudentName(student)}
                      fill={COLORS[index % COLORS.length]}
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <div className="border-t border-slate-200 my-8"></div>

        {/* Individual Student Insights */}
        <section className="space-y-6">
          
          {/* Section Header & Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-200 gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Individual Insights</h2>
              <p className="text-sm text-slate-500">Select a student to view their detailed timeline.</p>
            </div>
            
            <div className="relative min-w-[260px]">
              <select
                value={selectedStudent?.student_id || ""}
                onChange={(e) =>
                  setSelectedStudent(
                    students.find((s) => s.student_id === e.target.value)
                  )
                }
                className="w-full appearance-none p-3 pr-10 bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-xl outline-none focus:ring-2 focus:ring-[#3749a9] focus:border-[#3749a9] transition-all cursor-pointer"
              >
                {students.map((student) => (
                  <option key={student.student_id} value={student.student_id}>
                    {getStudentName(student)}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
            </div>
          </div>

          {loading ? (
             <div className="h-[400px] flex items-center justify-center bg-white rounded-2xl border border-slate-200 shadow-sm">
               <div className="w-8 h-8 border-4 border-[#3749a9] border-t-transparent rounded-full animate-spin"></div>
             </div>
          ) : (
            <>
              {/* Added Individual Summary Banner which uses totalPoints and totalTime state */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-[#3749a9] to-[#2c3a87] p-6 rounded-2xl shadow-sm text-white flex items-center justify-between">
                  <div>
                    <p className="text-indigo-200 text-sm font-medium mb-1">Student Total Points</p>
                    <p className="text-4xl font-bold">{totalPoints.toLocaleString()}</p>
                  </div>
                  <Award className="w-12 h-12 text-white/20" />
                </div>
                
                <div className="bg-gradient-to-br from-[#1b9e5a] to-[#147a45] p-6 rounded-2xl shadow-sm text-white flex items-center justify-between">
                  <div>
                    <p className="text-emerald-200 text-sm font-medium mb-1">Student Learning Time</p>
                    <p className="text-4xl font-bold">{formatTime(totalTime)}</p>
                  </div>
                  <Clock className="w-12 h-12 text-white/20" />
                </div>
              </div>

              {/* Individual Charts */}
              <div className="grid lg:grid-cols-2 gap-6">

                {/* Weekly Progress */}
                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
                  <div className="mb-6">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <LineChartIcon className="w-5 h-5 text-[#5b2d8a]" />
                      Weekly Progress
                    </h2>
                    <p className="text-sm text-slate-500">Points earned per week</p>
                  </div>
                  <div className="flex-1 min-h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={weeklyPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="week" {...chartAxisProps} />
                        <YAxis {...chartAxisProps} dy={0} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Line
                          type="monotone"
                          dataKey="points"
                          stroke="#5b2d8a"
                          strokeWidth={4}
                          dot={{ r: 5, fill: '#5b2d8a', stroke: '#fff', strokeWidth: 2 }}
                          activeDot={{ r: 7 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Points Over Time */}
                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
                  <div className="mb-6">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-[#3749a9]" />
                      Accumulation History
                    </h2>
                    <p className="text-sm text-slate-500">Points earned over time</p>
                  </div>
                  <div className="flex-1 min-h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={pointsHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3749a9" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#3749a9" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="date" {...chartAxisProps} minTickGap={30} />
                        <YAxis {...chartAxisProps} dy={0} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Area
                          type="monotone"
                          dataKey="points"
                          stroke="#3749a9"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#colorPoints)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </>
          )}
        </section>

      </div>
    </div>
  );
}