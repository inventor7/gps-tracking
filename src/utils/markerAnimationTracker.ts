import { ref } from "vue";
import { createLogger } from "./logger";
import type { AnimationDebugInfo } from "@/types/debug";

const logger = createLogger("AnimationTracker");

interface AnimationState {
  id: string;
  startTime: number;
  duration: number;
  startPosition: google.maps.LatLngLiteral;
  currentPosition: google.maps.LatLngLiteral;
  targetPosition: google.maps.LatLngLiteral;
  progress: number;
  fps: number;
  frameCount: number;
  lastFrameTime: number;
}

class MarkerAnimationTracker {
  private animations = new Map<string, AnimationState>();
  private subscribers = new Set<(animations: AnimationDebugInfo[]) => void>();

  trackAnimation(
    id: string,
    startPosition: google.maps.LatLngLiteral,
    targetPosition: google.maps.LatLngLiteral,
    duration: number
  ) {
    const state: AnimationState = {
      id,
      startTime: performance.now(),
      duration,
      startPosition,
      currentPosition: startPosition,
      targetPosition,
      progress: 0,
      fps: 0,
      frameCount: 0,
      lastFrameTime: performance.now(),
    };

    this.animations.set(id, state);
    this.notifySubscribers();
  }

  updateProgress(
    id: string,
    progress: number,
    currentPosition: google.maps.LatLngLiteral
  ) {
    const state = this.animations.get(id);
    if (!state) return;

    const now = performance.now();
    const frameTime = now - state.lastFrameTime;

    state.progress = progress * 100;
    state.frameCount++;
    state.fps = 1000 / frameTime;
    state.lastFrameTime = now;
    state.currentPosition = currentPosition;

    this.notifySubscribers();
  }

  completeAnimation(id: string) {
    const state = this.animations.get(id);
    if (!state) return;

    const totalTime = performance.now() - state.startTime;
    const avgFps = state.frameCount / (totalTime / 1000);

    this.animations.delete(id);
    this.notifySubscribers();
  }

  cancelAnimation(id: string) {
    if (this.animations.has(id)) {
      this.animations.delete(id);
      this.notifySubscribers();
    }
  }

  getActiveAnimations(): AnimationDebugInfo[] {
    return Array.from(this.animations.values()).map((state) => ({
      id: state.id,
      startTime: state.startTime,
      duration: state.duration,
      progress: state.progress,
      fps: state.fps,
      frameCount: state.frameCount,
      startPosition: state.startPosition,
      currentPosition: state.currentPosition,
      targetPosition: state.targetPosition,
    }));
  }

  subscribe(callback: (animations: AnimationDebugInfo[]) => void) {
    this.subscribers.add(callback);
    callback(this.getActiveAnimations());
    return () => this.subscribers.delete(callback);
  }

  private notifySubscribers() {
    const animations = this.getActiveAnimations();
    this.subscribers.forEach((callback) => callback(animations));
  }

  getAnimationMetrics(id: string) {
    const state = this.animations.get(id);
    if (!state) return null;

    const now = performance.now();
    const elapsed = now - state.startTime;

    return {
      progress: state.progress,
      elapsed,
      remainingTime: Math.max(0, state.duration - elapsed),
      fps: state.fps,
      frameCount: state.frameCount,
      distance: google.maps.geometry.spherical.computeDistanceBetween(
        new google.maps.LatLng(state.startPosition),
        new google.maps.LatLng(state.targetPosition)
      ),
      averageSpeed: this.calculateAverageSpeed(state),
    };
  }

  private calculateAverageSpeed(state: AnimationState): number {
    const distance = google.maps.geometry.spherical.computeDistanceBetween(
      new google.maps.LatLng(state.startPosition),
      new google.maps.LatLng(state.currentPosition)
    );
    const elapsed = (performance.now() - state.startTime) / 1000; // Convert to seconds
    return elapsed > 0 ? (distance / elapsed) * 3.6 : 0; // Convert m/s to km/h
  }
}

// Create and export singleton instance
export const markerAnimationTracker = new MarkerAnimationTracker();
