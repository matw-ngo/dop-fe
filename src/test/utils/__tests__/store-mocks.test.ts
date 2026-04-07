/**
 * Tests for Store Mocking Utilities
 *
 * Verifies that createStoreMock and createSimpleStoreMock work correctly
 * with Zustand stores that use subscribeWithSelector middleware.
 */

import { describe, expect, it, vi } from "vitest";
import { createSimpleStoreMock, createStoreMock } from "../store-mocks";

// Mock store type for testing
interface TestStore {
  count: number;
  name: string;
  increment: () => void;
  setName: (name: string) => void;
}

// Type helper for tests
type TestStoreHook = () => TestStore;

describe("Store Mocking Utilities", () => {
  describe("createStoreMock", () => {
    it("should create a mock that returns full state when no selector provided", () => {
      const mock = createStoreMock<TestStoreHook>({
        count: 0,
        name: "test",
      });

      const result = mock.mockImplementation() as TestStore;

      expect(result).toEqual({
        count: 0,
        name: "test",
      });
    });

    it("should support selector functions", () => {
      const mock = createStoreMock<TestStoreHook>({
        count: 5,
        name: "test",
      });

      const count = mock.mockImplementation((state: TestStore) => state.count);
      const name = mock.mockImplementation((state: TestStore) => state.name);

      expect(count).toBe(5);
      expect(name).toBe("test");
    });

    it("should allow updating state with setState", () => {
      const mock = createStoreMock<TestStoreHook>({
        count: 0,
        name: "initial",
      });

      mock.setState({ count: 10 });

      const result = mock.mockImplementation() as TestStore;
      expect(result.count).toBe(10);
      expect(result.name).toBe("initial");
    });

    it("should merge state updates", () => {
      const mock = createStoreMock<TestStoreHook>({
        count: 0,
        name: "initial",
      });

      mock.setState({ count: 5 });
      mock.setState({ name: "updated" });

      const result = mock.mockImplementation() as TestStore;
      expect(result.count).toBe(5);
      expect(result.name).toBe("updated");
    });

    it("should return current state with getState", () => {
      const mock = createStoreMock<TestStoreHook>({
        count: 0,
        name: "test",
      });

      mock.setState({ count: 42 });

      const state = mock.getState() as TestStore;
      expect(state.count).toBe(42);
      expect(state.name).toBe("test");
    });

    it("should reset state to initial values with resetState", () => {
      const mock = createStoreMock<TestStoreHook>({
        count: 0,
        name: "initial",
      });

      mock.setState({ count: 100, name: "changed" });
      expect((mock.getState() as TestStore).count).toBe(100);

      mock.resetState();

      const state = mock.getState() as TestStore;
      expect(state.count).toBe(0);
      expect(state.name).toBe("initial");
    });

    it("should work with mock functions as state values", () => {
      const incrementMock = vi.fn();
      const setNameMock = vi.fn();

      const mock = createStoreMock<TestStoreHook>({
        count: 0,
        increment: incrementMock,
        setName: setNameMock,
      });

      const state = mock.mockImplementation() as TestStore;
      state.increment();
      state.setName("new name");

      expect(incrementMock).toHaveBeenCalled();
      expect(setNameMock).toHaveBeenCalledWith("new name");
    });
  });

  describe("createSimpleStoreMock", () => {
    it("should create a mock that returns full state when no selector provided", () => {
      const mock = createSimpleStoreMock<TestStoreHook>({
        count: 10,
        name: "simple",
      });

      const result = mock() as TestStore;

      expect(result).toEqual({
        count: 10,
        name: "simple",
      });
    });

    it("should support selector functions", () => {
      const mock = createSimpleStoreMock<TestStoreHook>({
        count: 15,
        name: "simple",
      });

      const count = mock((state: TestStore) => state.count);
      const name = mock((state: TestStore) => state.name);

      expect(count).toBe(15);
      expect(name).toBe("simple");
    });

    it("should be a vi.fn mock", () => {
      const mock = createSimpleStoreMock<TestStoreHook>({
        count: 0,
      });

      mock();
      mock((state: TestStore) => state.count);

      expect(mock).toHaveBeenCalledTimes(2);
    });
  });

  describe("Integration with Zustand pattern", () => {
    interface ModalStore {
      isVisible: boolean;
      config: { id: string } | null;
      error: string | null;
      showModal: () => void;
      hideModal: () => void;
    }

    type ModalStoreHook = () => ModalStore;

    it("should work with typical Zustand usage pattern", () => {
      const mock = createStoreMock<ModalStoreHook>({
        isVisible: false,
        config: null,
        error: null,
        showModal: vi.fn(),
        hideModal: vi.fn(),
      });

      // Simulate component using selector
      const isVisible = mock.mockImplementation((state) => state.isVisible);
      expect(isVisible).toBe(false);

      // Simulate state update
      mock.setState({ isVisible: true });

      // Simulate component re-reading
      const isVisibleAfter = mock.mockImplementation(
        (state) => state.isVisible,
      );
      expect(isVisibleAfter).toBe(true);
    });

    it("should handle beforeEach reset pattern", () => {
      const mock = createStoreMock<TestStoreHook>({
        count: 0,
        name: "initial",
      });

      // Simulate test 1
      mock.setState({ count: 5, name: "test1" });
      expect((mock.getState() as TestStore).count).toBe(5);

      // Simulate beforeEach reset
      mock.resetState();

      // Simulate test 2
      const state = mock.getState() as TestStore;
      expect(state.count).toBe(0);
      expect(state.name).toBe("initial");
    });
  });
});
