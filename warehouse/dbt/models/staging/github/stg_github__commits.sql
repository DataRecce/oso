{#
  Turns all push events into their commit objects
#}

select
  ghpe.created_at as created_at,
  ghpe.repository_id as repository_id,
  ghpe.repository_name as repository_name,
  ghpe.push_id as push_id,
  ghpe.ref as ref,
  ghpe.actor_id as actor_id,
  ghpe.actor_login as actor_login,
  JSON_VALUE(commit_details, "$.sha") as sha,
  JSON_VALUE(commit_details, "$.author.email") as author_email,
  JSON_VALUE(commit_details, "$.author.name") as author_name,
  CAST(JSON_VALUE(commit_details, "$.distinct") as BOOL) as is_distinct,
  JSON_VALUE(commit_details, "$.url") as api_url
from {{ ref('stg_github__push_events') }} as ghpe
cross join UNNEST(ghpe.commits) as commit_details
