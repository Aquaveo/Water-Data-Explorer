import React, { useCallback, Fragment, useEffect, useState } from 'react';
import { Zoom, applyMatrixToPoint } from '@visx/zoom';
import { Group } from '@visx/group';
import { scaleLinear, scaleTime, scaleLog } from '@visx/scale'; // ← import scaleLog
import { AxisLeft, AxisBottom } from '@visx/axis';
import { LinePath, Line } from '@visx/shape';
import { extent, bisector } from 'd3-array';
import { GridRows, GridColumns } from '@visx/grid';
import {
  useTooltip,
  TooltipWithBounds,
  defaultStyles,
} from '@visx/tooltip';
import { localPoint } from '@visx/event';
import { GlyphCircle } from '@visx/glyph';
import { timeFormat } from 'd3-time-format';
import { RectClipPath } from '@visx/clip-path';
import PlotLegend from './PlotLegend';
import PlotControlMenu from './PlotControlMenu';
import VariablesControlMenu from './VariablesControlMenu';

function SiteSeries({ width, height, data, showLoadingToast }) {
  const layout = data?.layout;
  const series = data?.series || [];

  // State to track the current scale type for y-axis.
  const [yScaleType, setYScaleType] = useState('linear');

  // A function we’ll pass to <PlotControlMenu> that sets the y-axis scale to log.
  // You could also make this a toggle (log vs. linear), or use a dropdown, etc.
  const handleScaleChange = useCallback(() => {
    setYScaleType((prev) => (prev === 'linear' ? 'log' : 'linear'));
  }, []);

  // 2. Convert series to CSV and trigger a download
  const handleDownloadCSV = useCallback(() => {
    if (!series.length) return;

    // CSV header
    let csv = 'Date,Value\n';
    // Convert each data point
    series.forEach((pt) => {
      // Example: 2023-02-15T12:00:00Z, 123.45
      // If needed, format your date string more nicely
      csv += `${pt.x},${pt.y}\n`;
    });

    // Convert to a Blob or create a data URI
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    // Create a temporary <a> to download the CSV
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'timeseries.csv');
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [series]);


  // Tooltip-related
  const {
    tooltipData,
    tooltipLeft = 0,
    tooltipTop = 0,
    showTooltip,
    hideTooltip,
  } = useTooltip();

  // Define margins
  const margin = { top: 40, right: 40, bottom: 40, left: 60 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Data accessors
  const getDate = (d) => new Date(d.x);
  const getYValue = (d) => d.y;

  // xScale is always time-based in this example
  const xScale = scaleTime({
    range: [0, innerWidth],
    domain: extent(series, getDate),
    nice: true,
  });

  /**
   * 2. Conditionally build the yScale based on the scale type.
   *    scaleLog requires strictly positive values,
   *    so you may need to handle zero/negative data.
   */
  const yScale = React.useMemo(() => {
    const [min, max] = extent(series, getYValue);

    if (yScaleType === 'log') {
      // Ensure domain is strictly positive
      const safeMin = min > 0 ? min : 1e-6; 
      const safeMax = max > 0 ? max : 1;
      return scaleLog({
        range: [innerHeight, 0],
        domain: [safeMin, safeMax],
        clamp: true,     // or nice: false if you prefer
      });
    }
    // Default: linear
    return scaleLinear({
      range: [innerHeight, 0],
      domain: extent(series, getYValue),
      nice: true,
    });
  }, [yScaleType, series, getYValue, innerHeight]);

  // Colors
  const colors = ['#1f77b4'];

  // Tooltip styling
  const tooltipStyles = {
    ...defaultStyles,
    minWidth: 60,
    backgroundColor: 'rgba(44, 62, 80, 0.9)',
    color: 'white',
    fontSize: 14,
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  };

  // Format for date axis
  const formatDate = timeFormat('%Y-%m-%d');
  const bisectDate = bisector((d) => getDate(d)).left;

  // Rescale for zooming
  const rescaleXAxis = (scale, transformMatrix) => {
    const newDomain = scale.range().map((r) =>
      scale.invert((r - transformMatrix.translateX) / transformMatrix.scaleX)
    );
    return scale.copy().domain(newDomain);
  };
  const rescaleYAxis = (scale, transformMatrix) => {
    const newDomain = scale.range().map((r) =>
      scale.invert((r - transformMatrix.translateY) / transformMatrix.scaleY)
    );
    return scale.copy().domain(newDomain);
  };

  // Tooltip logic
  const handleTooltip = useCallback(
    (event, zoom) => {
      const point = localPoint(event) || { x: 0, y: 0 };
      const x = point.x - margin.left;

      // Rescale the x-axis based on the zoom transform
      const newXScale = rescaleXAxis(xScale, zoom.transformMatrix);
      const x0 = newXScale.invert(x);

      const index = bisectDate(series, x0, 1);
      const d0 = series[index - 1];
      const d1 = series[index];
      let d = d0;
      if (d1 && getDate(d1)) {
        d = x0 - getDate(d0) > getDate(d1) - x0 ? d1 : d0;
      }

      // For simplicity, we only show one line, but you can expand to multiple.
      const tooltipDataArray = [
        {
          dataPoint: d,
          seriesLabel: layout?.yaxis || 'Series',
        },
      ];

      // Calculate the y-position for the tooltip
      const newYScale = rescaleYAxis(yScale, zoom.transformMatrix);
      const yPositions = tooltipDataArray.map((obj) =>
        newYScale(getYValue(obj.dataPoint))
      );
      const tooltipTopPosition = Math.min(...yPositions) + margin.top;

      showTooltip({
        tooltipData: tooltipDataArray,
        tooltipLeft: point.x,
        tooltipTop: tooltipTopPosition,
      });
    },
    [
      showTooltip,
      xScale,
      yScale,
      series,
      getDate,
      getYValue,
      bisectDate,
      margin.left,
      margin.top,
      layout,
    ]
  );

  // Zoom constraints
  const constrain = (transformMatrix) => {
    const { scaleX, scaleY, translateX, translateY } = transformMatrix;

    // Prevent zooming out beyond 1x
    if (scaleX < 1) transformMatrix.scaleX = 1;
    if (scaleY < 1) transformMatrix.scaleY = 1;

    // Prevent panning beyond the left/top
    if (translateX > 0) transformMatrix.translateX = 0;
    if (translateY > 0) transformMatrix.translateY = 0;

    // Prevent panning beyond the right/bottom
    const max = applyMatrixToPoint(transformMatrix, {
      x: innerWidth,
      y: innerHeight,
    });
    if (max.x < innerWidth) {
      transformMatrix.translateX += innerWidth - max.x;
    }
    if (max.y < innerHeight) {
      transformMatrix.translateY += innerHeight - max.y;
    }
    return transformMatrix;
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Existing UI controls */}
      <VariablesControlMenu showLoadingToast={showLoadingToast} />

      {/* Plot only if we have data */}
      {series.length > 0 ? (
        <Zoom
          width={innerWidth}
          height={innerHeight}
          scaleXMin={1}
          scaleXMax={10}
          scaleYMin={1}
          scaleYMax={10}
          initialTransformMatrix={{
            scaleX: 1,
            scaleY: 1,
            translateX: 0,
            translateY: 0,
            skewX: 0,
            skewY: 0,
          }}
          constrain={constrain}
        >
          {(zoom) => {
            // Apply zoom to xScale & yScale
            const newXScale = rescaleXAxis(xScale, zoom.transformMatrix);
            const newYScale = rescaleYAxis(yScale, zoom.transformMatrix);

            return (
              <Fragment>
                <PlotControlMenu 
                  onZoomReset={zoom.reset}
                  onDownload={handleDownloadCSV}
                  OnScaleChange={handleScaleChange}
                />
                <svg
                  width={width}
                  height={height}
                  style={{
                    cursor: zoom.isDragging ? 'grabbing' : 'grab',
                  }}
                >
                  <RectClipPath
                    id="chart-clip"
                    x={0}
                    y={0}
                    width={innerWidth}
                    height={innerHeight}
                  />
                  <Group left={margin.left} top={margin.top}>
                    <GridRows
                      scale={newYScale}
                      width={innerWidth}
                      height={innerHeight}
                      stroke="#7f8c8d"
                      strokeOpacity={0.1}
                      strokeWidth={1}
                    />
                    <GridColumns
                      scale={newXScale}
                      width={innerWidth}
                      height={innerHeight}
                      stroke="#7f8c8d"
                      strokeOpacity={0.1}
                      strokeWidth={1}
                    />
                    <AxisLeft
                      scale={newYScale}
                      stroke="#8f99a7"
                      tickStroke="#8f99a7"
                      tickLabelProps={() => ({
                        fill: '#8f99a7',
                        fontSize: 12,
                        fontWeight: 'bold',
                        textAnchor: 'end',
                      })}
                      label={layout?.yaxis ?? 'Series'}
                      labelProps={{
                        fill: '#8f99a7',
                        fontSize: 12,
                        strokeWidth: 0,
                        paintOrder: 'stroke',
                        fontFamily: 'sans-serif',
                      }}
                    />
                    <AxisBottom
                      scale={newXScale}
                      top={innerHeight}
                      stroke="#8f99a7"
                      tickFormat={formatDate}
                      tickStroke="#8f99a7"
                      tickLabelProps={() => ({
                        fill: '#8f99a7',
                        fontSize: 12,
                        fontWeight: 'bold',
                        textAnchor: 'middle',
                      })}
                    />

                    {/* Chart content clipped */}
                    <Group clipPath="url(#chart-clip)">
                      <LinePath
                        stroke={colors[0]}
                        strokeWidth={2}
                        data={series}
                        x={(d) => newXScale(getDate(d)) ?? 0}
                        y={(d) => newYScale(getYValue(d)) ?? 0}
                      />

                      {/* Tooltip line & glyphs */}
                      {tooltipData && tooltipData.length > 0 && (
                        <Group>
                          <Line
                            from={{
                              x: tooltipLeft - margin.left,
                              y: 0,
                            }}
                            to={{
                              x: tooltipLeft - margin.left,
                              y: innerHeight,
                            }}
                            stroke="#8f99a7"
                            strokeWidth={1.5}
                            pointerEvents="none"
                            strokeDasharray="6,3"
                          />
                          {tooltipData.map((d, i) => (
                            <GlyphCircle
                              key={`glyph-${i}`}
                              left={newXScale(getDate(d.dataPoint))}
                              top={newYScale(getYValue(d.dataPoint))}
                              size={110}
                              fill={colors[0]}
                            />
                          ))}
                        </Group>
                      )}
                    </Group>

                    {/* Zoom overlay for panning & tooltips */}
                    <rect
                      width={innerWidth}
                      height={innerHeight}
                      fill="transparent"
                      onMouseDown={zoom.dragStart}
                      onMouseMove={(event) => {
                        zoom.dragMove(event);
                        handleTooltip(event, zoom);
                      }}
                      onMouseUp={zoom.dragEnd}
                      onMouseLeave={() => {
                        if (zoom.isDragging) zoom.dragEnd();
                        hideTooltip();
                      }}
                      onTouchStart={zoom.dragStart}
                      onTouchMove={zoom.dragMove}
                      onTouchEnd={zoom.dragEnd}
                      onDoubleClick={(event) => {
                        const point = localPoint(event) || { x: 0, y: 0 };
                        zoom.scale({
                          scaleX: 1.5,
                          scaleY: 1.5,
                          point,
                        });
                      }}
                      onWheel={(event) => {
                        const point = localPoint(event) || { x: 0, y: 0 };
                        const delta = -event.deltaY / 500;
                        const scale = 1 + delta;
                        zoom.scale({
                          scaleX: scale,
                          scaleY: scale,
                          point,
                        });
                      }}
                      style={{
                        cursor: zoom.isDragging ? 'grabbing' : 'grab',
                      }}
                    />
                  </Group>
                </svg>

                {/* Tooltip display */}
                {tooltipData && tooltipData.length > 0 && (
                  <TooltipWithBounds
                    top={tooltipTop}
                    left={tooltipLeft}
                    style={tooltipStyles}
                  >
                    <Fragment>
                      <div>
                        <strong>Date: </strong>
                        {formatDate(getDate(tooltipData[0].dataPoint))}
                      </div>
                      {tooltipData.map((d, i) => (
                        <div key={`tooltip-${i}`}>
                          <strong style={{ color: colors[0] }}>
                            {d.seriesLabel}:
                          </strong>{' '}
                          {getYValue(d.dataPoint)}
                        </div>
                      ))}
                    </Fragment>
                  </TooltipWithBounds>
                )}
              </Fragment>
            );
          }}
        </Zoom>
      ) : null}
    </div>
  );
}

export default SiteSeries;
