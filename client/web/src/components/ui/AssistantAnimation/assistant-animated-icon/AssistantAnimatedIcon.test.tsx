// SPDX-FileCopyrightText: 2026 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { render } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockLottie } = vi.hoisted(() => ({
  mockLottie: vi.fn(() => null),
}));

vi.mock("lottie-react", () => ({
  Lottie: mockLottie,
}));

import { AssistantAnimatedIcon } from "./AssistantAnimatedIcon";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getProps = (callIndex = 0) =>
  (mockLottie as any).mock.calls[callIndex][0] as Record<string, unknown>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getLatestProps = () => getProps((mockLottie as any).mock.calls.length - 1);

describe("AssistantAnimatedIcon", () => {
  beforeEach(() => {
    mockLottie.mockClear();
  });

  it("provides defined src for every valid phase", () => {
    const validPhases = ["listening", "speaking", "standby", "error"] as const;

    for (const phase of validPhases) {
      mockLottie.mockClear();
      render(<AssistantAnimatedIcon phase={phase} theme="blue" />);
      expect(getProps().src).toBeDefined();
    }
  });

  it("passes src (not animationData) to Lottie", () => {
    render(<AssistantAnimatedIcon phase="speaking" theme="blue" />);

    expect(mockLottie).toHaveBeenCalled();
    const props = getProps();
    expect(props).toHaveProperty("src");
    expect(props).not.toHaveProperty("animationData");
    expect(props.src).toBeDefined();
  });

  it("passes speed as a prop to Lottie", () => {
    render(<AssistantAnimatedIcon phase="speaking" theme="blue" speed={2} />);

    expect(getProps().speed).toBe(2);
  });

  it("passes a subscriptions.ready callback to Lottie", () => {
    render(<AssistantAnimatedIcon phase="speaking" theme="blue" />);

    const props = getProps();
    expect(props.subscriptions).toBeDefined();
    expect(
      (props.subscriptions as Record<string, unknown>).ready,
    ).toBeTypeOf("function");
  });

  it("calls play() via subscriptions.ready when animation loads", () => {
    const playFn = vi.fn();
    const refSpy = { play: playFn, stop: vi.fn(), pause: vi.fn() };

    render(<AssistantAnimatedIcon phase="speaking" theme="blue" />);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lottieRef = (mockLottie as any).mock.calls[0][0].lottieRef;
    lottieRef.current = refSpy;

    const { ready } = getLatestProps().subscriptions as { ready: () => void };
    ready();

    expect(playFn).toHaveBeenCalled();
  });

  it("does not call play() via ready when isStopped is true", () => {
    const playFn = vi.fn();
    const stopFn = vi.fn();
    const refSpy = { play: playFn, stop: stopFn, pause: vi.fn() };

    render(
      <AssistantAnimatedIcon phase="speaking" theme="blue" isStopped />,
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lottieRef = (mockLottie as any).mock.calls[0][0].lottieRef;
    lottieRef.current = refSpy;

    const { ready } = getLatestProps().subscriptions as { ready: () => void };
    ready();

    expect(playFn).not.toHaveBeenCalled();
  });
});
