import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedTab: "Dashboard",
  documentsToReturn: 3,
  persona: "relationship-manager",
  foundationModel: "anthropic.claude-v2:1",
  fmTemperature: 0.7,
  fmMaxTokens: 1400,  
  context: ""
  // Add other sidebar settings here
};

const context = {
  "CRM": "You are the chatbot for a customer relationship management (CRM) system. The system is used to manage customer relationships. The chatbot will provide you with information about the data inside the crm context {fileContents}. based on this context, you will be able to answer questions about the data. User query: {query}", 

  "Financial Data": "`You are the chatbot for a Fanancial Report. The system is used to manage customer relationships. The chatbot will provide you with information about the data inside the crm context {fileContents}. based on this context, you will be able to answer questions about the data.  User query: {query}`", 
  "Gopher": "`You are the chatbot for a Gopher. The system is used to manage customer relationships. The chatbot will provide you with information about the data inside the gopher context {fileContents}. based on this context, you will be able to answer questions about the data.  User query: {query}`. If you not found the answer inside the gopher context then only give me no data available. Give me only answer which exist inside of the context, donot add anything from your side.", 

  "Business Insights": `You are the chatbot for a Financial Report. The system is used to manage customer relationships. The chatbot will provide you with information about the data inside the context financial credit Management: {creditManagement} , financial Health And Performance: {financialHealthAndPerformance} and risk management: {riskManagement}. Based on this context, you will be able to answer questions about the data.

              You are a banker analyzing the financial data. Using the provided data, generate detailed business insights focusing on the cash flow trends, key financial activities, and recommendations for financial management. Include specific examples from the data to support your analysis.

              **Data Provided:**
              - Customer Records
              - Communication History
              - Follow-Ups and Reminders
              - Task Management
              - Customer Profile Access Notifications
              - Credit Card Transactions
              - Closing House Transactions
              - Business Transactions

              **Recommendations for Financial Management:**
              1. **Expense Management:** Suggestions for monitoring and optimizing high travel and marketing expenses.
              2. **Revenue Generation:** Strategies for ensuring timely client payments and maintaining positive cash flow.
              3. **Financial Reviews:** Importance of regular financial reviews to align expenses with budgeted amounts.
              4. **Cash Reserves:** Advice on maintaining adequate cash reserves for unexpected expenses.

              Use specific data points and examples to support your analysis and provide a thorough and insightful financial overview.

              User query: {query}`, 

  "Personalized Advice": `
                You are the chatbot for a Financial Report. The system is used to manage customer relationships. The chatbot will provide you with information about the data inside the CRM context financial: {fileContents} and CRM: {crmContents}. Based on this context, you will be able to answer questions about the data.

                You are a banker analyzing the financial data for Acme Corporation. Using the provided data, generate detailed business insights focusing on the cash flow trends, key financial activities, and personalized recommendations for financial management. Include specific examples from the data to support your analysis.

                **Data Provided:**
                - Customer Records
                - Communication History
                - Follow-Ups and Reminders
                - Task Management
                - Customer Profile Access Notifications
                - Credit Card Transactions
                - Closing House Transactions
                - Business Transactions

                **Personalized Recommendations for Financial Management:**
                1. **Expense Management:** Provide suggestions for monitoring and optimizing high travel and marketing expenses.
                2. **Revenue Generation:** Recommend strategies for ensuring timely client payments and maintaining positive cash flow.
                3. **Financial Reviews:** Highlight the importance of regular financial reviews to align expenses with budgeted amounts.
                4. **Cash Reserves:** Offer advice on maintaining adequate cash reserves for unexpected expenses.

                Use specific data points and examples to support your analysis and provide a thorough and insightful financial overview for Acme Corporation.

                User query: {query}
  `, 
  "Know Your Customer": `
    You are the chatbot for a Banker Customer Relationship Management (CRM) system. context: {docs}. Using this context, you will answer questions about the data.

    User query:
    {query}
  `
}

const sidebarSlice = createSlice({
  name: "sidebar",
  initialState,
  reducers: {
    setSelectedTab(state, action) {
      state.selectedTab = action.payload;

      if(action.payload == "Dashboard"){
        state.context = "";
      }else {
        state.context = context[action.payload];
      }
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
