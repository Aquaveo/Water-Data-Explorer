import React, { useCallback, Fragment, useEffect, useState } from 'react';
import { Zoom, applyMatrixToPoint } from '@visx/zoom';
import { Group } from '@visx/group';
import { scaleLinear, scaleTime } from '@visx/scale';
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
// import { timeParse, timeFormat } from 'd3-time-format';
import { timeFormat } from 'd3-time-format';
import { RectClipPath } from '@visx/clip-path';
import PlotLegend from './PlotLegend';
import PlotControlMenu from './PlotControlMenu';
import VariablesControlMenu from './VariablesControlMenu';

function SiteSeries({ width, height, series}) {
  const [layout, setLayout] = useState(null);
  const [data, setData] = useState([]);

  const {
    tooltipData,
    tooltipLeft = 0,
    tooltipTop = 0,
    showTooltip,
    hideTooltip,
  } = useTooltip();

  // Define margins
  const margin = { top: 40, right: 40, bottom: 40, left: 60 };

  // Inner dimensions
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  

  // Data accessors
  const getDate = (d) => new Date(d.x);
  const getYValue = (d) => d.y;

  // Define initial scales
  const xScale = scaleTime({
    range: [0, innerWidth],
    domain: extent(data, getDate),
    nice: true,
  });

  const yScale = scaleLinear({
    range: [innerHeight, 0],
    domain: extent(data, getYValue),
    nice: true,
  });

  // Colors for each series
  const colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd'];

  // Tooltip styles
  const tooltipStyles = {
    ...defaultStyles,
    minWidth: 60,
    backgroundColor: 'rgba(44, 62, 80, 0.9)',
    color: 'white',
    fontSize: 14,
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  };

  // Date formatter
  const formatDate = timeFormat('%Y-%m-%d');

  // Bisector for finding closest data point
  const bisectDate = bisector((d) => getDate(d)).left;

  // Function to rescale x-axis based on zoom
  const rescaleXAxis = (scale, transformMatrix) => {
    const newDomain = scale.range().map((r) =>
      scale.invert((r - transformMatrix.translateX) / transformMatrix.scaleX)
    );
    return scale.copy().domain(newDomain);
  };

  // Function to rescale y-axis based on zoom
  const rescaleYAxis = (scale, transformMatrix) => {
    const newDomain = scale.range().map((r) =>
      scale.invert((r - transformMatrix.translateY) / transformMatrix.scaleY)
    );
    return scale.copy().domain(newDomain);
  };

  const handleTooltip = useCallback(
    (event, zoom) => {
      const point = localPoint(event) || { x: 0, y: 0 };
      const x = point.x - margin.left;
      const x0 = rescaleXAxis(xScale, zoom.transformMatrix).invert(x);

      const index = bisectDate(data, x0, 1);
      const d0 = data[index - 1];
      const d1 = data[index];
      let d = d0;

      if (d1 && getDate(d1)) {
        d = x0 - getDate(d0) > getDate(d1) - x0 ? d1 : d0;
      }

      // Only one series for now => push single data point
      const tooltipDataArray = [
        {
          dataPoint: d,
          seriesLabel: layout?.yaxis || 'Series', // Example label
        },
      ];

      // Calculate the tooltip's y-position
      const yPositions = tooltipDataArray.map((obj) =>
        rescaleYAxis(yScale, zoom.transformMatrix)(getYValue(obj.dataPoint))
      );
      const tooltipTopPosition = Math.min(...yPositions) + margin.top;

      showTooltip({
        tooltipData: tooltipDataArray,
        tooltipLeft: point.x,
        tooltipTop: tooltipTopPosition,
      });
    },
    [showTooltip, xScale, yScale, data, getDate, getYValue, bisectDate, margin.left, margin.top, layout]
  );

  // Updated constrain function
  const constrain = (transformMatrix) => {
    const { scaleX, scaleY, translateX, translateY } = transformMatrix;

    // Fix constrain scale
    if (scaleX < 1) transformMatrix.scaleX = 1;
    if (scaleY < 1) transformMatrix.scaleY = 1;

    // Fix constrain translate [left, top] position
    if (translateX > 0) transformMatrix.translateX = 0;
    if (translateY > 0) transformMatrix.translateY = 0;

    // Fix constrain translate [right, bottom] position
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

    // Return the constrained transform matrix
    return transformMatrix;
  };

  useEffect(() => {
    console.log("Series", series);
    if (!series) {
      return;
    }
    else{
      setLayout(series.layout);
      setData(series.series);
    }
  }, [series]);

  return (
    <div style={{ position: 'relative' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 10,
            position: 'relative',
          }}
        >
          <VariablesControlMenu />
      </div>
      {data.length > 0 ? (
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
          // Apply zoom transformations to scales
          const newXScale = rescaleXAxis(xScale, zoom.transformMatrix);
          const newYScale = rescaleYAxis(yScale, zoom.transformMatrix);

          return (
            <Fragment>
              <PlotControlMenu 
                onZoomReset={zoom.reset}
                onDownload={() => console.log('Download')}
                OnScaleChange={() => console.log('Scale Change')}
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
                {/* Main Group */}
                <Group left={margin.left} top={margin.top}>
                  {/* Wrap multiple siblings in a Fragment */}
                  <Fragment>
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
                      stroke="#d1d5db"
                      tickStroke="#d1d5db"
                      tickLabelProps={() => ({
                        fill: '#e0e0e0',
                        fontWeight: 'bold',
                        textAnchor: 'end',
                      })}
                      label={layout?.yaxis ?? 'Series'}
                      labelProps={{
                        fill: '#e0e0e0',
                        fontSize: 14,
                        strokeWidth: 0,
                        paintOrder: 'stroke',
                        fontFamily: 'sans-serif',
                      }}
                    />
                    <AxisBottom
                      scale={newXScale}
                      top={innerHeight}
                      stroke="#d1d5db"
                      tickFormat={formatDate}
                      tickStroke="#d1d5db"
                      tickLabelProps={() => ({
                        fill: '#e0e0e0',
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
                        data={data}
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
                            stroke="#d1d5db"
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

                    {/* Zoom overlay */}
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
                        // no event.preventDefault()
                        const point = localPoint(event) || { x: 0, y: 0 };
                        const delta = -event.deltaY / 500; // Adjust sensitivity
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
                  </Fragment>
                </Group>
              </svg>
                <div
                  style={{
                    position: 'absolute',
                    top: margin.top + 10,
                    right: margin.right + 10,
                    backgroundColor: 'rgba(0,0,0,0.2)',
                    padding: '6px 10px',
                    borderRadius: 4,
                  }}
                >
                  <PlotLegend label={layout} />
              </div>



              {/* Tooltip */}
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
       ) : null }
    </div>
  );
}

export default SiteSeries;
