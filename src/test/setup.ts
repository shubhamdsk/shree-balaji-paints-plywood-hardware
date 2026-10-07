import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";
import { stubColorScheme } from "@/test/mocks/match-media";

// jsdom does not implement the modal methods of <dialog>.
if (!HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.open = false;
  };
}

// jsdom does not implement matchMedia.
beforeEach(() => stubColorScheme(false));

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  localStorage.clear();
  delete document.documentElement.dataset.theme;
});
