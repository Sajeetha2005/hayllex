import React from "react"
import { Responsive, WidthProvider } from "react-grid-layout"
import "react-grid-layout/css/styles.css"
import "react-resizable/css/styles.css"

const ResponsiveGridLayout = WidthProvider(Responsive)

const BREAKPOINTS = { lg: 1200, md: 768, sm: 0 }
const COLS = { lg: 12, md: 8, sm: 4 }

/**
 * Reusable DashboardGrid component that wraps react-grid-layout
 * with the app's standard breakpoints and column config.
 */
function DashboardGrid({
    layouts,
    onLayoutChange,
    rowHeight = 80,
    isDraggable = true,
    isResizable = true,
    draggableHandle,
    margin = [12, 12],
    children
}) {
    return (
        <ResponsiveGridLayout
            className="dashboard-layout"
            layouts={layouts}
            breakpoints={BREAKPOINTS}
            cols={COLS}
            rowHeight={rowHeight}
            onLayoutChange={onLayoutChange}
            isDraggable={isDraggable}
            isResizable={isResizable}
            draggableHandle={draggableHandle}
            margin={margin}
        >
            {children}
        </ResponsiveGridLayout>
    )
}

export { BREAKPOINTS, COLS }
export default DashboardGrid
