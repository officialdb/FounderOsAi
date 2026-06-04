from datetime import date, timedelta
from uuid import UUID

from sqlalchemy.orm import Session

from app.checkins.models import CheckIn
from app.checkins.schemas import CheckInCreateRequest
from app.workspaces.models import Workspace
from app.workspaces.services import get_workspace


def calculate_score(
    focus_level: int,
    completed_priorities: int,
    wins: str | None,
    blockers: str | None,
    mood: str | None,
) -> int:
    score = 40
    score += min(completed_priorities * 8, 32)
    score += focus_level * 5
    if wins:
        score += 10
    if blockers:
        score -= 8
    if mood:
        score += 5
    return max(0, min(score, 100))


def _get_check_in_for_date(db: Session, workspace_id: UUID, check_in_date: date) -> CheckIn | None:
    return (
        db.query(CheckIn)
        .filter(CheckIn.workspace_id == workspace_id, CheckIn.check_in_date == check_in_date)
        .first()
    )


def _build_check_in_query(db: Session, owner_id: UUID, workspace_id: UUID | None):
    query = db.query(CheckIn)
    if hasattr(query, "join"):
        query = query.join(Workspace, Workspace.id == CheckIn.workspace_id).filter(Workspace.owner_id == owner_id)

    if workspace_id is not None:
        get_workspace(db, workspace_id, owner_id)
        query = query.filter(CheckIn.workspace_id == workspace_id)

    return query


def _get_all_check_ins(db: Session, owner_id: UUID, workspace_id: UUID | None) -> list[CheckIn]:
    return _build_check_in_query(db, owner_id, workspace_id).order_by(CheckIn.check_in_date.asc()).all()


def create_check_in(db: Session, owner_id: UUID, payload: CheckInCreateRequest) -> CheckIn:
    get_workspace(db, payload.workspace_id, owner_id)
    check_in_date = payload.check_in_date or date.today()
    score = calculate_score(
        focus_level=payload.focus_level,
        completed_priorities=payload.completed_priorities,
        wins=payload.wins,
        blockers=payload.blockers,
        mood=payload.mood,
    )

    existing_check_in = _get_check_in_for_date(db, payload.workspace_id, check_in_date)
    extra_meta = {
        "completed_priorities": payload.completed_priorities,
        "focus_level": payload.focus_level,
        "next_priorities": payload.next_priorities,
    }
    wins = payload.wins or payload.completed_today

    if existing_check_in is not None:
        existing_check_in.mood = payload.mood
        existing_check_in.wins = wins
        existing_check_in.blockers = payload.blockers
        existing_check_in.score = score
        existing_check_in.extra_metadata = extra_meta
        db.commit()
        db.refresh(existing_check_in)
        return existing_check_in

    check_in = CheckIn(
        workspace_id=payload.workspace_id,
        check_in_date=check_in_date,
        mood=payload.mood,
        wins=wins,
        blockers=payload.blockers,
        score=score,
        extra_metadata=extra_meta,
    )
    db.add(check_in)
    db.commit()
    db.refresh(check_in)
    return check_in

def get_check_ins(db: Session, owner_id: UUID, workspace_id: UUID | None) -> list[CheckIn]:
    return list(reversed(_get_all_check_ins(db, owner_id, workspace_id)))


def _calculate_current_streak(check_ins: list[CheckIn]) -> int:
    if not check_ins:
        return 0

    ordered_dates = sorted({check_in.check_in_date for check_in in check_ins}, reverse=True)
    streak = 1
    expected_date = ordered_dates[0] - timedelta(days=1)

    for actual_date in ordered_dates[1:]:
        if actual_date == expected_date:
            streak += 1
            expected_date -= timedelta(days=1)
        elif actual_date < expected_date:
            break

    return streak


def _calculate_longest_streak(check_ins: list[CheckIn]) -> int:
    if not check_ins:
        return 0

    ordered_dates = sorted({check_in.check_in_date for check_in in check_ins})
    longest = 0
    current = 0
    previous_date = None

    for check_in_date in ordered_dates:
        if previous_date is None or check_in_date == previous_date + timedelta(days=1):
            current += 1
        else:
            current = 1
        longest = max(longest, current)
        previous_date = check_in_date

    return longest


def get_weekly_summary(db: Session, owner_id: UUID, workspace_id: UUID | None) -> dict[str, object]:
    today = date.today()
    period_start = today - timedelta(days=6)
    query = _build_check_in_query(db, owner_id, workspace_id)
    weekly_check_ins = query.filter(CheckIn.check_in_date >= period_start).order_by(CheckIn.check_in_date.asc()).all()
    all_check_ins = _get_all_check_ins(db, owner_id, workspace_id)

    if not weekly_check_ins:
        return {
            "workspace_id": workspace_id,
            "period_start": period_start,
            "period_end": today,
            "total_check_ins": 0,
            "average_score": 0.0,
            "current_streak": _calculate_current_streak(all_check_ins),
            "longest_streak": _calculate_longest_streak(all_check_ins),
            "best_score": 0,
            "missed_days": 7,
        }

    scores = [check_in.score for check_in in weekly_check_ins]
    active_dates = {check_in.check_in_date for check_in in weekly_check_ins}
    missed_days = sum(1 for offset in range(7) if today - timedelta(days=offset) not in active_dates)

    return {
        "workspace_id": workspace_id,
        "period_start": period_start,
        "period_end": today,
        "total_check_ins": len(weekly_check_ins),
        "average_score": round(sum(scores) / len(scores), 2),
        "current_streak": _calculate_current_streak(all_check_ins),
        "longest_streak": _calculate_longest_streak(all_check_ins),
        "best_score": max(scores),
        "missed_days": missed_days,
    }
