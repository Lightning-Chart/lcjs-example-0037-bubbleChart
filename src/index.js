const lcjs = require('@arction/lcjs')
const { lightningChart, PointShape, Themes } = lcjs

const chart = lightningChart()
    .ChartXY({
        theme: Themes[new URLSearchParams(window.location.search).get('theme') || 'darkGold'] || undefined
    })
    .setTitle('Bubble Chart with 3 KPIs and data grouping')

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
        // kpi3 value is also stored in data point for use in cursor formatting
        data[i] = { x, y, size, kpi3 }
    }
    return data
})

// Bubble chart can be visualized with a PointSeries.
// This supports several display methods, including the one used here where each data point has an individual size.
// In this example, separate groups of data are split into their own series. This way they can be toggled on/off from the legend.

const groupsSeries = groupsData.map((data, i) => {
    const pointSeries = chart
        .addPointSeries({ pointShape: PointShape.Circle })
        .setName(`Group ${i + 1}`)
        .setPointFillStyle((fillStyle) => fillStyle.setA(100))
        .setIndividualPointSizeEnabled(true)
        .add(data)
        .setCursorResultTableFormatter((builder, _, x, y, dataPoint) =>
            builder
                .addRow(pointSeries.getName())
                .addRow(pointSeries.axisX.getTitle(), '', pointSeries.axisX.formatValue(dataPoint.x))
                .addRow(pointSeries.axisY.getTitle(), '', pointSeries.axisY.formatValue(dataPoint.y))
                .addRow('KPI 3', '', dataPoint.kpi3.toFixed(3)),
        )
    return pointSeries
})

chart.getDefaultAxisX().setTitle('KPI X').fit(false)
chart.getDefaultAxisY().setTitle('KPI Y').fit(false)

const legend = chart.addLegendBox().add(chart)
