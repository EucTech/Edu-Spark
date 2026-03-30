"use client";

import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { LuAlarmClock } from "react-icons/lu";

export default function StudentQuizPage() {
  const { quizId } = useParams();
  const router = useRouter();

  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAnswers, setSelectedAnswers] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [previousBestScore, setPreviousBestScore] = useState<number | null>(null);

  // Fetch quiz and previous attempts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        // Fetch quiz details
        const quizRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/quizzes/${quizId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!quizRes.ok) throw new Error();
        const quizData = await quizRes.json();
        setQuiz(quizData);

        if (quizData.is_timed) {
          setTimeLeft(quizData.time_limit_seconds);
        }

        // Fetch progress to get previous best score
        const progressRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/progress`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (progressRes.ok) {
          const progressData = await progressRes.json();
          const attempts =
            progressData?.quiz_attempts?.filter(
              (a: any) => a.quiz_id === quizData.quiz_id
            ) || [];

          if (attempts.length > 0) {
            const best = Math.max(...attempts.map((a: any) => Number(a.score)));
            setPreviousBestScore(best);
          }
        }
      } catch (error) {
        toast.error("Failed to load quiz");
        router.back();
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [quizId, router]);

  // Timer logic
  useEffect(() => {
    if (!quiz?.is_timed || timeLeft === null || quizCompleted) return;

    if (timeLeft <= 0) {
      handleSubmit(true);
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((prev) => (prev ? prev - 1 : 0));
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, quizCompleted, quiz]);

  // Select answer
  const selectAnswer = (questionId: string, optionId: string) => {
    if (quizCompleted) return;

    setSelectedAnswers((prev: any) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  // Submit quiz
  const handleSubmit = async (autoSubmit = false) => {
    if (!quiz || quizCompleted) return;

    if (!autoSubmit) {
      const unanswered = quiz.questions.some(
        (q: any) => !selectedAnswers[q.question_id]
      );

      if (unanswered) {
        toast.error("Please answer all questions");
        return;
      }
    }

    setSubmitting(true);

    try {
      let calculatedScore = 0;

      quiz.questions.forEach((q: any) => {
        const selectedOptionId = selectedAnswers[q.question_id];
        const correctOption = q.options.find((opt: any) => opt.is_correct);

        if (selectedOptionId === correctOption?.option_id) {
          calculatedScore += Number(q.points);
        }
      });

      const token = localStorage.getItem("token");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/progress/quiz`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            quiz_id: quiz.quiz_id,
            score: calculatedScore,
          }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Quiz submit error:", errorData);
        throw new Error();
      }

      setScore(calculatedScore);
      setQuizCompleted(true);

      // 🎉 Confetti logic
      if (
        previousBestScore === null ||
        calculatedScore > previousBestScore
      ) {
        confetti({ particleCount: 200, spread: 130, origin: { y: 0.6 } });
        toast.success("🔥 New Best Score! You beat your previous record!");
      } else {
        confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 } });
        toast.success("Quiz submitted successfully!");
      }
    } catch (err) {
      toast.error("Failed to submit quiz");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <div className="w-12 h-12 border-4 border-[#3749a9] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];
  const totalQuestions = quiz.questions.length;

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#3749a9] to-[#5b2d8a] text-white rounded-3xl p-8 shadow-xl">
        <h1 className="text-2xl font-bold">Quiz Time 🎮</h1>
        <p className="opacity-80 mt-1">Total Points: {quiz.total_points}</p>

        {quiz.is_timed && (
          <div className="mt-4 flex items-center gap-2 bg-white/20 px-4 py-2 rounded-xl w-fit">
            <LuAlarmClock />
            <span className="font-semibold">{timeLeft}s remaining</span>
          </div>
        )}
      </div>

      {!quizCompleted && (
        <div className="bg-white rounded-2xl p-6 border border-[#e4e6f0] shadow-sm space-y-6">
          {/* Progress */}
          <div className="flex justify-between items-center">
            <p className="text-sm font-semibold text-[#7b82a8]">
              Question {currentQuestion + 1} of {totalQuestions}
            </p>
            <div className="h-2 w-32 bg-[#eef1ff] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#3749a9]"
                style={{
                  width: `${((currentQuestion + 1) / totalQuestions) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Question */}
          <h2 className="font-bold text-xl text-[#0f1535]">
            {question.question_text}
          </h2>

          {/* Options */}
          <div className="space-y-3">
            {question.options.map((opt: any) => {
              const selected =
                selectedAnswers[question.question_id] === opt.option_id;

              return (
                <button
                  key={opt.option_id}
                  onClick={() =>
                    selectAnswer(question.question_id, opt.option_id)
                  }
                  className={`w-full text-left px-4 py-3 rounded-xl border ${
                    selected
                      ? "border-[#3749a9] bg-[#eef1ff]"
                      : "border-[#e4e6f0] hover:border-[#3749a9]"
                  }`}
                >
                  {opt.option_text}
                </button>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            <button
              disabled={currentQuestion === 0}
              onClick={() => setCurrentQuestion((prev) => prev - 1)}
              className="px-4 py-2 rounded-xl border border-[#e4e6f0] disabled:opacity-40"
            >
              Previous
            </button>

            {currentQuestion < totalQuestions - 1 ? (
              <button
                onClick={() => {
                  if (!selectedAnswers[question.question_id]) {
                    toast.error("Select an answer first");
                    return;
                  }
                  setCurrentQuestion((prev) => prev + 1);
                }}
                className="px-6 py-2 bg-[#3749a9] text-white rounded-xl"
              >
                Next
              </button>
            ) : (
              <button
                onClick={() => handleSubmit()}
                disabled={submitting}
                className="px-6 py-2 bg-[#5b2d8a] text-white rounded-xl"
              >
                {submitting ? "Submitting..." : "Finish Quiz"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Result Modal */}
      {quizCompleted && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-10 w-[420px] text-center shadow-2xl">
            <div className="text-5xl mb-4">🏆</div>
            <h2 className="text-2xl font-bold text-[#0f1535]">Great Job!</h2>

            <div className="mt-4 text-4xl font-extrabold text-[#3749a9]">
              {score} / {quiz.total_points}
            </div>

            <p className="mt-2 text-sm text-[#7b82a8]">
              {Math.round((score! / quiz.total_points) * 100)}% Score
            </p>

            <div className="mt-4 text-3xl">
              {(() => {
                const percent = (score! / quiz.total_points) * 100;
                if (percent >= 90) return "⭐⭐⭐";
                if (percent >= 60) return "⭐⭐";
                return "⭐";
              })()}
            </div>

            <button
              onClick={() => router.back()}
              className="mt-6 px-6 py-3 bg-[#3749a9] text-white rounded-xl font-semibold hover:opacity-90 transition"
            >
              Back to Course
            </button>
          </div>
        </div>
      )}
    </div>
  );
}