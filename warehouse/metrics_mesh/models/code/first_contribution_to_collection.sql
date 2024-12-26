/* 
TODO: This is a hack for now to fix performance issues with the contributor
classifications. We should use some kind of factory for this in the future to 
get all dimensions 
*/
MODEL (
  name metrics.first_contribution_to_collection,
  kind FULL,
  partitioned_by (YEAR("time"), "event_source"),
  grain (time, event_source, from_artifact_id, to_collection_id)
);

SELECT
  MIN(time) AS time,
  first_contribution_to_project.event_source,
  first_contribution_to_project.from_artifact_id,
  projects_by_collection_v1.collection_id AS to_collection_id
FROM metrics.first_contribution_to_project
INNER JOIN metrics.projects_by_collection_v1
  ON first_contribution_to_project.to_project_id = projects_by_collection_v1.project_id
GROUP BY
  event_source,
  from_artifact_id,
  to_collection_id