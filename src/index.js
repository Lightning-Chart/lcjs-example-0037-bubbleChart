const lcjs = require('@lightningchart/lcjs')
const { lightningChart, PointShape, emptyLine, Themes } = lcjs

const chart = lightningChart({
            resourcesBaseUrl: new URL(document.head.baseURI).origin + new URL(document.head.baseURI).pathname + 'resources/',
        })
    .ChartXY({
        theme: (() => {
    const t = Themes[new URLSearchParams(window.location.search).get('theme') || 'darkGold'] || undefined
    const smallView = window.devicePixelRatio >= 2
    if (!window.__lcjsDebugOverlay) {
        window.__lcjsDebugOverlay = document.createElement('div')
        window.__lcjsDebugOverlay.style.cssText = 'position:fixed;top:0;left:0;background:rgba(0,0,0,0.7);color:#fff;padding:4px 8px;z-index:99999;font:12px monospace;pointer-events:none'
        if (document.body) document.body.appendChild(window.__lcjsDebugOverlay)
        setInterval(() => {
            if (!window.__lcjsDebugOverlay.parentNode && document.body) document.body.appendChild(window.__lcjsDebugOverlay)
            window.__lcjsDebugOverlay.textContent = window.innerWidth + 'x' + window.innerHeight + ' dpr=' + window.devicePixelRatio + ' small=' + (window.devicePixelRatio >= 2)
        }, 500)
    }
    return t && smallView ? lcjs.scaleTheme(t, 0.5) : t
})(),
textRenderer: window.devicePixelRatio >= 2 ? lcjs.htmlTextRenderer : undefined,
    })
    .setTitle('Bubble Chart with 3 KPIs and data grouping')
    .setCursorMode('show-nearest')
    .setCursorFormatting((_, hit) => {
        return [
            [{ component: hit.series, rowFillStyle: chart.getTheme().cursorResultTableHeaderBackgroundFillStyle }],
            ['X', '', hit.axisX.formatValue(hit.x)],
            ['Y', '', hit.axisY.formatValue(hit.y)],
            // NOTE: sample.kpi3 is not used in actual visualization, but it can still be accessed as long as its pushed to the data set.
            ['KPI3', '', hit.sample.kpi3.toFixed(3)],
        ]
    })

// Generate random data set for example purposes
// color by group where data point belongs
// x = kpi
// y = kpi
// size = kpi
const groupsData = new Array(3).fill(0).map((_) => {
    const dataCount = 1_000
    const data = new Array(dataCount)
    for (let i = 0; i < dataCount; i += 1) {
        const x = Math.random()
        const y = Math.random()
        const kpi3 = Math.random()
        // Map 3rd performance indicator value to a point size as pixels.
        const size = 1 + 19 * kpi3 ** 3
        data[i] = { x, y, size, kpi3 }
    }
    return data
})

// Bubble chart can be visualized with a PointSeries.
// This supports several display methods, including the one used here where each data point has an individual size.
// In this example, separate groups of data are split into their own series. This way they can be toggled on/off from the legend.

const groupsSeries = groupsData.map((data, i) => {
    const pointSeries = chart
        .addPointSeries({
            schema: {
                x: { pattern: null },
                y: { pattern: null },
                kpi3: { pattern: null },
                size: { pattern: null },
            },
        })
        .setName(`Group ${i + 1}`)
        .setPointFillStyle((fillStyle) => fillStyle.setA(100))
        .appendJSON(data)
    return pointSeries
})

chart.getDefaultAxisX().setTitle('KPI X').fit(false)
chart.getDefaultAxisY().setTitle('KPI Y').fit(false)
