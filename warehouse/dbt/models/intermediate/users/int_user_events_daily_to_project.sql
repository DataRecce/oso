{#
  This model aggregates user events to project level on
  a daily basis. It is used to calculate various 
  user engagement metrics by project.
#}

select
  from_artifact_id,
  event_source,
  project_id,
  event_type,
  TIMESTAMP_TRUNC(time, day) as bucket_day,
  SUM(amount) as amount
from {{ ref('int_events_to_project') }}
where
  event_type in (
    'COMMIT_CODE',
    'PULL_REQUEST_OPENED',
    'PULL_REQUEST_REOPENED',
    'PULL_REQUEST_CLOSED',
    'PULL_REQUEST_MERGED',
    'ISSUE_CLOSED',
    'ISSUE_OPENED',
    'ISSUE_REOPENED',
    'CONTRACT_INVOCATION_DAILY_COUNT'
  )
group by
  from_artifact_id,
  event_source,
  project_id,
  event_type,
  TIMESTAMP_TRUNC(time, day)
