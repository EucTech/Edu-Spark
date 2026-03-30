"use client";

import React, {useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSearchParams } from "next/navigation";
import {
  faPlus,
  faTrash,
  faCircleCheck,
  faCircle,
  faCircleQuestion,
  faStar,
  faClock,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";

type Option = {
  option_text: string;
  is_correct: boolean;
};

type Question = {
  question_text: string;
  points: number;
  options: Option[];
};

export default function CreateQuizPage() {
  const params = useParams();
  const router = useRouter();

  const lessonId = params?.lessonId as string;

  // Edit mode state

  const searchParams = useSearchParams();
  const editMode = searchParams.get("edit") === "true";
  const quizId = searchParams.get("quizId");
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [questions, setQuestions] = useState<Question[]>([
    {
      question_text: "",
      points: 10,
      options: [
        { option_text: "", is_correct: false },
        { option_text: "", is_correct: false },
      ],
    },
  ]);

  const [isTimed, setIsTimed] = useState(false);
  const [quizTimer, setQuizTimer] = useState<number>(60);
  const [uploading, setUploading] = useState(false);

  const totalPoints = questions.reduce(
    (sum, q) => sum + Number(q.points || 0),
    0
  );

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        question_text: "",
        points: 10,
        options: [
          { option_text: "", is_correct: false },
          { option_text: "", is_correct: false },
        ],
      },
    ]);
  };

  const deleteQuestion = (index: number) => {
    if (questions.length === 1) {
      toast.error("Quiz must have at least one question");
      return;
    }
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const addOption = (qIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex && q.options.length < 4
          ? {
              ...q,
              options: [
                ...q.options,
                { option_text: "", is_correct: false },
              ],
            }
          : q
      )
    );
  };

  const deleteOption = (qIndex: number, oIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex && q.options.length > 2
          ? {
              ...q,
              options: q.options.filter((_, oi) => oi !== oIndex),
            }
          : q
      )
    );
  };

  const setCorrectOption = (qIndex: number, oIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex
          ? {
              ...q,
              options: q.options.map((opt, oi) => ({
                ...opt,
                is_correct: oi === oIndex,
              })),
            }
          : q
      )
    );
  };

useEffect(() => {
  const fetchQuizForEdit = async () => {
    if (!editMode || !quizId) return;

    try {
      setLoadingQuiz(true);

      const token = localStorage.getItem("token");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/quizzes/${quizId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error();

      const data = await res.json();

      setQuestions(
        data.questions.map((q: any) => ({
          question_text: q.question_text,
          points: Number(q.points),
          options: q.options.map((o: any) => ({
            option_text: o.option_text,
            is_correct: o.is_correct,
          })),
        }))
      );

      setIsTimed(data.is_timed);
      setQuizTimer(data.time_limit_seconds);

    } catch {
      toast.error("Failed to load quiz for editing");
    } finally {
      setLoadingQuiz(false);
    }
  };

  fetchQuizForEdit();
}, [editMode, quizId]);

  const handleSubmit = async () => {
    if (uploading) return;

    if (questions.length === 0) {
      toast.error("Quiz must contain at least one question");
      return;
    }

    for (const q of questions) {
      if (!q.question_text.trim()) {
        toast.error("All questions must have text");
        return;
      }

      if (!q.options.some((opt) => opt.is_correct)) {
        toast.error("Each question must have one correct answer selected");
        return;
      }

      if (!q.points || q.points <= 0) {
        toast.error("Each question must have valid points");
        return;
      }
    }

    if (isTimed && (!quizTimer || quizTimer <= 0)) {
      toast.error("Please set a valid quiz timer");
      return;
    }

    const payload = {
      lesson_id: lessonId,
      total_points: totalPoints,
      is_timed: isTimed,
      time_limit_seconds: isTimed ? quizTimer : 1,
      questions,
    };

    setUploading(true);

    try {
      const token = localStorage.getItem("token");

      const url = editMode
  ? `${process.env.NEXT_PUBLIC_API_URL}/quizzes/${quizId}`
  : `${process.env.NEXT_PUBLIC_API_URL}/quizzes`;

      const method = editMode ? "PATCH" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to save quiz");
      }

      toast.success(
        editMode
          ? "Quiz updated successfully"
          : "Quiz created successfully"
      );

      // Redirecting to lessons page after save
      router.push("/admin-dashboard/lessons");

    } catch (err: any) {
      toast.error(err.message || "Error saving quiz");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteQuiz = async () => {
  if (!editMode || !quizId) return;

  const confirmDelete = window.confirm(
    "Are you sure you want to delete this quiz? This action cannot be undone."
  );

  if (!confirmDelete) return;

  try {
    setDeleting(true);

    const token = localStorage.getItem("token");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/quizzes/${quizId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) throw new Error();

    toast.success("Quiz deleted successfully");

    router.push("/admin-dashboard/lessons");

  } catch {
    toast.error("Failed to delete quiz");
  } finally {
    setDeleting(false);
  }
};

  return (
  <div className="max-w-4xl mx-auto p-8 space-y-8">
    
    {/* Header */}
    <div className="space-y-3">
      <h1 className="text-2xl font-bold text-[#0f1535]">
        {editMode ? "Edit Quiz" : "Create Quiz"}
      </h1>

      {editMode && loadingQuiz && (
        <div className="flex items-center gap-3 bg-[#f4f6ff] px-4 py-3 rounded-xl w-fit">
          <FontAwesomeIcon
            icon={faSpinner}
            spin
            className="text-[#3749a9]"
          />
          <span className="text-sm font-medium text-[#3749a9]">
            Preparing quiz for editing...
          </span>
        </div>
      )}
    </div>

    {/* Stopping everything else while loading */}
    {editMode && loadingQuiz ? null : (
      <>
        {/* Controls */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 bg-[#f4f6ff] px-4 py-2 rounded-xl">
            <FontAwesomeIcon icon={faStar} className="text-[#3749a9]" />
            <span className="font-semibold">
              Total Points: {totalPoints}
            </span>
          </div>

          <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={isTimed}
              onChange={(e) => setIsTimed(e.target.checked)}
              className="accent-[#3749a9]"
            />
            Timed Quiz (Game Mode)
          </label>

          {isTimed && (
            <div className="flex items-center gap-2 bg-[#fff4e6] px-4 py-2 rounded-xl">
              <FontAwesomeIcon icon={faClock} className="text-orange-500" />
              <input
                type="number"
                min={10}
                className="w-20 border border-[#e4e6f0] rounded px-2 py-1"
                value={quizTimer}
                onChange={(e) =>
                  setQuizTimer(Number(e.target.value))
                }
              />
              <span className="text-sm">sec</span>
            </div>
          )}
        </div>

        {/* Questions */}
        {questions.map((q, qIndex) => (
          <div
            key={qIndex}
            className="bg-white border border-[#e4e6f0] rounded-2xl p-6 space-y-6 shadow-sm"
          >
          <div className="flex justify-between items-center">
            <h2 className="font-semibold">
              Question {qIndex + 1}
            </h2>

            <Button
              variant="destructive"
              size="sm"
              disabled={questions.length === 1}
              onClick={() => deleteQuestion(qIndex)}
            >
              <FontAwesomeIcon icon={faTrash} />
              Delete
            </Button>
          </div>

          <input
            className="w-full border border-[#e4e6f0] rounded-lg px-4 py-2"
            placeholder="Enter question text"
            value={q.question_text}
            onChange={(e) =>
              setQuestions((prev) =>
                prev.map((item, i) =>
                  i === qIndex
                    ? { ...item, question_text: e.target.value }
                    : item
                )
              )
            }
          />

          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faStar} />
            <input
              type="number"
              min={1}
              className="w-24 border border-[#e4e6f0] rounded-lg px-3 py-1"
              value={q.points}
              onChange={(e) =>
                setQuestions((prev) =>
                  prev.map((item, i) =>
                    i === qIndex
                      ? {
                          ...item,
                          points: Number(e.target.value),
                        }
                      : item
                  )
                )
              }
            />
            <span className="text-sm text-[#7b82a8]">
              points
            </span>
          </div>

          <div className="space-y-3">
            {q.options.map((opt, oIndex) => (
              <div key={oIndex} className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setCorrectOption(qIndex, oIndex)
                  }
                >
                  {opt.is_correct ? (
                    <FontAwesomeIcon
                      icon={faCircleCheck}
                      className="text-green-600"
                    />
                  ) : (
                    <FontAwesomeIcon icon={faCircle} />
                  )}
                </button>

                <input
                  className="flex-1 border border-[#e4e6f0] rounded-lg px-4 py-2"
                  placeholder={`Option ${oIndex + 1}`}
                  value={opt.option_text}
                  onChange={(e) =>
                    setQuestions((prev) =>
                      prev.map((item, i) =>
                        i === qIndex
                          ? {
                              ...item,
                              options: item.options.map(
                                (option, oi) =>
                                  oi === oIndex
                                    ? {
                                        ...option,
                                        option_text:
                                          e.target.value,
                                      }
                                    : option
                              ),
                            }
                          : item
                      )
                    )
                  }
                />

                {q.options.length > 2 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      deleteOption(qIndex, oIndex)
                    }
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {q.options.length < 4 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => addOption(qIndex)}
            >
              <FontAwesomeIcon icon={faPlus} />
              Add Option
            </Button>
          )}
        </div>
      ))}

      <div className="flex justify-between items-center">
  
        <Button variant="outline" onClick={addQuestion}>
          <FontAwesomeIcon icon={faPlus} />
          Add Question
        </Button>

        <div className="flex gap-3">
          
          {editMode && (
            <Button
              variant="destructive"
              disabled={deleting}
              onClick={handleDeleteQuiz}
            >
              {deleting ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin />
                  Deleting...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faTrash} />
                  Delete Quiz
                </>
              )}
            </Button>
          )}

          <Button
            disabled={uploading}
            className="bg-[#3749a9] text-white gap-2"
            onClick={handleSubmit}
          >
            {uploading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin />
                Saving...
              </>
            ) : (
              editMode ? "Update Quiz" : "Save Quiz"
            )}
          </Button>

        </div>
      </div>
      </>
      )}
    </div>
  );
}