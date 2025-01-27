import React from "react";


const PlotLegend = ({label, margin}) => {
  return (
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
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                marginRight: 10,
                padding: '2px 6px',
                border: '1px solid #ddd',
                borderRadius: 4,
                backgroundColor: '#2c3e50',
            }}
        >
        <div
            style={{
            backgroundColor: '#1f77b4',
            width: 10,
            height: 10,
            marginRight: 5,
            }}
        />
        <div
            style={{
            color: '#f0f0f0',
            fontSize: 14,
            }}
        >
            {label?.yaxis ?? 'Series'}
        </div>
        </div>
    </div>
  );
};

export default PlotLegend;