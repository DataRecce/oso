import { DateTime } from "luxon";
import { ArtifactRepository } from "../db/artifacts.js";
import { AppDataSource } from "../db/data-source.js";
import { EventRepository } from "../db/events.js";
import {
  ArtifactNamespace,
  ArtifactType,
  EventType,
} from "../db/orm-entities.js";
import { clearDb, withDbDescribe } from "../db/testing.js";
import { BatchEventRecorder, IFlusher } from "./recorder.js";
import { generateEventTypeStrategy } from "./types.js";

type Callback = () => void;

class TestFlusher implements IFlusher {
  flushCallback: Callback | undefined;
  lastNotify: number;

  clear(): void {}

  flush(): void {
    if (this.flushCallback) {
      this.flushCallback();
    }
  }

  onFlush(cb: () => void): void {
    this.flushCallback = cb;
  }

  notify(size: number): void {
    this.lastNotify = size;
  }
}

withDbDescribe("BatchEventRecorder", () => {
  let flusher: TestFlusher;
  beforeEach(async () => {
    await clearDb();

    flusher = new TestFlusher();
  });

  it("should setup the recorder", async () => {
    const recorder = new BatchEventRecorder(
      EventRepository,
      ArtifactRepository,
      flusher,
      {
        maxBatchSize: 3,
        timeoutMs: 30000,
      },
    );
    recorder.setRange({
      startDate: DateTime.now().minus({ month: 1 }),
      endDate: DateTime.now().plus({ month: 1 }),
    });
    recorder.registerEventType(
      EventType.COMMIT_CODE,
      generateEventTypeStrategy(EventType.COMMIT_CODE),
    );
    recorder.setActorScope(
      [ArtifactNamespace.GITHUB],
      [ArtifactType.GITHUB_USER, ArtifactType.GIT_REPOSITORY],
    );
    const testEvent = {
      amount: Math.random(),
      time: DateTime.now(),
      type: EventType.COMMIT_CODE,
      to: {
        name: "test",
        namespace: ArtifactNamespace.GITHUB,
        type: ArtifactType.GIT_REPOSITORY,
      },
      from: {
        name: "contributor",
        namespace: ArtifactNamespace.GITHUB,
        type: ArtifactType.GITHUB_USER,
      },
      sourceId: "test123",
    };
    const record0Promise = recorder.record(testEvent);
    const record0Wait = recorder.wait(EventType.COMMIT_CODE);
    flusher.flush();
    await record0Wait;
    await record0Promise;

    // No errors should be thrown if we attempt to write twice
    const record1 = recorder.record(testEvent);
    flusher.flush();
    await record1;

    // Check that the values are correct
    const results = await EventRepository.find({
      relations: {
        to: true,
        from: true,
      },
      where: {
        type: EventType.COMMIT_CODE,
      },
    });
    expect(results.length).toEqual(1);
    expect(results[0].sourceId).toEqual(testEvent.sourceId);
    expect(results[0].amount).toEqual(testEvent.amount);
    expect(results[0].to.name).toEqual(testEvent.to.name);
    expect(results[0].to.namespace).toEqual(testEvent.to.namespace);
    expect(results[0].to.type).toEqual(testEvent.to.type);
    expect(results[0].to.id).toBeDefined();
    expect(results[0].from?.name).toEqual(testEvent.from.name);
    expect(results[0].from?.namespace).toEqual(testEvent.from.namespace);
    expect(results[0].from?.type).toEqual(testEvent.from.type);
    expect(results[0].from?.id).toBeDefined();

    const outOfScopeEvent = {
      amount: Math.random(),
      time: DateTime.now(),
      type: EventType.CONTRACT_INVOKED,
      to: {
        name: "test",
        namespace: ArtifactNamespace.ETHEREUM,
        type: ArtifactType.CONTRACT_ADDRESS,
      },
      from: {
        name: "contributor",
        namespace: ArtifactNamespace.ETHEREUM,
        type: ArtifactType.EOA_ADDRESS,
      },
      sourceId: "test456",
    };

    const errorHandler = new Promise((_resolve, reject) => {
      recorder.addListener("error", reject);
    });

    const record2 = recorder.record(outOfScopeEvent);
    flusher.flush();

    await expect(async () => {
      return record2;
    }).rejects.toThrow();

    await expect(errorHandler).rejects.toThrow();
  });

  afterAll(async () => {
    try {
      await AppDataSource.destroy();
    } catch (_e) {
      console.log("data source already disconnected");
    }
  });
});