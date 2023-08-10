import { fetchData } from "oss-directory";
import {
  getCollectionBySlug,
  getProjectBySlug,
  ossUpsertCollection,
  ossUpsertProject,
} from "../db/entities.js";
import { CommonArgs } from "../utils/api.js";
import { logger } from "../utils/logger.js";

/**
 * Entrypoint arguments
 */
export type ImportOssDirectoryArgs = CommonArgs & {
  skipExisting?: boolean;
};

export async function importOssDirectory(
  args: ImportOssDirectoryArgs,
): Promise<void> {
  const { skipExisting } = args;
  logger.info("Importing from 'oss-directory'");
  const { projects, collections } = await fetchData();
  logger.info(
    `Found ${projects.length} projects and ${collections.length} collections`,
  );

  logger.info("Upserting projects...");
  for (let i = 0; i < projects.length; i++) {
    const p = projects[i];
    if (skipExisting && (await getProjectBySlug(p.slug))) {
      logger.info(
        `projects[${i}]: Skipping ${p.slug} because it already exists`,
      );
      continue;
    }
    logger.info(`projects[${i}]: Upserting ${p.slug}`);
    await ossUpsertProject(p);
  }

  logger.info("Upserting collections...");
  for (let i = 0; i < collections.length; i++) {
    const c = collections[i];
    if (skipExisting && (await getCollectionBySlug(c.slug))) {
      logger.info(
        `collections[${i}]: Skipping ${c.slug} because it already exists`,
      );
      continue;
    }
    logger.info(`collections[${i}]: Upserting ${c.slug}`);
    await ossUpsertCollection(c);
  }

  logger.info("Done");
}
