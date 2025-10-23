import { create } from "zustand"

interface TeacherSidebarStore {
  isCollapsed: boolean
  activeSection: string
  toggleCollapsed: () => void
  setActiveSection: (section: string) => void
}

export const useTeacherSidebar = create<TeacherSidebarStore>((set) => ({
  isCollapsed: false,
  activeSection: "dashboard",
  toggleCollapsed: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
  setActiveSection: (section) => set({ activeSection: section }),
}))
