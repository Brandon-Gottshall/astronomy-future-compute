import { PHASE_SETUP, PHASE_LIVE } from "./session.js";

export const INITIAL_STATE = { total: 0, index: 0, phase: PHASE_SETUP, browsing: false };

function clampIndex(total, value) {
  if (total <= 0) return 0;
  return Math.max(0, Math.min(value, total - 1));
}

export function slideReducer(state, action) {
  switch (action.type) {
    case "beginPresentation":
      return { ...state, phase: PHASE_LIVE, index: 0, browsing: false };
    case "next":
      if (state.phase !== PHASE_LIVE) return state;
      return { ...state, index: clampIndex(state.total, state.index + 1) };
    case "prev":
      if (state.phase !== PHASE_LIVE) return state;
      return { ...state, index: clampIndex(state.total, state.index - 1) };
    case "jump":
      if (state.phase !== PHASE_LIVE) return state;
      return { ...state, index: clampIndex(state.total, action.to) };
    case "detachForBrowse":
      return { ...state, browsing: true };
    case "syncFromStage":
      return {
        ...state,
        phase: action.phase ?? state.phase,
        index: clampIndex(state.total, action.index ?? state.index),
        browsing: false,
      };
    case "setTotal":
      return { ...state, total: action.total };
    default:
      return state;
  }
}
