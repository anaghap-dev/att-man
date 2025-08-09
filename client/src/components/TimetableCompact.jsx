import React, { useState, useMemo } from "react";
import "./TimetableCompact.css";

export default function TimetableCompact() {
  const WEEKS = 13;
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const periodNumbers = [1, 2, 3, 4, 5];
  const requiredPercent = 75;

  // Fixed subject layout
  const fixedLayout = [
    ["D", "C", "E", "B", "E"], // Mon
    ["B", "E", "D", "B", "D"], // Tue
    ["C", "C", "B", "E", "C"], // Wed
    ["A", "A", "D", "E", "D"], // Thu
    ["A", "E", "A", "C", "C"], // Fri
  ];

  // Repeat for all weeks
  const fixedSubjects = useMemo(() => {
    return Array.from({ length: WEEKS }, () => fixedLayout);
  }, []);

  // attendance[week][day][period] = 0 (present) | 1 (ignored) | 2 (absent)
  const [attendance, setAttendance] = useState(
    Array.from({ length: WEEKS }, () =>
      Array.from({ length: 5 }, () => Array.from({ length: 5 }, () => 0))
    )
  );

  const [currentWeek, setCurrentWeek] = useState(0);

  // Toggle between P → Ignored → A
  const toggleCell = (weekIdx, dayIdx, periodIdx) => {
    setAttendance((prev) => {
      const copy = prev.map((w) => w.map((d) => [...d]));
      copy[weekIdx][dayIdx][periodIdx] =
        (copy[weekIdx][dayIdx][periodIdx] + 1) % 3;
      return copy;
    });
  };

  // Clear current week
  const clearWeek = (weekIdx) => {
    setAttendance((prev) => {
      const copy = prev.map((w) => w.map((d) => [...d]));
      copy[weekIdx] = Array.from({ length: 5 }, () =>
        Array.from({ length: 5 }, () => 0)
      );
      return copy;
    });
  };

  // Aggregate across all weeks
  const aggregate = useMemo(() => {
    const stats = {};
    const subjects = ["A", "B", "C", "D", "E"];
    subjects.forEach((s) => (stats[s] = { counted: 0, present: 0, absent: 0 }));

    attendance.forEach((weekArr, wIdx) =>
      weekArr.forEach((dayArr, dIdx) =>
        dayArr.forEach((status, pIdx) => {
          const subj = fixedSubjects[wIdx][dIdx][pIdx];
          if (status !== 1) {
            stats[subj].counted += 1;
            if (status === 0) stats[subj].present += 1;
            if (status === 2) stats[subj].absent += 1;
          }
        })
      )
    );

    const results = {};
    subjects.forEach((s) => {
      const { counted, present } = stats[s];
      const percent = counted ? (present / counted) * 100 : 100;
      const maxSkipFloat = counted
        ? (present * 100) / requiredPercent - counted
        : Infinity;
      const canSkip = counted ? Math.max(0, Math.floor(maxSkipFloat)) : 0;

      results[s] = {
        counted,
        present,
        percent: percent.toFixed(2),
        canSkip,
      };
    });

    return results;
  }, [attendance, fixedSubjects]);

  const statusClass = (s) =>
    s === 0 ? "present" : s === 1 ? "ignored" : "absent";

  return (
    <div className="compact-root">
      {/* Left Panel: Week Editor */}
      <div className="week-editor">
        <h1>Compact 3-Month Attendance</h1>
        <div className="controls">
          <button
            onClick={() => setCurrentWeek((w) => Math.max(0, w - 1))}
            className="btn"
          >
            ◀ Prev
          </button>
          <select
            value={currentWeek}
            onChange={(e) => setCurrentWeek(Number(e.target.value))}
            className="week-select"
          >
            {Array.from({ length: WEEKS }, (_, i) => (
              <option key={i} value={i}>
                Week {i + 1}
              </option>
            ))}
          </select>
          <button
            onClick={() => setCurrentWeek((w) => Math.min(WEEKS - 1, w + 1))}
            className="btn"
          >
            Next ▶
          </button>
          <button
            onClick={() => clearWeek(currentWeek)}
            className="btn danger"
          >
            Clear Week
          </button>
        </div>

        <table className="square-table">
          <thead>
            <tr>
              <th>Day</th>
              {periodNumbers.map((n) => (
                <th key={n}>{n}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map((day, dIdx) => (
              <tr key={day}>
                <td className="daycol">{day}</td>
                {periodNumbers.map((_, pIdx) => {
                  const status = attendance[currentWeek][dIdx][pIdx];
                  const subj = fixedSubjects[currentWeek][dIdx][pIdx];
                  return (
                    <td
                      key={pIdx}
                      className={`cell ${statusClass(status)}`}
                      onClick={() => toggleCell(currentWeek, dIdx, pIdx)}
                      title={`Subject ${subj} — click to change status`}
                    >
                      {subj}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Right Panel: Aggregate Results */}
      <div className="aggregate-panel">
        <h3>Aggregate Results ({WEEKS} weeks)</h3>
        <table className="stats-table">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Counted</th>
              <th>Present</th>
              <th>%</th>
              <th>Can Skip</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(aggregate).map((s) => (
              <tr key={s}>
                <td>{s}</td>
                <td>{aggregate[s].counted}</td>
                <td>{aggregate[s].present}</td>
                <td>{aggregate[s].percent}%</td>
                <td>{aggregate[s].canSkip}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="legend">
          <span className="legend-item">
            <span className="legend-box present"></span> Present
          </span>
          <span className="legend-item">
            <span className="legend-box ignored"></span> Ignored
          </span>
          <span className="legend-item">
            <span className="legend-box absent"></span> Absent
          </span>
        </div>
      </div>
    </div>
  );
}
