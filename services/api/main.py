from __future__ import annotations

from datetime import datetime
from typing import Literal

import numpy as np
from fastapi import FastAPI
from pydantic import BaseModel, Field
from sklearn.ensemble import IsolationForest

app = FastAPI(title="AegisSOC Security API", version="0.1.0")


class SecurityEvent(BaseModel):
    id: str
    source: str
    actor: str
    action: str
    asset: str
    ip: str
    failed_logins: int = 0
    geo_velocity_km: int = 0
    bytes_out: int = 0
    privilege_delta: int = 0
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class IncidentRecommendation(BaseModel):
    severity: Literal["Critical", "High", "Medium", "Low"]
    risk_score: int
    mitre: str
    explanation: str
    playbook: list[str]


def score_event(event: SecurityEvent) -> IncidentRecommendation:
    features = np.array(
        [[event.failed_logins, event.geo_velocity_km, event.bytes_out / 1000000, event.privilege_delta]]
    )
    baseline = np.array(
        [
            [0, 0, 0.2, 0],
            [1, 50, 0.5, 0],
            [0, 0, 1.1, 0],
            [2, 120, 0.3, 1],
            [0, 0, 0.7, 0],
            [1, 20, 0.4, 0],
        ]
    )
    model = IsolationForest(contamination=0.2, random_state=42)
    model.fit(baseline)
    anomaly = abs(float(model.decision_function(features)[0]))
    risk_score = min(100, round(45 + anomaly * 170 + event.privilege_delta * 18))

    if event.geo_velocity_km > 1000 or event.privilege_delta > 0:
        mitre = "T1078 - Valid Accounts"
        playbook = ["Revoke sessions", "Force MFA reset", "Search cloud audit logs"]
    elif event.bytes_out > 50000000:
        mitre = "T1530 - Data from Cloud Storage"
        playbook = ["Disable service key", "Export object manifest", "Open privacy review"]
    else:
        mitre = "T1059 - Command and Scripting Interpreter"
        playbook = ["Quarantine workload", "Snapshot filesystem", "Verify image provenance"]

    severity = "Critical" if risk_score >= 90 else "High" if risk_score >= 75 else "Medium"
    return IncidentRecommendation(
        severity=severity,
        risk_score=risk_score,
        mitre=mitre,
        explanation=(
            f"{event.source} event for {event.actor} scored {risk_score}/100 due to "
            f"geo velocity {event.geo_velocity_km}km, {event.failed_logins} failed logins, "
            f"{event.bytes_out} bytes out, and privilege delta {event.privilege_delta}."
        ),
        playbook=playbook,
    )


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/score", response_model=IncidentRecommendation)
def score(event: SecurityEvent) -> IncidentRecommendation:
    return score_event(event)
