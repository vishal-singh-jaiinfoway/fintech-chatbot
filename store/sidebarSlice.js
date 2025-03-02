import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedTab: "Business Insights",
  documentsToReturn: 3,
  persona: "Controller (Chief Accounting Officer)",
  foundationModel: "anthropic.claude-3-5-sonnet-20240620-v1:0",
  fmTemperature: 1,
  fmMaxTokens: 2000,  
  context: ""
  // Add other sidebar settings here
};



const sidebarSlice = createSlice({
  name: "sidebar",
  initialState,
  reducers: {
    setSelectedTab(state, action) {
      state.selectedTab = action.payload;
    },
    setDocumentsToReturn(state, action) {
      state.documentsToReturn = action.payload;
    },
    setPersona(state, action) {
      state.persona = action.payload;
    },
    setFoundationModel(state, action) {
      state.foundationModel = action.payload;
    },
    setFmTemperature(state, action) {
      state.fmTemperature = action.payload;
    },
    setFmMaxTokens(state, action) {
      state.fmMaxTokens = action.payload;
    },
    setContext(state, action) {
      state.context = action.payload;
    }
    // Add other reducer actions for settings
  },
});

export const {
  selectedTab,
  setSelectedTab,
  setDocumentsToReturn,
  setPersona,
  setFoundationModel,
  setFmTemperature,
  setFmMaxTokens,
  setContext,
  ...otherActions
} = sidebarSlice.actions;

export default sidebarSlice.reducer;
