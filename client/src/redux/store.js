// src/redux/store.js
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import userReducer from './user/userSlice';
import themeReducer from './theme/themeSlice';
import cartReducer from './cart/cartSlice';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

const rootReducer = combineReducers({
  user: userReducer,
  theme: themeReducer,
  cart: cartReducer, // Add cart reducer to the root reducer
});

const persistConfig = {
  key: 'root',
  storage,
  version: 1,
  whitelist: ['user', 'cart'], // Add cart to whitelist to persist cart data
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'], // Ignore persist actions
      },
    }),
});

export const persistor = persistStore(store);