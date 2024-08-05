const lcjs = require('@lightningchart/lcjs')
const { lightningChart, PointShape, emptyLine, Themes } = lcjs

const chart = lightningChart({
            resourcesBaseUrl: new URL(document.head.baseURI).origin + new URL(document.head.baseURI).pathname + 'resources/',
        })
    .ChartXY({
        theme: Themes[new URLSearchParams(window.location.search).get('theme') || 'darkGold'] || undefined,
    })
    .setTitle('Bubble Chart with 3 KPIs and data grouping')
    .setCursorMode('show-nearest')
    .setCursorFormatting((_, hit) => {
        // `hit` contains only built-in data point properties, such as "x", "y", "size", "id" etc.
        // in order to use custom user-specific properties, such as "kpi3", we have to use ids to find the original data point from users data set.
        const iSeries = chart.getSeries().indexOf(hit.series)
        const origSample = groupsData[iSeries][hit.id]
        return [
            [hit.series],
            ['X', '', hit.axisX.formatValue(hit.x)],
            ['Y', '', hit.axisY.formatValue(hit.y)],
            ['KPI3', '', origSample.kpi3.toFixed(3)],
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
        data[i] = { id: i, x, y, size, kpi3 }
    }
    return data
})

// Bubble chart can be visualized with a PointSeries.
// This supports several display methods, including the one used here where each data point has an individual size.
// In this example, separate groups of data are split into their own series. This way they can be toggled on/off from the legend.

const groupsSeries = groupsData.map((data, i) => {
    const pointSeries = chart
        .addPointLineAreaSeries({ dataPattern: null, sizes: true, ids: true })
        .setName(`Group ${i + 1}`)
        .setStrokeStyle(emptyLine)
        .setPointFillStyle((fillStyle) => fillStyle.setA(100))
        .appendJSON(data, { x: 'x', y: 'y', size: 'size', id: 'id' })
    return pointSeries
})

chart.getDefaultAxisX().setTitle('KPI X').fit(false)
chart.getDefaultAxisY().setTitle('KPI Y').fit(false)

const legend = chart.addLegendBox().add(chart)
