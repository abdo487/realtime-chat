import { createAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import Cookies from "js-cookie";

export const USER_STATUS = {
  ONLINE: "online",
  OFFLINE: "offline",
};

const initialState = {
  isLoading: true,
  isMessagesFetching: false,
  openedChat: {
    user: null, // the user with whom the chat is opened
    messages: [],
  },
};

export const openChat = createAsyncThunk("chat/openChat", async (id) => {
  const response = await fetch(`${import.meta.env.VITE_API}/users/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${Cookies.get("jwt")}`,
    },
  });
  return response.json();
});

export const fetchMessages = createAsyncThunk(
  "chat/fetchMessages",
  async (id) => {
    const response = await fetch(
      `${import.meta.env.VITE_API}/conversations/${id}/messages`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${Cookies.get("jwt")}`,
        },
      }
    );
    return response.json();
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    closeChat: (state) => {
      state.isLoading = true;
      state.openedChat = {
        user: null,
        messages: [],
      };
    },
    isMessagesFetching: (state, action) => {
      state.isMessagesFetching = action.payload;
    },
    AddMessage: (state, action) => {
      // check if the message already exists
      const message = state.openedChat.messages.find(
        (msg) => msg._id === action.payload._id
      );
      if (!message) {
        state.openedChat.messages.push(action.payload);
      }
    },
    removeMessage: (state, action) => {
      state.openedChat.messages = state.openedChat.messages.filter(
        (msg) => msg._id !== action.payload._id
      );
    },
    setUserStatus: (state, action) => {
      if (state.openedChat.user) state.openedChat.user.status = action.payload;
    },
    updateMessageStatusToSeen: (state, action) => {
      const message = action.payload;
      if (message) {
        const msg = state.openedChat.messages.find(
          (msg) => msg._id === message._id
        );
        if (msg) {
          msg.status = "SEEN";
        }
      }
    },
    updateMessageStatusToDelivered: (state, action) => {
      const message = action.payload;
      if (message) {
        const msg = state.openedChat.messages.find(
          (msg) => msg._id === message._id
        );
        if (msg) {
          msg.status = "DELIVERED";
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.isMessagesFetching = true;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.isMessagesFetching = false;
        if (action.payload.type === "success") {
          state.openedChat.messages = action.payload.data;
        } else {
          toast.error(action.payload.message, { theme: "dark" });
        }
      })
      .addCase(fetchMessages.rejected, (state) => {
        state.isMessagesFetching = false;
        toast.error("Failed to fetch messages", { theme: "dark" });
      })
      .addCase(openChat.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(openChat.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.type != "success") {
          state.isLoading = true;
          state.openedChat = {
            user: null,
            messages: [],
          };
          toast.error(action.payload.message, { theme: "dark" });
          return;
        }
        action.payload.data.status = USER_STATUS.OFFLINE;
        state.openedChat.user = action.payload.data;
      })
      .addCase(openChat.rejected, (state) => {
        state.isLoading = false;
        toast.error("Failed to fetch user", { theme: "dark" });
      });
  },
});

export const {
  closeChat,
  isMessagesFetching,
  AddMessage,
  removeMessage,
  setUserStatus,
  updateMessageStatusToSeen,
  updateMessageStatusToDelivered,
} = chatSlice.actions;
export default chatSlice.reducer;
