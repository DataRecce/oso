{#
  This model aggregates user events to project level on
  a monthly basis. It is used to calculate various 
  user engagement metrics by project.
#}

select
  from_artifact_id,
  event_source,
  project_id,
  event_type,
  TIMESTAMP_TRUNC(bucket_day, month) as bucket_month,
  COUNT(distinct bucket_day) as count_days,
  SUM(amount) as total_amount
from {{ ref('int_user_events_daily_to_project') }}
group by
  from_artifact_id,
  event_source,
  project_id,
  event_type,
  TIMESTAMP_TRUNC(bucket_day, month)
