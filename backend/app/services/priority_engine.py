def calculate_priority_score(
    resource_type: str,
    severity: str,
    population_affected: int = 10000,
    loss_or_delay_val: float = 0.0, # Water loss % or Waste delay hours
    is_critical_location: bool = False
) -> float:
    """
    Calculates a unified civic priority score from 0.0 to 100.0
    consistently across both WATER and WASTE civic domains.
    """
    # 1. Base Score from Severity
    severity_map = {
        "Critical": 45.0,
        "High": 30.0,
        "Medium": 18.0,
        "Low": 8.0
    }
    base = severity_map.get(severity, 15.0)

    # 2. Population Impact Factor (max 25 pts)
    pop_score = min(25.0, (population_affected / 50000.0) * 25.0)

    # 3. Domain Metric Factor (max 20 pts)
    if resource_type.upper() == "WATER":
        # Water loss % factor
        metric_score = min(20.0, (loss_or_delay_val / 40.0) * 20.0)
    else: # WASTE
        # Waste delay hours or overflow factor
        metric_score = min(20.0, (loss_or_delay_val / 48.0) * 20.0)

    # 4. Critical Location Bonus (10 pts)
    location_bonus = 10.0 if is_critical_location else 0.0

    total_score = base + pop_score + metric_score + location_bonus
    return round(min(100.0, max(5.0, total_score)), 1)

def get_priority_level(score: float) -> str:
    if score >= 75.0:
        return "Critical"
    elif score >= 50.0:
        return "High"
    elif score >= 25.0:
        return "Medium"
    else:
        return "Low"
