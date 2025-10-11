import { create } from "zustand"
import { persist } from "zustand/middleware"

interface SidebarState {
  // Scroll state
  scrollPosition: number
  isUserScrolling: boolean
  hasRestoredScroll: boolean

  // Expanded sections state
  expandedSections: {
    academics: boolean
    documents: boolean
    studentLife: boolean
    tools: boolean
  }

  // Actions
  setScrollPosition: (position: number) => void
  setIsUserScrolling: (isScrolling: boolean) => void
  setHasRestoredScroll: (hasRestored: boolean) => void
  toggleSection: (sectionKey: string) => void
  restoreScrollPosition: (element: HTMLElement) => void
  saveScrollPosition: (position: number) => void
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set, get) => ({
      // Initial state
      scrollPosition: 0,
      isUserScrolling: false,
      hasRestoredScroll: false,
      expandedSections: {
        academics: true,
        documents: false,
        studentLife: false,
        tools: false,
      },

      // Actions
      setScrollPosition: (position: number) => {
        set({ scrollPosition: position })
      },

      setIsUserScrolling: (isScrolling: boolean) => {
        set({ isUserScrolling: isScrolling })
      },

      setHasRestoredScroll: (hasRestored: boolean) => {
        set({ hasRestoredScroll: hasRestored })
      },

      toggleSection: (sectionKey: string) => {
        set((state) => ({
          expandedSections: {
            ...state.expandedSections,
            [sectionKey]: !state.expandedSections[sectionKey as keyof typeof state.expandedSections],
          },
        }))
      },

      restoreScrollPosition: (element: HTMLElement) => {
        const { scrollPosition, isUserScrolling, hasRestoredScroll } = get()

        if (hasRestoredScroll || isUserScrolling) return

        // Use requestAnimationFrame for smooth restoration
        requestAnimationFrame(() => {
          if (element && !isUserScrolling) {
            element.scrollTo({
              top: scrollPosition,
              behavior: "smooth",
            })
            set({ hasRestoredScroll: true })
          }
        })
      },

      saveScrollPosition: (position: number) => {
        const { isUserScrolling } = get()

        if (isUserScrolling) {
          set({ scrollPosition: position })
        }
      },
    }),
    {
      name: "sidebar-storage",
      partialize: (state) => ({
        scrollPosition: state.scrollPosition,
        expandedSections: state.expandedSections,
      }),
    },
  ),
)
