from datetime import date, datetime, timedelta, UTC
from uuid import UUID

from sqlalchemy.orm import Session

from app.ai.models import AIGeneration
from app.ai.schemas import AIContentRequest
from app.checkins.services import get_weekly_summary
from app.tasks.models import Task
from app.workspaces.services import get_workspace


def _collect_workspace_context(db: Session, workspace_id: UUID) -> dict[str, object]:
    tasks = db.query(Task).filter(Task.workspace_id == workspace_id).order_by(Task.created_at.desc()).limit(5).all()
    open_tasks = [task for task in tasks if task.status != "done"]
    overdue_tasks = [task for task in open_tasks if task.is_overdue]

    return {
        "recent_tasks": tasks,
        "open_tasks": open_tasks,
        "overdue_tasks": overdue_tasks,
    }


def _build_content_prompt(workspace_name: str, request: AIContentRequest, context: dict[str, object]) -> str:
    open_tasks = context["open_tasks"]
    task_titles = ", ".join(task.title for task in open_tasks[:3]) if open_tasks else "no active tasks"
    tone = request.tone or "clear and practical"
    return (
        f"Generate {request.content_type} ideas for {workspace_name} about {request.topic}. "
        f"Use a {tone} tone. Current focus: {task_titles}."
    )


def _build_content_response(request: AIContentRequest, context: dict[str, object]) -> str:
    open_tasks = context["open_tasks"]
    overdue_tasks = context["overdue_tasks"]
    ideas = [
        f"{request.topic}: share one practical founder lesson tied to execution.",
        f"{request.topic}: write a quick update that shows momentum and learning.",
        f"{request.topic}: turn a current task into a useful insight for your audience.",
    ]
    if overdue_tasks:
        ideas.append(f"{request.topic}: reflect on how you’re closing the gap on {overdue_tasks[0].title}.")
    if open_tasks:
        ideas.append(f"{request.topic}: connect the content to {open_tasks[0].title}.")
    return "\n".join(f"- {idea}" for idea in ideas[:4])


def create_content_generation(db: Session, owner_id: UUID, request: AIContentRequest) -> AIGeneration:
    workspace = get_workspace(db, request.workspace_id, owner_id)
    context = _collect_workspace_context(db, request.workspace_id)
    prompt = _build_content_prompt(workspace.name, request, context)
    response_text = _build_content_response(request, context)

    generation = AIGeneration(
        user_id=owner_id,
        workspace_id=request.workspace_id,
        generation_type="content",
        prompt=prompt,
        response_text=response_text,
        model_name="rule-based",
        extra_metadata={
            "content_type": request.content_type,
            "topic": request.topic,
            "tone": request.tone,
        },
    )
    db.add(generation)
    db.commit()
    db.refresh(generation)
    return generation


def create_accountability_feedback(db: Session, owner_id: UUID, workspace_id: UUID) -> dict[str, object]:
    workspace = get_workspace(db, workspace_id, owner_id)
    weekly_summary = get_weekly_summary(db, owner_id, workspace_id)
    context = _collect_workspace_context(db, workspace_id)

    strengths = []
    if weekly_summary["total_check_ins"]:
        strengths.append("You are showing up consistently with check-ins.")
    if weekly_summary["average_score"] >= 70:
        strengths.append("Your execution quality is trending well.")
    if not context["overdue_tasks"]:
        strengths.append("Your task list is under control.")

    improvements = []
    if weekly_summary["missed_days"]:
        improvements.append("Close the gaps on missed check-in days.")
    if context["overdue_tasks"]:
        improvements.append("Clear overdue tasks before adding new work.")

    next_actions = [
        "Pick your top 3 priorities for tomorrow.",
        "Submit a check-in before the day ends.",
    ]
    if context["overdue_tasks"]:
        next_actions.insert(0, f"Finish or re-scope {context['overdue_tasks'][0].title}.")

    summary = (
        f"{workspace.name}: {weekly_summary['total_check_ins']} check-ins this week, "
        f"average score {weekly_summary['average_score']}."
    )

    return {
        "workspace_id": workspace_id,
        "summary": summary,
        "strengths": strengths or ["Keep building consistent execution habits."],
        "improvements": improvements or ["Maintain the current execution rhythm."],
        "next_actions": next_actions,
        "generated_at": datetime.now(UTC),
    }


def create_weekly_ai_summary(db: Session, owner_id: UUID, workspace_id: UUID) -> dict[str, object]:
    workspace = get_workspace(db, workspace_id, owner_id)
    weekly_summary = get_weekly_summary(db, owner_id, workspace_id)
    context = _collect_workspace_context(db, workspace_id)
    today = date.today()
    period_start = today - timedelta(days=6)

    highlights = [
        f"{weekly_summary['total_check_ins']} check-ins completed",
        f"Best score reached {weekly_summary['best_score']}",
    ]
    if context["open_tasks"]:
        highlights.append(f"{len(context['open_tasks'])} active tasks in progress")

    risks = []
    if weekly_summary["missed_days"]:
        risks.append(f"{weekly_summary['missed_days']} missed days in the week")
    if context["overdue_tasks"]:
        risks.append(f"{len(context['overdue_tasks'])} overdue tasks need attention")

    next_week_focus = [
        "Protect the morning planning routine",
        "Finish the most important task first",
        "Keep check-ins consistent",
    ]

    summary = (
        f"{workspace.name} had {weekly_summary['total_check_ins']} check-ins with an average score of "
        f"{weekly_summary['average_score']}."
    )

    generation = AIGeneration(
        user_id=owner_id,
        workspace_id=workspace_id,
        generation_type="weekly_summary",
        prompt=f"Create a weekly summary for {workspace.name}",
        response_text=summary,
        model_name="rule-based",
        extra_metadata={
            "period_start": period_start.isoformat(),
            "period_end": today.isoformat(),
        },
    )
    db.add(generation)
    db.commit()
    db.refresh(generation)

    return {
        "workspace_id": workspace_id,
        "period_start": period_start,
        "period_end": today,
        "summary": summary,
        "highlights": highlights,
        "risks": risks or ["No major risks detected this week."],
        "next_week_focus": next_week_focus,
        "generated_at": datetime.now(UTC),
    }

def get_ai_history(db: Session, owner_id: UUID, workspace_id: UUID) -> list[AIGeneration]:
    get_workspace(db, workspace_id, owner_id)
    return (
        db.query(AIGeneration)
        .filter(AIGeneration.workspace_id == workspace_id)
        .order_by(AIGeneration.created_at.desc())
        .limit(20)
        .all()
    )

def get_ai_insights(db: Session, owner_id: UUID, workspace_id: UUID) -> list[dict[str, str]]:
    workspace = get_workspace(db, workspace_id, owner_id)
    weekly_summary = get_weekly_summary(db, owner_id, workspace_id)
    context = _collect_workspace_context(db, workspace_id)
    
    insights = []
    
    if context["overdue_tasks"]:
        insights.append({
            "category": "Execution",
            "insight": f"You have {len(context['overdue_tasks'])} overdue tasks.",
            "recommended_action": f"Focus on {context['overdue_tasks'][0].title} today.",
            "priority_level": "High"
        })
    elif context["open_tasks"]:
        insights.append({
            "category": "Execution",
            "insight": f"You have {len(context['open_tasks'])} open tasks.",
            "recommended_action": f"Complete {context['open_tasks'][0].title} next.",
            "priority_level": "Medium"
        })
        
    if weekly_summary["current_streak"] >= 3:
        insights.append({
            "category": "Accountability",
            "insight": f"Your accountability streak is {weekly_summary['current_streak']} days.",
            "recommended_action": "Complete a check-in today to maintain momentum.",
            "priority_level": "Medium"
        })
    elif weekly_summary["missed_days"] > 2:
        insights.append({
            "category": "Accountability",
            "insight": f"You missed {weekly_summary['missed_days']} check-ins this week.",
            "recommended_action": "Start a new streak today with a 2-minute check-in.",
            "priority_level": "High"
        })
        
    if weekly_summary["average_score"] < 40 and weekly_summary["total_check_ins"] > 0:
        insights.append({
            "category": "Workspace Health",
            "insight": "Your execution score has been low this week.",
            "recommended_action": "Identify blockers and re-scope your tasks.",
            "priority_level": "Medium"
        })
        
    if not insights:
        insights.append({
            "category": "Workspace Health",
            "insight": f"{workspace.name} is running smoothly.",
            "recommended_action": "Generate some content or review your next priorities.",
            "priority_level": "Low"
        })
        
    return insights

