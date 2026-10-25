import { useEffect } from "react";
import { X } from "lucide-react";

import type { RosterLearner } from "./admissionsEnrollment.data";

interface LearnerDrawerProps {
  learner: RosterLearner | null;
  onClose: () => void;
}

export function LearnerDrawer({ learner, onClose }: LearnerDrawerProps) {
  useEffect(() => {
    if (!learner) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [learner, onClose]);

  if (!learner) {
    return null;
  }

  return (
    <>
      <div className="ae-scrim" onClick={onClose} aria-hidden="true" />

      <aside
        className="ae-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ae-drawer-title"
      >
        <div className="ae-drawer__head">
          <div>
            <p className="ae-drawer__eyebrow">Learner record</p>
            <h2 className="ae-drawer__title" id="ae-drawer-title">
              {learner.name}
            </h2>
            <p className="ae-drawer__meta">
              {learner.id} · {learner.schoolName} · {learner.classLabel} · Stream{" "}
              {learner.stream}
            </p>
          </div>

          <button
            type="button"
            className="ae-drawer__close"
            onClick={onClose}
            aria-label="Close learner record"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        <h3 className="ae-drawer__section">Enrolment</h3>
        <dl className="ae-kv">
          <dt>Status</dt>
          <dd>
            <span
              className={`ae-pill ae-pill--${
                learner.status === "New" ? "positive" : "neutral"
              }`}
            >
              {learner.status}
            </span>
          </dd>
          <dt>Gender</dt>
          <dd>{learner.gender}</dd>
          <dt>Age</dt>
          <dd>{learner.age}</dd>
          <dt>Attendance mode</dt>
          <dd>{learner.mode}</dd>
          <dt>Enrolled from</dt>
          <dd>{learner.enrolled}</dd>
        </dl>

        <h3 className="ae-drawer__section">Admission path</h3>
        {learner.applied && learner.admitted ? (
          <dl className="ae-kv">
            <dt>Applied</dt>
            <dd>{learner.applied}</dd>
            <dt>Admitted</dt>
            <dd>{learner.admitted}</dd>
            <dt>Reported</dt>
            <dd>{learner.enrolled}</dd>
          </dl>
        ) : (
          <p className="ae-drawer__note">
            Continuing learner — joined before the current admission cycle, so no
            application stages are recorded for this year.
          </p>
        )}

        <p className="ae-drawer__foot">
          Learner-level details are limited to authorised staff. Learner records
          are not reported by the API yet.
        </p>
      </aside>
    </>
  );
}
