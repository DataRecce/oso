import os
from google.cloud import bigquery, storage

from .synchronizer import BigQueryCloudSQLSynchronizer, TableSyncConfig, TableSyncMode
from .cloudsql import CloudSQLClient

from dotenv import load_dotenv


def run():
    load_dotenv()
    bq = bigquery.Client()
    storage_client = storage.Client()
    cloudsql = CloudSQLClient.connect(
        os.environ.get("GOOGLE_PROJECT_ID"),
        os.environ.get("CLOUDSQL_REGION"),
        os.environ.get("CLOUDSQL_INSTANCE_ID"),
        os.environ.get("CLOUDSQL_DB_USER"),
        os.environ.get("CLOUDSQL_DB_PASSWORD"),
        os.environ.get("CLOUDSQL_DB_NAME"),
    )

    synchronizer = BigQueryCloudSQLSynchronizer(
        bq,
        storage_client,
        cloudsql,
        "oso-production",
        "opensource_observer",
        [
            TableSyncConfig(
                TableSyncMode.OVERWRITE,
                "events_daily_to_project",
                "events_daily_to_project",
            ),
            TableSyncConfig(
                TableSyncMode.OVERWRITE,
                "events_monthly_to_project",
                "events_monthly_to_project",
            ),
            TableSyncConfig(
                TableSyncMode.OVERWRITE,
                "events_weekly_to_project",
                "events_weekly_to_project",
            ),
            TableSyncConfig(
                TableSyncMode.OVERWRITE,
                "events_daily_from_project",
                "events_daily_from_project",
            ),
            TableSyncConfig(
                TableSyncMode.OVERWRITE,
                "events_monthly_from_project",
                "events_monthly_from_project",
            ),
            TableSyncConfig(
                TableSyncMode.OVERWRITE,
                "events_weekly_from_project",
                "events_weekly_from_project",
            ),
            TableSyncConfig(
                TableSyncMode.OVERWRITE,
                "events_daily_to_artifact",
                "events_daily_to_artifact",
            ),
            TableSyncConfig(
                TableSyncMode.OVERWRITE,
                "events_monthly_to_artifact",
                "events_monthly_to_artifact",
            ),
            TableSyncConfig(
                TableSyncMode.OVERWRITE,
                "events_weekly_to_artifact",
                "events_weekly_to_artifact",
            ),
            TableSyncConfig(
                TableSyncMode.OVERWRITE,
                "events_daily_from_artifact",
                "events_daily_from_artifact",
            ),
            TableSyncConfig(
                TableSyncMode.OVERWRITE,
                "events_monthly_from_artifact",
                "events_monthly_from_artifact",
            ),
            TableSyncConfig(
                TableSyncMode.OVERWRITE,
                "events_weekly_from_artifact",
                "events_weekly_from_artifact",
            ),
            TableSyncConfig(
                TableSyncMode.OVERWRITE,
                "first_contribution_to_project",
                "first_contribution_to_project",
            ),
            TableSyncConfig(
                TableSyncMode.OVERWRITE,
                "last_contribution_to_project",
                "last_contribution_to_project",
            ),
            TableSyncConfig(
                TableSyncMode.OVERWRITE,
                "users_monthly_to_project",
                "users_monthly_to_project",
            ),
            TableSyncConfig(
                TableSyncMode.OVERWRITE,
                "event_types",
                "event_types",
            ),
            TableSyncConfig(
                TableSyncMode.OVERWRITE,
                "artifacts",
                "artifacts",
            ),
            TableSyncConfig(
                TableSyncMode.OVERWRITE,
                "projects",
                "projects",
            ),
            TableSyncConfig(
                TableSyncMode.OVERWRITE,
                "collections",
                "collections",
            ),
            TableSyncConfig(
                TableSyncMode.OVERWRITE,
                "projects_by_collection_slugs",
                "projects_by_collection_slugs",
            ),
            TableSyncConfig(
                TableSyncMode.OVERWRITE,
                "artifacts_by_project_slugs",
                "artifacts_by_project_slugs",
            ),
        ],
        "oso-csv-exports",
    )
    synchronizer.sync()
