import { test, expect } from "@jest/globals";
import fs from "fs/promises";
import path from "path";
import os from "os";

import { HNSWLib } from "../hnswlib";
import { FakeEmbeddings } from "../../embeddings/fake";

test("Test HNSWLib.fromTexts", async () => {
  const vectorStore = await HNSWLib.fromTexts(
    ["Hello world", "Bye bye", "hello nice world"],
    [{ id: 2 }, { id: 1 }, { id: 3 }],
    new FakeEmbeddings()
  );
  expect(vectorStore.index?.getCurrentCount()).toBe(3);

  const resultOne = await vectorStore.similaritySearch("hello world", 1);
  const resultOneMetadatas = resultOne.map(({ metadata }) => metadata);
  expect(resultOneMetadatas).toEqual([{ id: 3 }]);

  const resultTwo = await vectorStore.similaritySearch("hello world", 3);
  const resultTwoMetadatas = resultTwo.map(({ metadata }) => metadata);
  expect(resultTwoMetadatas).toEqual([{ id: 2 }, { id: 1 }, { id: 3 }]);
});

test("Test HNSWLib.load and HNSWLib.save", async () => {
  const vectorStore = await HNSWLib.fromTexts(
    ["Hello world", "Bye bye", "hello nice world"],
    [{ id: 2 }, { id: 1 }, { id: 3 }],
    new FakeEmbeddings()
  );
  expect(vectorStore.index?.getCurrentCount()).toBe(3);

  const resultOne = await vectorStore.similaritySearch("hello world", 1);
  const resultOneMetadatas = resultOne.map(({ metadata }) => metadata);
  expect(resultOneMetadatas).toEqual([{ id: 3 }]);

  const resultTwo = await vectorStore.similaritySearch("hello world", 3);
  const resultTwoMetadatas = resultTwo.map(({ metadata }) => metadata);
  expect(resultTwoMetadatas).toEqual([{ id: 2 }, { id: 1 }, { id: 3 }]);

  const tempDirectory = await fs.mkdtemp(path.join(os.tmpdir(), "lcjs-"));

  console.log(tempDirectory);

  await vectorStore.save(tempDirectory);

  const loadedVectorStore = await HNSWLib.load(
    tempDirectory,
    new FakeEmbeddings()
  );

  const resultThree = await loadedVectorStore.similaritySearch(
    "hello world",
    1
  );

  const resultThreeMetadatas = resultThree.map(({ metadata }) => metadata);
  expect(resultThreeMetadatas).toEqual([{ id: 3 }]);

  const resultFour = await loadedVectorStore.similaritySearch("hello world", 3);

  const resultFourMetadatas = resultFour.map(({ metadata }) => metadata);
  expect(resultFourMetadatas).toEqual([{ id: 2 }, { id: 1 }, { id: 3 }]);
});
