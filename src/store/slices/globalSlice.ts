import { Course } from "@/types/course";
import { DraggingType } from "@/utils/enums";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export const initialState = {
  draggingType: null as DraggingType | null,
  addingCourseId: null as string | null,
  droppableId: null as string | null,
  initCourses: [] as Course[],
  seekingInfo: {
    seekingId: undefined as string | undefined,
    seekingTerm: undefined as string | undefined,
    isReadyToShow: undefined as boolean | undefined,
  },
  searchInput: '' as string,
  isTutorialModalOpen: false as boolean,
  isAboutModalOpen: false as boolean,
  isSideBarExpanded: true as boolean,
  isCourseTakenExpanded: false as boolean,
  isInitialized: false as boolean,
}

const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    setDraggingType: (state, action: PayloadAction<DraggingType | null>) => {
      state.draggingType = action.payload;
    },
    setAddingCourseId: (state, action: PayloadAction<string | null>) => {
      state.addingCourseId = action.payload;
    },
    setDroppableId: (state, action: PayloadAction<string | null>) => {
      state.droppableId = action.payload;
    },
    setInitCourses: (state, action: PayloadAction<Course[]>) => {
      action.payload.forEach((course) => { // avoid mutating passed in array
        state.initCourses.push(course);
      });
    },
    setSeekingInfo: (state, action: PayloadAction<{ seekingId?: string, seekingTerm?: string, isReadyToShow?: boolean }>) => {
      const { seekingId, seekingTerm, isReadyToShow } = action.payload;
      state.seekingInfo.isReadyToShow = isReadyToShow;

      if (!isReadyToShow) { // prepare seeking info
        state.seekingInfo.seekingId = seekingId;
        state.seekingInfo.seekingTerm = seekingTerm;
      }

      if (state.seekingInfo.seekingId && state.seekingInfo.seekingTerm) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'auto';
      }
    },
    setSearchInput: (state, action: PayloadAction<string>) => {
      state.searchInput = action.payload;
    },
    setIsTutorialModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isTutorialModalOpen = action.payload;
    },
    setIsAboutModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isAboutModalOpen = action.payload;
    },
    setIsSideBarExpanded: (state, action: PayloadAction<boolean>) => {
      state.isSideBarExpanded = action.payload;
    },
    toggleSideBarExpanded: (state) => {
      state.isSideBarExpanded = !state.isSideBarExpanded;
    },
    setIsCourseTakenExpanded: (state, action: PayloadAction<boolean>) => {
      state.isCourseTakenExpanded = action.payload;
    },
    toggleCourseTakenExpanded: (state) => {
      state.isCourseTakenExpanded = !state.isCourseTakenExpanded;
    },
    setIsInitialized: (state, action: PayloadAction<boolean>) => {
      state.isInitialized = action.payload;
    },
  },
});

export const { 
  setDraggingType, 
  setAddingCourseId, 
  setDroppableId, 
  setInitCourses, 
  setSeekingInfo, 
  setSearchInput,
  setIsTutorialModalOpen,
  setIsAboutModalOpen,
  setIsSideBarExpanded,
  toggleSideBarExpanded,
  setIsCourseTakenExpanded,
  toggleCourseTakenExpanded,
  setIsInitialized,
} = globalSlice.actions;

export default globalSlice.reducer;
